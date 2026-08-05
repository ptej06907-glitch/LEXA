import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import LoadingState from '../components/LoadingState'
import { Search } from 'lucide-react'
import { apiUrl } from '../lib/api'
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
      const response = await fetch(apiUrl('/api/judgment/find'), {
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
      <header className="page-header"><p className="page-eyebrow">Research precedents</p><h1 className="page-title">Landmark Case Finder</h1><p className="page-subtitle">Find relevant Supreme Court and High Court judgments that may support your legal situation.</p><div className="page-header__folio"><span>Workspace 05</span><span>Precedent research</span><span>Verify citations</span></div></header>

      <div className="research-layout">
        <aside className="research-filters" aria-labelledby="case-category-label"><div className="research-filters__meta"><span>Index</span><small>01 / Jurisdiction</small></div><span className="field-label" id="case-category-label">Research area</span><div className="pill-group">{CATEGORIES.map((cat) => <button key={cat} type="button" className="choice-pill" aria-pressed={category === cat} disabled={loading} onClick={() => setCategory(cat)}>{cat}</button>)}</div></aside>
        <div className="composer">
          <div className="composer__masthead"><span>Research brief</span><small>02 / Facts and question</small></div>
          <label className="field-label" htmlFor="case-situation">Case question or situation</label>
          <textarea id="case-situation" ref={textareaRef} className="field-control auto-textarea" value={situation} onChange={(e) => { setSituation(e.target.value); resize(e.target) }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (situation.trim() && !loading) handleFind() } }} placeholder="Describe the issue and include when the relevant events occurred..." rows={1} maxLength={3000} />
          <div className="composer__footer"><span className="composer__hint">Searches Supreme Court and High Court precedents · {situation.length}/3000</span><Button onClick={handleFind} disabled={!situation.trim()} loading={loading}><Search size={16} /> Find cases</Button></div>
        </div>
      </div>

      {error && <div className="alert-error" role="alert" style={{ marginTop: 'var(--space-lg)' }}>{error}</div>}
      {loading && <LoadingState label="Researching relevant judgments" detail="Comparing the facts with landmark Supreme Court and High Court decisions." />}
      {judgments && <article className="result-card"><div className="result-header"><h2 className="result-title">Relevant Judgments</h2><span className="result-reference">Research return / citation check required</span></div><div className="result-content"><ReactMarkdown>{DOMPurify.sanitize(judgments)}</ReactMarkdown></div><p className="result-disclaimer">Verify every citation and confirm whether a legacy-law judgment remains applicable under the current statute before relying on it.</p></article>}
    </main>
  )
}
