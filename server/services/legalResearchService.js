import Groq from 'groq-sdk'
import { searchLocalLegalCorpus } from './localLegalCorpusService.js'

const SEARCH_DOMAINS = [
  'indiacode.nic.in',
  'sci.gov.in',
  '*.sci.gov.in',
  'ecourts.gov.in',
  '*.ecourts.gov.in',
  '*.highcourt.nic.in',
  'doj.gov.in',
  'legislative.gov.in',
  'mha.gov.in',
  'labour.gov.in',
  'consumeraffairs.nic.in',
  'rbi.org.in',
  'sebi.gov.in',
  'cybercrime.gov.in',
  'meity.gov.in',
  'nalsa.gov.in',
  'ncw.gov.in',
]

const TRUSTED_HOSTS = new Set([
  'indiacode.nic.in',
  'sci.gov.in',
  'ecourts.gov.in',
  'doj.gov.in',
  'legislative.gov.in',
  'mha.gov.in',
  'labour.gov.in',
  'consumeraffairs.nic.in',
  'rbi.org.in',
  'sebi.gov.in',
  'cybercrime.gov.in',
  'meity.gov.in',
  'nalsa.gov.in',
  'ncw.gov.in',
])

const TRUSTED_SUFFIXES = ['.sci.gov.in', '.ecourts.gov.in', '.highcourt.nic.in']
const CACHE_TTL_MS = 15 * 60 * 1000
const CACHE_LIMIT = 100
const MAX_SOURCES = 6
const MAX_SOURCE_CHARS = 2200
const MAX_CONTEXT_CHARS = 11000
const researchCache = new Map()

function cleanWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function redactSensitiveDetails(value) {
  return String(value || '')
    .replace(/https?:\/\/\S+/gi, '[URL REDACTED]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL REDACTED]')
    .replace(/\b(?:\+?91[-\s]?)?[6-9]\d{9}\b/g, '[PHONE REDACTED]')
    .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[IDENTIFIER REDACTED]')
    .replace(/\b(?:account|a\/c|upi|card)\s*(?:number|no\.?|id)?\s*[:#-]?\s*[A-Z0-9@._-]{6,}\b/gi, '[FINANCIAL IDENTIFIER REDACTED]')
    .replace(/\b\d{6,}\b/g, '[NUMBER REDACTED]')
}

export function isTrustedLegalUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    return TRUSTED_HOSTS.has(hostname) || TRUSTED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  } catch {
    return false
  }
}

function safeTitle(value) {
  return cleanWhitespace(value).slice(0, 180) || 'Official legal source'
}

export function normaliseSearchResults(executedTools, maxSources = MAX_SOURCES) {
  const results = (executedTools || []).flatMap((tool) => tool?.search_results?.results || [])
  const seen = new Set()
  const sources = []

  for (const result of results) {
    if (!isTrustedLegalUrl(result?.url) || seen.has(result.url)) continue
    const content = cleanWhitespace(result.content).slice(0, MAX_SOURCE_CHARS)
    if (!content) continue

    seen.add(result.url)
    sources.push({
      title: safeTitle(result.title),
      url: result.url,
      content,
      score: Number.isFinite(result.score) ? result.score : null,
    })

    if (sources.length >= maxSources) break
  }

  return sources
}

function formatSourceBlock(source, index) {
  const version = source.sourceAsOf ? `\nSource version: ${source.sourceAsOf}` : ''
  const applicability = source.applicabilityNote ? `\nApplicability warning: ${source.applicabilityNote}` : ''
  return `[SOURCE ${index + 1}]\nTitle: ${source.title}\nURL: ${source.url}${version}${applicability}\nExcerpt: ${source.content}`
}

function fitSourcesWithinContext(sources) {
  const selected = []
  let length = 0

  for (const source of sources) {
    const block = formatSourceBlock(source, selected.length)
    if (length + block.length > MAX_CONTEXT_CHARS) continue
    selected.push(source)
    length += block.length
  }

  return selected
}

function fallbackResearchQuery(category, researchType) {
  return `${category || 'general'} Indian law ${researchType || 'legal issue'} applicable statutes official judgments`
}

function shouldUseCriminalLawCorpus(value, category) {
  if (String(category).toLowerCase() === 'criminal') return true
  return /\b(?:criminal|crime|offen[cs]e|fir|police|arrest|bail|rape|sexual assault|theft|stolen|robbery|fraud|cheat|harass|domestic violence|murder|hurt|intimidat\w*|evidence|electronic record|bns|bnss|bsa|ipc|crpc)\b/i.test(value)
}

function sanitiseResearchQuery(value, category, researchType) {
  const redacted = redactSensitiveDetails(value)
    .replace(/\[[^\]]*REDACTED\]/g, ' ')
    .replace(/[\r\n]+/g, ' ')
  const query = cleanWhitespace(redacted).slice(0, 320)
  return query.length >= 20 ? query : fallbackResearchQuery(category, researchType)
}

async function createResearchQuery(groq, { situation, category, researchType }) {
  const locallyRedactedSituation = redactSensitiveDetails(situation).slice(0, 3000)

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      max_tokens: 180,
      messages: [
        {
          role: 'system',
          content: `Convert a legal narrative into one concise research-engine query about Indian law. Include the legal issues, relevant date period, and whether statutes or judgments are needed. Remove all names, contact details, addresses, account details, URLs, employer names, company names, exact transaction identifiers, and other identifying facts. Never repeat private facts. Return only the search query without quotes or explanation.`,
        },
        {
          role: 'user',
          content: `Research type: ${researchType}\nCategory: ${category || 'General'}\nRedacted narrative: ${locallyRedactedSituation}`,
        },
      ],
    })

    return sanitiseResearchQuery(completion.choices[0]?.message?.content, category, researchType)
  } catch (error) {
    console.error('[legalResearch:createQuery]', error)
    return fallbackResearchQuery(category, researchType)
  }
}

function getCachedResearch(cacheKey) {
  const cached = researchCache.get(cacheKey)
  if (!cached) return null
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    researchCache.delete(cacheKey)
    return null
  }
  return cached.value
}

function cacheResearch(cacheKey, value) {
  if (researchCache.size >= CACHE_LIMIT) {
    const oldestKey = researchCache.keys().next().value
    researchCache.delete(oldestKey)
  }
  researchCache.set(cacheKey, { createdAt: Date.now(), value })
}

export function formatResearchContext(sources) {
  return fitSourcesWithinContext(sources).map(formatSourceBlock).join('\n\n')
}

function escapeMarkdownLabel(value) {
  return String(value).replaceAll('[', '').replaceAll(']', '').replace(/\s+/g, ' ').trim()
}

export function appendVerifiedSources(answer, sources) {
  if (!sources.length) {
    return `${answer}\n\n> **Source status:** Official-source retrieval was unavailable for this response. Do not rely on statutory sections or case citations without independent verification.`
  }

  const links = sources.map((source, index) => `${index + 1}. [${escapeMarkdownLabel(source.title)}](${source.url})`)
  return `${answer}\n\n## Sources consulted\n\n${links.join('\n')}`
}

export async function retrieveLegalSources({ situation, category, researchType }) {
  const localQuery = `${category || 'General'} ${researchType || 'Indian law'} ${redactSensitiveDetails(situation)}`
  const localSources = shouldUseCriminalLawCorpus(`${category || ''} ${situation || ''}`, category)
    ? searchLocalLegalCorpus(localQuery, { maxResults: 4 })
    : []

  if (!process.env.GROQ_API_KEY) {
    const query = fallbackResearchQuery(category, researchType)
    const sources = fitSourcesWithinContext(localSources)
    return { query, sources, context: formatResearchContext(sources), grounded: sources.length > 0 }
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const query = await createResearchQuery(groq, { situation, category, researchType })
  const cacheKey = `${researchType}|${category}|${query}`.toLowerCase()
  const cached = getCachedResearch(cacheKey)
  if (cached) return cached

  try {
    const completion = await groq.chat.completions.create({
      model: 'groq/compound-mini',
      citation_options: 'enabled',
      search_settings: {
        include_domains: SEARCH_DOMAINS,
        country: 'india',
      },
      compound_custom: {
        tools: { enabled_tools: ['web_search'] },
      },
      messages: [
        {
          role: 'system',
          content: `You are a legal retrieval component. Search for primary Indian legal material relevant to the query. Prefer current statutory text, full judgments, official judgment summaries, and official case-status information. Do not provide personal legal advice. Do not search for people named in a dispute.`,
        },
        { role: 'user', content: query },
      ],
    })

    const webSources = normaliseSearchResults(completion.choices[0]?.message?.executed_tools)
    const sources = fitSourcesWithinContext([...localSources, ...webSources])
    const value = { query, sources, context: formatResearchContext(sources), grounded: sources.length > 0 }
    if (sources.length) cacheResearch(cacheKey, value)
    return value
  } catch (error) {
    console.error('[legalResearch:retrieve]', error)
    const sources = fitSourcesWithinContext(localSources)
    return { query, sources, context: formatResearchContext(sources), grounded: sources.length > 0 }
  }
}

export const LEGAL_RESEARCH_LIMITS = Object.freeze({
  maxSources: MAX_SOURCES,
  maxSourceChars: MAX_SOURCE_CHARS,
  maxContextChars: MAX_CONTEXT_CHARS,
})
