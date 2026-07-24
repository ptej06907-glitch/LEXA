import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'
import exportLegalPdf from '../utils/exportLegalPdf'

const NOTICE_TYPES = ['Demand Notice', 'Cease and Desist', 'Eviction Notice', 'Employment Termination', 'Consumer Complaint', 'Defamation', 'Recovery of Money', 'Property Dispute']
const RECIPIENT_TYPES = ['Individual', 'Company', 'Landlord', 'Tenant', 'Employer', 'Employee', 'Bank', 'Government Body']

export default function LegalNotice() {
  const [situation, setSituation] = useState('')
  const [noticeType, setNoticeType] = useState('Demand Notice')
  const [recipientType, setRecipientType] = useState('Individual')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState('')
  const { textareaRef, resize } = useAutoResizeTextarea(situation)

  const handleGenerate = async () => {
    if (!situation.trim()) {
      setError('Please describe your situation')
      return
    }
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('http://localhost:3001/api/notice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, noticeType, recipientType }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate notice')
      setNotice(data.notice)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(notice)
    alert('Notice copied to clipboard!')
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 0))
      exportLegalPdf({
        title: noticeType,
        content: notice,
        filename: 'lexa-legal-notice.pdf',
        metadata: [
          { label: 'Notice type', value: noticeType },
          { label: 'Recipient', value: recipientType },
          { label: 'Prepared on', value: new Date().toLocaleDateString('en-IN') },
        ],
      })
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header"><p className="page-eyebrow">Formal correspondence</p><h1 className="page-title">Legal Notice Generator</h1><p className="page-subtitle">Generate a professionally structured legal notice backed by Indian law and ready for legal review.</p></header>

      <section className="form-section" aria-labelledby="notice-type-label"><span className="field-label" id="notice-type-label">Notice type</span><div className="pill-group">{NOTICE_TYPES.map((type) => <button key={type} type="button" className="choice-pill" aria-pressed={noticeType === type} disabled={loading} onClick={() => setNoticeType(type)}>{type}</button>)}</div></section>
      <section className="form-section" aria-labelledby="recipient-type-label"><span className="field-label" id="recipient-type-label">Sending notice to</span><div className="pill-group">{RECIPIENT_TYPES.map((type) => <button key={type} type="button" className="choice-pill" aria-pressed={recipientType === type} disabled={loading} onClick={() => setRecipientType(type)}>{type}</button>)}</div></section>

      <div className="form-section">
        <label className="field-label" htmlFor="notice-situation">Describe your situation</label>
        <textarea id="notice-situation" ref={textareaRef} className="field-control auto-textarea" value={situation} onChange={(e) => { setSituation(e.target.value); resize(e.target) }} placeholder="Describe what happened, who is involved, and what action you want them to take..." rows={1} maxLength={3000} />
        <div className="char-count" aria-live="polite">{situation.length}/3000</div>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}
      <Button onClick={handleGenerate} disabled={!situation.trim()} loading={loading} fullWidth className="mb-8">Generate Legal Notice</Button>
      {loading && <div className="loading-panel" role="status"><span className="loading-spinner" aria-hidden="true" /><p>Lexa is drafting your legal notice...</p></div>}

      {notice && (
        <article className="result-card">
          <div className="result-header"><h2 className="result-title">Legal Notice</h2><div className="result-actions"><Button onClick={handleCopy} variant="ghost">Copy to Clipboard</Button><Button onClick={handleDownloadPdf} loading={pdfLoading} variant="secondary">Download as PDF</Button></div></div>
          <div className="result-content"><ReactMarkdown>{DOMPurify.sanitize(notice)}</ReactMarkdown></div>
          <p className="result-disclaimer">This is an AI-generated draft. Have a lawyer review it before sending and fill in every blank field with accurate details.</p>
        </article>
      )}
    </main>
  )
}
