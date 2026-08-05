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

const CATEGORIES = ['Theft', 'Assault', 'Fraud', 'Cybercrime', 'Harassment', 'Domestic Violence', 'Property Dispute', 'Other']
const STEPS = ['Incident details', 'What happened', 'Review']

export default function FIRGenerator() {
  const [incident, setIncident] = useState('')
  const [category, setCategory] = useState('Other')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [fir, setFir] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [toast, setToast] = useState(null)
  const { textareaRef, resize } = useAutoResizeTextarea(incident)

  const handleGenerate = async () => {
    if (!incident.trim()) {
      setError('Please describe the incident')
      return
    }
    setLoading(true)
    setError('')
    setFir('')
    try {
      const response = await fetch(apiUrl('/api/fir/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident, category, location, date }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate FIR')
      setFir(data.fir)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fir)
      setToast({ message: 'FIR draft copied to your clipboard.', tone: 'success' })
    } catch {
      setToast({ message: 'Could not copy the draft. Please try again.', tone: 'error' })
    }
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 0))
      exportLegalPdf({ title: 'First Information Report Draft', content: fir, filename: 'lexa-fir-draft.pdf', metadata: [{ label: 'Incident type', value: category }, { label: 'Location', value: location }, { label: 'Date', value: date }] })
      setToast({ message: 'FIR PDF downloaded.', tone: 'success' })
    } catch {
      setToast({ message: 'The PDF could not be created.', tone: 'error' })
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header"><p className="page-eyebrow">Guided complaint builder</p><h1 className="page-title">FIR Draft Generator</h1><p className="page-subtitle">Build a structured complaint one step at a time. You can review every detail before Lexa drafts the FIR.</p><div className="page-header__folio"><span>Workspace 03</span><span>Complaint preparation</span><span>3-stage record</span></div></header>
      <Stepper steps={STEPS} currentStep={step} />

      <div className="workflow-panel">
        <div className="workflow-panel__meta"><span>FIR preparation record</span><small>Stage {step + 1} / {STEPS.length}</small></div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: .16 }}>
            {step === 0 && <><h2 className="workflow-panel__heading">Start with the incident details</h2><p className="workflow-panel__copy">Include the incident date whenever possible—it helps determine whether the BNS or legacy IPC framework may apply.</p><section className="form-section" aria-labelledby="fir-category-label"><span className="field-label" id="fir-category-label">Incident type</span><div className="pill-group">{CATEGORIES.map((cat) => <button key={cat} type="button" className="choice-pill" aria-pressed={category === cat} onClick={() => setCategory(cat)}>{cat}</button>)}</div></section><div className="field-grid"><div><label className="field-label" htmlFor="fir-location">Location</label><input id="fir-location" className="field-control" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hyderabad, Telangana" /></div><div><label className="field-label" htmlFor="fir-date">Incident date</label><input id="fir-date" className="field-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></div></>}
            {step === 1 && <><h2 className="workflow-panel__heading">Tell us what happened</h2><p className="workflow-panel__copy">Include who was involved, the sequence of events, witnesses, losses, and any evidence you have.</p><label className="field-label" htmlFor="fir-incident">Incident narrative</label><textarea id="fir-incident" ref={textareaRef} className="field-control auto-textarea" value={incident} onChange={(e) => { setIncident(e.target.value); resize(e.target) }} placeholder="Describe the incident in chronological order..." rows={1} maxLength={3000} /><div className="char-count" aria-live="polite">{incident.length}/3000</div></>}
            {step === 2 && <><h2 className="workflow-panel__heading">Review before generating</h2><p className="workflow-panel__copy">Check the information below. The generated document will still require legal review before filing.</p><div className="review-grid"><div className="review-item"><span>Incident type</span><p>{category}</p></div><div className="review-item"><span>Date and location</span><p>{[date, location].filter(Boolean).join(' · ') || 'Not specified'}</p></div><div className="review-item review-item--wide"><span>Incident narrative</span><p>{incident}</p></div></div></>}
          </motion.div>
        </AnimatePresence>
        <div className="workflow-actions">{step > 0 ? <Button variant="ghost" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={16} /> Back</Button> : <span />}{step < 2 ? <Button onClick={() => setStep((value) => value + 1)} disabled={step === 1 && !incident.trim()}>Continue <ArrowRight size={16} /></Button> : <Button onClick={handleGenerate} disabled={!incident.trim()} loading={loading}>Generate FIR Draft</Button>}</div>
      </div>

      {error && <div className="alert-error" role="alert" style={{ marginTop: 'var(--space-lg)' }}>{error}</div>}
      {loading && <LoadingState label="Drafting your FIR" detail="Structuring the facts and identifying relevant legal provisions." />}
      {fir && !loading && <ResultDocument title="FIR Draft" actions={<><Button onClick={handleCopy} variant="ghost"><Copy size={16} /> Copy</Button><Button onClick={handleDownloadPdf} loading={pdfLoading} variant="secondary"><Download size={16} /> PDF</Button></>} disclaimer="AI-generated draft. Review it with a qualified lawyer before filing and replace every blank with accurate information."><ReactMarkdown>{DOMPurify.sanitize(fir)}</ReactMarkdown></ResultDocument>}
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </main>
  )
}
