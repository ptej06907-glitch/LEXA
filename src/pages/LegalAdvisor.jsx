import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'

const CATEGORIES = [
  'Criminal', 'Civil', 'Consumer', 'Property',
  'Employment', 'Family', 'Constitutional', 'General'
]

export default function LegalAdvisor() {
  const [situation, setSituation] = useState('')
  const [category, setCategory] = useState('General')
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get legal advice')
      }

      setAdvice(data.advice)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      padding: '2rem',
      paddingTop: '6rem',
      maxWidth: '800px',
      margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Legal Advisor
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Describe your situation and Lexa will provide advice based on Indian law — IPC, CrPC, Constitution, and more.
        </p>
      </div>

      {/* Category Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
          CATEGORY
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: category === cat ? 'var(--color-gold)' : 'var(--color-border)',
                background: category === cat ? 'var(--color-gold)' : 'transparent',
                color: category === cat ? '#000' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: category === cat ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Situation Textarea */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
          YOUR SITUATION
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Describe your legal situation in detail..."
          rows={6}
          maxLength={2000}
          style={{
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '1rem',
            color: 'var(--color-text-primary)',
            fontSize: '0.95rem',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: '1.6',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          {situation.length}/2000
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          color: '#f87171',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!situation.trim() || loading}
        style={{
          background: !situation.trim() || loading ? '#333' : 'var(--color-gold)',
          color: !situation.trim() || loading ? '#666' : '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '0.875rem 2rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: !situation.trim() || loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '2rem',
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Getting Legal Advice...' : 'Get Legal Advice'}
      </button>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚖️</div>
          <p>Lexa is analyzing your situation...</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>This may take a few seconds</p>
        </div>
      )}

      {/* Advice Result */}
      {advice && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '2rem',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--color-gold)',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '1rem',
          }}>
            Legal Advice
          </h2>
          <div style={{ color: 'var(--color-text-primary)', lineHeight: '1.8', fontSize: '0.95rem' }}>
            <ReactMarkdown>{DOMPurify.sanitize(advice)}</ReactMarkdown>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            ⚠️ This is AI-generated legal information, not professional legal advice. Consult a qualified lawyer for your specific situation.
          </p>
        </div>
      )}
    </div>
  )
}