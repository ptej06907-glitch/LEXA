import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFParse } from 'pdf-parse'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const serverDirectory = path.resolve(scriptDirectory, '..')
const projectDirectory = path.resolve(serverDirectory, '..')
const outputDirectory = path.join(serverDirectory, 'data', 'legal-corpus')
const requestedPdfDirectory = process.argv.indexOf('--pdf-dir')
const localPdfDirectory = requestedPdfDirectory >= 0
  ? path.resolve(projectDirectory, process.argv[requestedPdfDirectory + 1])
  : path.join(projectDirectory, 'tmp', 'legal-corpus')

const SOURCES = [
  {
    id: 'bns',
    shortName: 'BNS',
    title: 'The Bharatiya Nyaya Sanhita, 2023',
    actNumber: '45 of 2023',
    effectiveDate: '2024-07-01',
    applicabilityNote: 'The 23 February 2024 commencement notification excluded BNS section 106(2). Do not treat section 106(2) as in force unless a later official notification is retrieved and verified.',
    sourceAsOf: '2025-10-06',
    sourceUrl: 'https://www.indiacode.nic.in/bitstream/123456789/20062/1/a202345.pdf',
    bodyStartPage: 16,
    minimumPages: 100,
  },
  {
    id: 'bnss',
    shortName: 'BNSS',
    title: 'The Bharatiya Nagarik Suraksha Sanhita, 2023',
    actNumber: '46 of 2023',
    effectiveDate: '2024-07-01',
    applicabilityNote: 'The 23 February 2024 commencement notification excluded the BNSS First Schedule entry relating to BNS section 106(2). Verify any later official commencement notification before relying on that entry.',
    sourceAsOf: '2023-12-25',
    sourceUrl: 'https://www.mha.gov.in/sites/default/files/250884_2_english_01042024.pdf',
    bodyStartPage: 1,
    minimumPages: 240,
  },
  {
    id: 'bsa',
    shortName: 'BSA',
    title: 'The Bharatiya Sakshya Adhiniyam, 2023',
    actNumber: '47 of 2023',
    effectiveDate: '2024-07-01',
    applicabilityNote: 'The Act was brought into force on 1 July 2024 by notification S.O. 849(E) dated 23 February 2024.',
    sourceAsOf: '2023-12-25',
    sourceUrl: 'https://www.mha.gov.in/sites/default/files/250882_english_01042024.pdf',
    bodyStartPage: 1,
    minimumPages: 40,
  },
]

const CHUNK_SIZE = 1800
const CHUNK_OVERLAP = 180

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function cleanPageText(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((item) => item && !/^\d{1,3}$/.test(item))
    .filter((item) => !/THE GAZETTE OF INDIA EXTRAORDINARY/i.test(item))
    .filter((item) => !/^SEC\.\s*1\]/i.test(item))
    .join(' ')
    .replace(/_{5,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

async function extractPages(buffer) {
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.pages.map((page) => cleanPageText(page.text))
  } finally {
    await parser.destroy()
  }
}

function chunkPage(text, pageNumber, source) {
  const chunks = []
  let start = 0
  let index = 0

  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length)
    if (end < text.length) {
      const sentenceBoundary = text.lastIndexOf('. ', end)
      if (sentenceBoundary > start + CHUNK_SIZE * 0.6) end = sentenceBoundary + 1
    }

    const content = text.slice(start, end).trim()
    if (content.length >= 80) {
      chunks.push({
        id: `${source.shortName}-p${pageNumber}-c${index + 1}`,
        page: pageNumber,
        content,
      })
      index += 1
    }

    if (end >= text.length) break
    start = Math.max(end - CHUNK_OVERLAP, start + 1)
  }

  return chunks
}

async function obtainPdf(source) {
  await mkdir(localPdfDirectory, { recursive: true })
  const pdfPath = path.join(localPdfDirectory, `${source.id}.pdf`)

  try {
    return { pdfPath, buffer: await readFile(pdfPath) }
  } catch {
    const response = await fetch(source.sourceUrl, { signal: AbortSignal.timeout(90_000) })
    if (!response.ok) throw new Error(`Could not download ${source.shortName}: HTTP ${response.status}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile(pdfPath, buffer)
    return { pdfPath, buffer }
  }
}

async function buildSource(source) {
  const { buffer } = await obtainPdf(source)
  if (buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error(`${source.shortName} source is not a PDF`)

  const pages = await extractPages(buffer)
  if (pages.length < source.minimumPages) {
    throw new Error(`${source.shortName} extracted only ${pages.length} pages; expected at least ${source.minimumPages}`)
  }

  const chunks = pages.flatMap((text, index) => chunkPage(text, index + 1, source))
  const characterCount = chunks.reduce((total, chunk) => total + chunk.content.length, 0)
  if (chunks.length < source.minimumPages || characterCount < 50_000) {
    throw new Error(`${source.shortName} extraction failed corpus integrity thresholds`)
  }

  const checksumSha256 = sha256(buffer)
  const corpus = {
    schemaVersion: 1,
    ...source,
    checksumSha256,
    pageCount: pages.length,
    chunkCount: chunks.length,
    characterCount,
    chunks,
  }

  await writeFile(path.join(outputDirectory, `${source.id}.json`), `${JSON.stringify(corpus)}\n`)
  return {
    id: source.id,
    shortName: source.shortName,
    title: source.title,
    actNumber: source.actNumber,
    effectiveDate: source.effectiveDate,
    applicabilityNote: source.applicabilityNote,
    sourceAsOf: source.sourceAsOf,
    sourceUrl: source.sourceUrl,
    checksumSha256,
    pageCount: pages.length,
    chunkCount: chunks.length,
    characterCount,
  }
}

await mkdir(outputDirectory, { recursive: true })
const acts = []
for (const source of SOURCES) acts.push(await buildSource(source))

const manifest = {
  schemaVersion: 1,
  corpusVersion: new Date().toISOString().slice(0, 10),
  generatedAt: new Date().toISOString(),
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
  acts,
}

await writeFile(path.join(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Legal corpus generated:', acts.map(({ shortName, pageCount, chunkCount }) => ({ shortName, pageCount, chunkCount })))
