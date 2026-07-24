import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'
import exportLegalPdf from '../utils/exportLegalPdf'

const CATEGORIES = ['Theft', 'Assault', 'Fraud', 'Cybercrime', 'Harassment', 'Domestic Violence', 'Property Dispute', 'Other']

export default function FIRGenerator() {
  const [incident, setIncident] = useState('')
  const [category, setCategory] = useState('Other')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [fir, setFir] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState('')
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
      const response = await fetch('http://localhost:3001/api/fir/generate', {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(fir)
    alert('FIR copied to clipboard!')
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 0))
      exportLegalPdf({
        title: 'First Information Report Draft',
        content: fir,
        filename: 'lexa-fir-draft.pdf',
        metadata: [
          { label: 'Incident type', value: category },
          { label: 'Location', value: location },
          { label: 'Date', value: date },
        ],
      })
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header"><p className="page-eyebrow">Draft a complaint</p><h1 className="page-title">FIR Draft Generator</h1><p className="page-subtitle">Describe what happened and Lexa will prepare a structured FIR draft with relevant Indian legal provisions.</p></header>

      <section className="form-section" aria-labelledby="fir-category-label">
        <span className="field-label" id="fir-category-label">Incident type</span>
        <div className="pill-group">{CATEGORIES.map((cat) => <button key={cat} type="button" className="choice-pill" aria-pressed={category === cat} disabled={loading} onClick={() => setCategory(cat)}>{cat}</button>)}</div>
      </section>

      <div className="field-grid">
        <div><label className="field-label" htmlFor="fir-location">Location of incident</label><input id="fir-location" className="field-control" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hyderabad, Telangana" /></div>
        <div><label className="field-label" htmlFor="fir-date">Date of incident</label><input id="fir-date" className="field-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      </div>

      <div className="form-section">
        <label className="field-label" htmlFor="fir-incident">Describe the incident</label>
        <textarea id="fir-incident" ref={textareaRef} className="field-control auto-textarea" value={incident} onChange={(e) => { setIncident(e.target.value); resize(e.target) }} placeholder="Describe exactly what happened — who, what, when, and where." rows={1} maxLength={3000} />
        <div className="char-count" aria-live="polite">{incident.length}/3000</div>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}
      <Button onClick={handleGenerate} disabled={!incident.trim()} loading={loading} fullWidth className="mb-8">Generate FIR Draft</Button>
      {loading && <div className="loading-panel" role="status"><span className="loading-spinner" aria-hidden="true" /><p>Lexa is drafting your FIR...</p></div>}

      {fir && (
        <article className="result-card">
          <div className="result-header">
            <h2 className="result-title">FIR Draft</h2>
            <div className="result-actions"><Button onClick={handleCopy} variant="ghost">Copy to Clipboard</Button><Button onClick={handleDownloadPdf} loading={pdfLoading} variant="secondary">Download as PDF</Button></div>
          </div>
          <div className="result-content"><ReactMarkdown>{DOMPurify.sanitize(fir)}</ReactMarkdown></div>
          <p className="result-disclaimer">This is an AI-generated draft. Review it with a lawyer before filing and fill in every blank field with accurate details.</p>
        </article>
      )}
    </main>
  )
}
