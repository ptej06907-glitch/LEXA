import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serviceDirectory = path.dirname(fileURLToPath(import.meta.url))
const corpusDirectory = path.resolve(serviceDirectory, '..', 'data', 'legal-corpus')
const manifest = JSON.parse(readFileSync(path.join(corpusDirectory, 'manifest.json'), 'utf8'))

const STOP_WORDS = new Set([
  'a', 'about', 'after', 'all', 'also', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because',
  'been', 'before', 'being', 'but', 'by', 'can', 'could', 'do', 'does', 'for', 'from', 'had', 'has',
  'have', 'he', 'her', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'law',
  'legal', 'may', 'me', 'my', 'not', 'of', 'on', 'or', 'our', 'she', 'should', 'so', 'some',
  'that', 'the', 'their', 'them', 'there', 'they', 'this', 'to', 'under', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'who', 'will', 'with', 'would', 'you', 'your',
])

const QUERY_EXPANSIONS = new Map([
  ['fir', ['information', 'cognizable', 'police', 'report']],
  ['stole', ['stolen', 'theft']],
  ['stolen', ['theft']],
  ['scam', ['cheating', 'fraud']],
  ['cheated', ['cheating', 'deception']],
  ['hit', ['hurt', 'assault']],
  ['beaten', ['hurt', 'assault']],
  ['threat', ['intimidation']],
  ['threatened', ['intimidation']],
  ['rape', ['sexual', 'consent']],
  ['harassed', ['harassment', 'intimidation']],
  ['harassment', ['intimidation', 'woman']],
  ['evidence', ['document', 'electronic', 'proof']],
  ['digital', ['electronic', 'record']],
  ['phone', ['electronic', 'record']],
  ['bail', ['bond', 'custody']],
])

function normaliseToken(token) {
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3)
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2)
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2)
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1)
  return token
}

function tokenise(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(normaliseToken)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

function queryTokens(value) {
  const tokens = tokenise(value)
  const expanded = [...tokens]
  for (const token of tokens) expanded.push(...(QUERY_EXPANSIONS.get(token) || []))
  return [...new Set(expanded.map(normaliseToken))]
}

const acts = manifest.acts.map((act) => {
  const corpus = JSON.parse(readFileSync(path.join(corpusDirectory, `${act.id}.json`), 'utf8'))
  if (corpus.checksumSha256 !== act.checksumSha256 || corpus.schemaVersion !== manifest.schemaVersion) {
    throw new Error(`Legal corpus integrity mismatch for ${act.shortName}`)
  }
  return corpus
})

const indexedChunks = acts.flatMap((act) => act.chunks.map((chunk) => {
  const tokens = tokenise(chunk.content)
  const frequencies = new Map()
  for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1)
  return { act, chunk, frequencies, tokenCount: tokens.length }
}))

const documentFrequency = new Map()
for (const { frequencies } of indexedChunks) {
  for (const token of frequencies.keys()) documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1)
}

function scoreChunk(indexed, tokens, rawQuery) {
  let score = 0
  let matchedTokens = 0
  for (const token of tokens) {
    const frequency = indexed.frequencies.get(token) || 0
    if (!frequency) continue
    matchedTokens += 1
    const inverseDocumentFrequency = Math.log((indexedChunks.length + 1) / ((documentFrequency.get(token) || 0) + 1)) + 1
    score += (1 + Math.log(frequency)) * inverseDocumentFrequency
  }

  if (!matchedTokens) return 0
  const lowerQuery = rawQuery.toLowerCase()
  if (lowerQuery.includes(indexed.act.shortName.toLowerCase())) score += 4
  if (lowerQuery.includes(indexed.act.title.toLowerCase())) score += 6
  if (/\b\d{1,3}\.\s/.test(indexed.chunk.content)) score += 2
  if (indexed.chunk.page < indexed.act.bodyStartPage) score *= 0.2
  if (/arrangement of sections/i.test(indexed.chunk.content)) score *= 0.55
  if (/THE GAZETTE OF INDIA EXTRAORDINARY/i.test(indexed.chunk.content)) score *= 0.5
  if (indexed.chunk.content.length < 700) score *= 0.7
  return score / Math.sqrt(Math.max(indexed.tokenCount, 180) / 250)
}

export function searchLocalLegalCorpus(value, options = {}) {
  const maxResults = Math.min(Math.max(options.maxResults || 5, 1), 8)
  const rawQuery = String(value || '').trim()
  const tokens = queryTokens(rawQuery)
  if (!tokens.length) return []

  const ranked = indexedChunks
    .map((indexed) => ({ indexed, score: scoreChunk(indexed, tokens, rawQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  const results = []
  const usedPages = new Set()
  for (const { indexed, score } of ranked) {
    const pageKey = `${indexed.act.id}:${indexed.chunk.page}`
    if (usedPages.has(pageKey)) continue
    usedPages.add(pageKey)
    results.push({
      title: `${indexed.act.shortName} (${indexed.act.actNumber}), page ${indexed.chunk.page}`,
      url: `${indexed.act.sourceUrl}#page=${indexed.chunk.page}`,
      content: indexed.chunk.content,
      score,
      sourceType: 'local-corpus',
      actId: indexed.act.id,
      page: indexed.chunk.page,
      sourceAsOf: indexed.act.sourceAsOf,
      applicabilityNote: indexed.act.applicabilityNote,
    })
    if (results.length >= maxResults) break
  }

  return results
}

export function getLegalCorpusStatus() {
  return {
    schemaVersion: manifest.schemaVersion,
    corpusVersion: manifest.corpusVersion,
    acts: manifest.acts.map(({ id, shortName, sourceAsOf, checksumSha256, pageCount, chunkCount }) => ({
      id,
      shortName,
      sourceAsOf,
      checksumSha256,
      pageCount,
      chunkCount,
    })),
  }
}
