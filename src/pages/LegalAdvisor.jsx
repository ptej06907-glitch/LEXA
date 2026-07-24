import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'

const CATEGORIES = ['Criminal', 'Civil', 'Consumer', 'Property', 'Employment', 'Family', 'Constitutional', 'General']

export default function LegalAdvisor() {
  const [situation, setSituation] = useState('')
  const [category, setCategory] = useState('General')
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { textareaRef, resize } = useAutoResizeTextarea(situation)

  const handleSubmit = async () => {
    if (!situation.trim()) {
      setError('Please describe your situation')
      return
    }

    setLoading(true)
    setError('')
    setAdvice('')

    try {
      const response = await fetch('http://localhost:3001/api/legal/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, category }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to get legal advice')
      setAdvice(data.advice)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="page-eyebrow">Ask Lexa</p>
        <h1 className="page-title">Legal Advisor</h1>
        <p className="page-subtitle">Describe your situation and Lexa will provide information based on Indian law — IPC, CrPC, the Constitution, and more.</p>
      </header>

      <section className="form-section" aria-labelledby="advisor-category-label">
        <span className="field-label" id="advisor-category-label">Category</span>
        <div className="pill-group">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" className="choice-pill" aria-pressed={category === cat} disabled={loading} onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>
      </section>

      <div className="form-section">
        <label className="field-label" htmlFor="legal-situation">Your situation</label>
        <textarea
          id="legal-situation"
          ref={textareaRef}
          className="field-control auto-textarea advisor__textarea"
          value={situation}
          onChange={(e) => { setSituation(e.target.value); resize(e.target) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (situation.trim() && !loading) handleSubmit()
            }
          }}
          placeholder="Describe your legal situation in detail..."
          rows={1}
          maxLength={2000}
        />
        <div className="char-count" aria-live="polite">{situation.length}/2000</div>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}
      <Button onClick={handleSubmit} disabled={!situation.trim()} loading={loading} fullWidth className="mb-8">
        Get Legal Advice
      </Button>

      {loading && <div className="loading-panel" role="status"><span className="loading-spinner" aria-hidden="true" /><p>Lexa is analyzing your situation...</p><small>This may take a few seconds</small></div>}

      {advice && (
        <article className="result-card">
          <div className="result-header"><h2 className="result-title">Legal Advice</h2></div>
          <div className="result-content"><ReactMarkdown>{DOMPurify.sanitize(advice)}</ReactMarkdown></div>
          <p className="result-disclaimer">This is AI-generated legal information, not professional legal advice. Consult a qualified lawyer for your specific situation.</p>
        </article>
      )}
    </main>
  )
}
