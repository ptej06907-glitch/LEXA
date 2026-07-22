import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'

const CATEGORIES = [
  'Theft', 'Assault', 'Fraud', 'Cybercrime',
  'Harassment', 'Domestic Violence', 'Property Dispute', 'Other'
]

export default function FIRGenerator() {
  const [incident, setIncident] = useState('')
  const [category, setCategory] = useState('Other')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [fir, setFir] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate FIR')
      }

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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          FIR Draft Generator
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Describe what happened and Lexa will generate a complete, ready-to-file FIR with correct IPC sections.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
          INCIDENT TYPE
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
            LOCATION OF INCIDENT
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hyderabad, Telangana"
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
            DATE OF INCIDENT
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
          DESCRIBE THE INCIDENT
        </label>
        <textarea
          value={incident}
          onChange={(e) => setIncident(e.target.value)}
          placeholder="Describe exactly what happened — who, what, when, where. The more detail you provide, the better the FIR draft."
          rows={6}
          maxLength={3000}
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
          {incident.length}/3000
        </div>
      </div>

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

      <button
        onClick={handleGenerate}
        disabled={!incident.trim() || loading}
        style={{
          background: !incident.trim() || loading ? '#333' : 'var(--color-gold)',
          color: !incident.trim() || loading ? '#666' : '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '0.875rem 2rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: !incident.trim() || loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '2rem',
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Generating FIR Draft...' : 'Generate FIR Draft'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚖️</div>
          <p>Lexa is drafting your FIR...</p>
        </div>
      )}

      {fir && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-gold)' }}>FIR Draft</h2>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '0.4rem 1rem',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Copy to Clipboard
            </button>
          </div>
          <div style={{ color: 'var(--color-text-primary)', lineHeight: '1.8', fontSize: '0.95rem' }}>
            <ReactMarkdown>{DOMPurify.sanitize(fir)}</ReactMarkdown>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            ⚠️ This is an AI-generated draft. Review with a lawyer before filing. Fill in all blank fields with actual details.
          </p>
        </div>
      )}
    </div>
  )
}