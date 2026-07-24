import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import useAutoResizeTextarea from '../hooks/useAutoResizeTextarea'

const CATEGORIES = ['Criminal', 'Civil', 'Consumer', 'Property', 'Employment', 'Family', 'Constitutional', 'Cyber']

export default function CaseFinder() {
  const [situation, setSituation] = useState('')
  const [category, setCategory] = useState('Civil')
  const [judgments, setJudgments] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { textareaRef, resize } = useAutoResizeTextarea(situation)

  const handleFind = async () => {
    if (!situation.trim()) {
      setError('Please describe your situation')
      return
    }
    setLoading(true)
    setError('')
    setJudgments('')
    try {
      const response = await fetch('http://localhost:3001/api/judgment/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, category }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to find judgments')
      setJudgments(data.judgments)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header"><p className="page-eyebrow">Research precedents</p><h1 className="page-title">Landmark Case Finder</h1><p className="page-subtitle">Find relevant Supreme Court and High Court judgments that may support your legal situation.</p></header>

      <section className="form-section" aria-labelledby="case-category-label"><span className="field-label" id="case-category-label">Legal category</span><div className="pill-group">{CATEGORIES.map((cat) => <button key={cat} type="button" className="choice-pill" aria-pressed={category === cat} disabled={loading} onClick={() => setCategory(cat)}>{cat}</button>)}</div></section>

      <div className="form-section">
        <label className="field-label" htmlFor="case-situation">Describe your legal situation</label>
        <textarea
          id="case-situation"
          ref={textareaRef}
          className="field-control auto-textarea"
          value={situation}
          onChange={(e) => { setSituation(e.target.value); resize(e.target) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (situation.trim() && !loading) handleFind()
            }
          }}
          placeholder="Describe your situation or the legal topic you need case references for..."
          rows={1}
          maxLength={3000}
        />
        <div className="char-count" aria-live="polite">{situation.length}/3000</div>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}
      <Button onClick={handleFind} disabled={!situation.trim()} loading={loading} fullWidth className="mb-8">Find Relevant Cases</Button>
      {loading && <div className="loading-panel" role="status"><span className="loading-spinner" aria-hidden="true" /><p>Lexa is searching landmark judgments...</p><small>This may take a few seconds</small></div>}
      {judgments && <article className="result-card"><div className="result-header"><h2 className="result-title">Relevant Judgments</h2></div><div className="result-content"><ReactMarkdown>{DOMPurify.sanitize(judgments)}</ReactMarkdown></div><p className="result-disclaimer">Always verify case citations on Indian Kanoon before using them in court proceedings.</p></article>}
    </main>
  )
}
