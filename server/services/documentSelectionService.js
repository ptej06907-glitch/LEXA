const DEFAULT_MAX_CHARS = 18000
const DEFAULT_CHUNK_SIZE = 2200
const CHUNK_LABEL_BUDGET = 100

const RISK_TERMS = [
  'automatic renewal', 'auto-renew', 'non-refundable', 'no refund', 'penalty', 'liquidated damages',
  'indemnity', 'indemnify', 'unlimited liability', 'limitation of liability', 'waive', 'waiver',
  'sole discretion', 'without notice', 'terminate', 'termination', 'arbitration', 'jurisdiction',
  'personal data', 'privacy', 'confidential', 'intellectual property', 'assignment', 'perpetual',
  'exclusive', 'breach', 'default', 'interest', 'late fee', 'security deposit', 'force majeure',
  'governing law', 'warranty', 'disclaimer', 'third party', 'share', 'sell', 'consent',
]

function normaliseDocumentText(value) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function splitIntoChunks(text, chunkSize) {
  const chunks = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length)
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf('\n\n', end), text.lastIndexOf('. ', end))
      if (boundary > start + Math.floor(chunkSize * 0.55)) end = boundary + 1
    }

    const content = text.slice(start, end).trim()
    if (content) chunks.push({ content, start, end, index: chunks.length })
    start = end
  }

  return chunks
}

function scoreChunk(chunk) {
  const lower = chunk.content.toLowerCase()
  let score = 0
  for (const term of RISK_TERMS) {
    if (lower.includes(term)) score += term.includes(' ') ? 4 : 2
  }
  score += (lower.match(/\b(?:clause|section|schedule|annexure)\b/g) || []).length
  score += (lower.match(/\b(?:shall|must|may not|prohibited)\b/g) || []).length * 0.25
  return score
}

export function selectDocumentExcerpts(value, options = {}) {
  const maxChars = options.maxChars || DEFAULT_MAX_CHARS
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE
  const text = normaliseDocumentText(value)
  if (!text) return { text: '', selectedCharacters: 0, documentCharacters: 0, chunksSelected: 0, totalChunks: 0 }
  if (text.length <= maxChars) {
    return { text, selectedCharacters: text.length, documentCharacters: text.length, chunksSelected: 1, totalChunks: 1 }
  }

  const chunks = splitIntoChunks(text, chunkSize)
  const selected = new Map()
  const addChunk = (chunk) => {
    if (chunk) selected.set(chunk.index, chunk)
  }

  addChunk(chunks[0])
  addChunk(chunks[chunks.length - 1])

  const ranked = chunks
    .slice(1, -1)
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)

  const chunkCost = (chunk) => chunk.content.length + CHUNK_LABEL_BUDGET
  let selectedLength = [...selected.values()].reduce((total, chunk) => total + chunkCost(chunk), 0)
  for (const chunk of ranked) {
    if (selectedLength + chunkCost(chunk) > maxChars) continue
    addChunk(chunk)
    selectedLength += chunkCost(chunk)
  }

  const ordered = [...selected.values()].sort((a, b) => a.index - b.index)
  const excerptText = ordered.map((chunk, index) => (
    `[DOCUMENT EXCERPT ${index + 1} / original characters ${chunk.start + 1}-${chunk.end}]\n${chunk.content}`
  )).join('\n\n')
  const selectedContentCharacters = ordered.reduce((total, chunk) => total + chunk.content.length, 0)

  return {
    text: excerptText,
    selectedCharacters: selectedContentCharacters,
    documentCharacters: text.length,
    chunksSelected: ordered.length,
    totalChunks: chunks.length,
  }
}

export const DOCUMENT_SELECTION_LIMITS = Object.freeze({
  maxChars: DEFAULT_MAX_CHARS,
  chunkSize: DEFAULT_CHUNK_SIZE,
})
