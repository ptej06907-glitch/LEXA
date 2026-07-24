import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import LoadingState from '../components/LoadingState'
import { ArrowUp } from 'lucide-react'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'
import { apiUrl } from '../lib/api'

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
      const response = await fetch(apiUrl('/api/legal/advice'), {
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

      <div className="composer">
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
        <div className="composer__footer"><span className="composer__hint">Enter to send · Shift+Enter for a new line · {situation.length}/2000</span><Button onClick={handleSubmit} disabled={!situation.trim()} loading={loading} aria-label="Get legal advice"><ArrowUp size={17} /> Ask Lexa</Button></div>
      </div>

      {error && <div className="alert-error" role="alert" style={{ marginTop: 'var(--space-lg)' }}>{error}</div>}
      {loading && <LoadingState label="Reviewing your legal situation" detail="Identifying relevant rights, provisions, and practical next steps." />}

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
