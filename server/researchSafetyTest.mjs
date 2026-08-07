import assert from 'node:assert/strict'
import {
  LEGAL_RESEARCH_LIMITS,
  appendVerifiedSources,
  formatResearchContext,
  isTrustedLegalUrl,
  normaliseSearchResults,
  redactSensitiveDetails,
} from './services/legalResearchService.js'
import { DOCUMENT_SELECTION_LIMITS, selectDocumentExcerpts } from './services/documentSelectionService.js'
import { getLegalCorpusStatus, searchLocalLegalCorpus } from './services/localLegalCorpusService.js'

const privateNarrative = 'My email is person@example.com, phone +91 9876543210, Aadhaar 1234 5678 9012, account number 123456789012 and URL https://private.example/path.'
const redacted = redactSensitiveDetails(privateNarrative)
assert.equal(redacted.includes('person@example.com'), false)
assert.equal(redacted.includes('9876543210'), false)
assert.equal(redacted.includes('1234 5678 9012'), false)
assert.equal(redacted.includes('123456789012'), false)
assert.equal(redacted.includes('private.example'), false)

assert.equal(isTrustedLegalUrl('https://www.indiacode.nic.in/example'), true)
assert.equal(isTrustedLegalUrl('https://api.sci.gov.in/judgment.pdf'), true)
assert.equal(isTrustedLegalUrl('https://hcservices.ecourts.gov.in/example'), true)
assert.equal(isTrustedLegalUrl('http://indiacode.nic.in/insecure'), false)
assert.equal(isTrustedLegalUrl('https://indiacode.nic.in.evil.example/attack'), false)
assert.equal(isTrustedLegalUrl('https://example.com/not-authoritative'), false)

const executedTools = [{
  search_results: {
    results: [
      { title: 'BNS', url: 'https://www.indiacode.nic.in/bns', content: 'A'.repeat(5000), score: 0.9 },
      { title: 'Duplicate', url: 'https://www.indiacode.nic.in/bns', content: 'duplicate', score: 0.8 },
      { title: 'Unsafe', url: 'https://example.com/fake', content: 'unsafe', score: 1 },
      { title: 'Judgment', url: 'https://api.sci.gov.in/case.pdf', content: 'Official judgment text', score: 0.7 },
    ],
  },
}]

const sources = normaliseSearchResults(executedTools)
assert.equal(sources.length, 2)
assert.equal(sources[0].content.length, LEGAL_RESEARCH_LIMITS.maxSourceChars)
assert.equal(formatResearchContext(sources).length <= LEGAL_RESEARCH_LIMITS.maxContextChars, true)

const groundedAnswer = appendVerifiedSources('Answer with [1].', sources)
assert.equal(groundedAnswer.includes('https://www.indiacode.nic.in/bns'), true)
assert.equal(groundedAnswer.includes('https://example.com/fake'), false)

const ungroundedAnswer = appendVerifiedSources('General information only.', [])
assert.equal(ungroundedAnswer.includes('retrieval was unavailable'), true)

const longDocument = [
  'SERVICE AGREEMENT. Ordinary introductory language. '.repeat(90),
  'RISK CLAUSE. The provider may terminate without notice, retain personal data, impose a non-refundable penalty, and require unlimited indemnity. ',
  'Routine operational language. '.repeat(500),
  'SIGNATURE AND GOVERNING LAW. Exclusive jurisdiction and arbitration apply.',
].join('\n\n')
const selectedDocument = selectDocumentExcerpts(longDocument)
assert.equal(selectedDocument.text.length <= DOCUMENT_SELECTION_LIMITS.maxChars, true)
assert.equal(selectedDocument.text.includes('non-refundable penalty'), true)
assert.equal(selectedDocument.text.includes('SIGNATURE AND GOVERNING LAW'), true)
assert.equal(selectedDocument.documentCharacters > selectedDocument.selectedCharacters, true)

const corpusStatus = getLegalCorpusStatus()
assert.equal(corpusStatus.acts.length, 3)
assert.equal(corpusStatus.acts.every((act) => act.checksumSha256.length === 64), true)
assert.equal(corpusStatus.acts.every((act) => act.pageCount > 40 && act.chunkCount > 100), true)

const bnsResults = searchLocalLegalCorpus('BNS rape without consent', { maxResults: 5 })
assert.equal(bnsResults.some((source) => source.actId === 'bns' && /\b63\./.test(source.content)), true)
assert.equal(bnsResults.every((source) => source.applicabilityNote.includes('106(2)')), true)
assert.equal(formatResearchContext(bnsResults).includes('Applicability warning:'), true)
const bnssResults = searchLocalLegalCorpus('BNSS register FIR information cognizable police', { maxResults: 5 })
assert.equal(bnssResults.some((source) => source.actId === 'bnss' && /\b173\./.test(source.content)), true)
const bsaResults = searchLocalLegalCorpus('BSA admissibility of electronic records evidence', { maxResults: 5 })
assert.equal(bsaResults.some((source) => source.actId === 'bsa' && /\b63\./.test(source.content)), true)
assert.equal([...bnsResults, ...bnssResults, ...bsaResults].every((source) => isTrustedLegalUrl(source.url)), true)

console.log('Legal research safety test passed:', {
  redaction: true,
  trustedDomains: true,
  unsafeDomainsRejected: true,
  duplicatesRemoved: true,
  contextBounded: true,
  fallbackLabelled: true,
  documentRiskSelection: true,
  corpusIntegrity: true,
  statuteRetrieval: true,
})
