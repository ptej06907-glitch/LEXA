import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Copy, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import LoadingState from '../components/LoadingState'
import ResultDocument from '../components/ResultDocument'
import Stepper from '../components/Stepper'
import Toast from '../components/Toast'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'
import exportLegalPdf from '../utils/exportLegalPdf'
import { apiUrl } from '../lib/api'

const NOTICE_TYPES = ['Demand Notice', 'Cease and Desist', 'Eviction Notice', 'Employment Termination', 'Consumer Complaint', 'Defamation', 'Recovery of Money', 'Property Dispute']
const RECIPIENT_TYPES = ['Individual', 'Company', 'Landlord', 'Tenant', 'Employer', 'Employee', 'Bank', 'Government Body']
const STEPS = ['Notice setup', 'Your situation', 'Review']

export default function LegalNotice() {
  const [situation, setSituation] = useState('')
  const [noticeType, setNoticeType] = useState('Demand Notice')
  const [recipientType, setRecipientType] = useState('Individual')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [toast, setToast] = useState(null)
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
      const response = await fetch(apiUrl('/api/notice/generate'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ situation, noticeType, recipientType }),
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notice)
      setToast({ message: 'Legal notice copied to your clipboard.', tone: 'success' })
    } catch {
      setToast({ message: 'Could not copy the notice. Please try again.', tone: 'error' })
    }
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 0))
      exportLegalPdf({ title: noticeType, content: notice, filename: 'lexa-legal-notice.pdf', metadata: [{ label: 'Notice type', value: noticeType }, { label: 'Recipient', value: recipientType }, { label: 'Prepared on', value: new Date().toLocaleDateString('en-IN') }] })
      setToast({ message: 'Legal notice PDF downloaded.', tone: 'success' })
    } catch {
      setToast({ message: 'The PDF could not be created.', tone: 'error' })
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header"><p className="page-eyebrow">Guided formal correspondence</p><h1 className="page-title">Legal Notice Generator</h1><p className="page-subtitle">Define the notice, explain the dispute, and review the facts before Lexa prepares the formal draft.</p></header>
      <Stepper steps={STEPS} currentStep={step} />

      <div className="workflow-panel">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: .16 }}>
            {step === 0 && <><h2 className="workflow-panel__heading">Set up the notice</h2><p className="workflow-panel__copy">Choose the closest purpose and recipient. Lexa will use these to shape the tone and legal structure.</p><section className="form-section" aria-labelledby="notice-type-label"><span className="field-label" id="notice-type-label">Notice type</span><div className="pill-group">{NOTICE_TYPES.map((type) => <button key={type} type="button" className="choice-pill" aria-pressed={noticeType === type} onClick={() => setNoticeType(type)}>{type}</button>)}</div></section><section aria-labelledby="recipient-type-label"><span className="field-label" id="recipient-type-label">Sending notice to</span><div className="pill-group">{RECIPIENT_TYPES.map((type) => <button key={type} type="button" className="choice-pill" aria-pressed={recipientType === type} onClick={() => setRecipientType(type)}>{type}</button>)}</div></section></>}
            {step === 1 && <><h2 className="workflow-panel__heading">Explain the dispute</h2><p className="workflow-panel__copy">Include when each event occurred, amounts, promises made, previous attempts to resolve it, and the action you now expect.</p><label className="field-label" htmlFor="notice-situation">Situation and desired outcome</label><textarea id="notice-situation" ref={textareaRef} className="field-control auto-textarea" value={situation} onChange={(e) => { setSituation(e.target.value); resize(e.target) }} placeholder="Describe what happened, including relevant dates, and what you want the recipient to do..." rows={1} maxLength={3000} /><div className="char-count" aria-live="polite">{situation.length}/3000</div></>}
            {step === 2 && <><h2 className="workflow-panel__heading">Review before generating</h2><p className="workflow-panel__copy">Confirm the notice type and facts. The final document remains a draft until reviewed by a lawyer.</p><div className="review-grid"><div className="review-item"><span>Notice type</span><p>{noticeType}</p></div><div className="review-item"><span>Recipient</span><p>{recipientType}</p></div><div className="review-item review-item--wide"><span>Situation</span><p>{situation}</p></div></div></>}
          </motion.div>
        </AnimatePresence>
        <div className="workflow-actions">{step > 0 ? <Button variant="ghost" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={16} /> Back</Button> : <span />}{step < 2 ? <Button onClick={() => setStep((value) => value + 1)} disabled={step === 1 && !situation.trim()}>Continue <ArrowRight size={16} /></Button> : <Button onClick={handleGenerate} disabled={!situation.trim()} loading={loading}>Generate Legal Notice</Button>}</div>
      </div>

      {error && <div className="alert-error" role="alert" style={{ marginTop: 'var(--space-lg)' }}>{error}</div>}
      {loading && <LoadingState label="Drafting your legal notice" detail="Organizing the facts, demand, deadline, and relevant legal basis." />}
      {notice && !loading && <ResultDocument title={noticeType} actions={<><Button onClick={handleCopy} variant="ghost"><Copy size={16} /> Copy</Button><Button onClick={handleDownloadPdf} loading={pdfLoading} variant="secondary"><Download size={16} /> PDF</Button></>} disclaimer="AI-generated draft. Have a qualified lawyer review it before sending and replace every blank with accurate information."><ReactMarkdown>{DOMPurify.sanitize(notice)}</ReactMarkdown></ResultDocument>}
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </main>
  )
}
