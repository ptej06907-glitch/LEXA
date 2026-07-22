import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'

const NOTICE_TYPES = [
  'Demand Notice', 'Cease and Desist', 'Eviction Notice',
  'Employment Termination', 'Consumer Complaint', 'Defamation',
  'Recovery of Money', 'Property Dispute',
]

const RECIPIENT_TYPES = [
  'Individual', 'Company', 'Landlord', 'Tenant',
  'Employer', 'Employee', 'Bank', 'Government Body',
]

export default function LegalNotice() {
  const [situation, setSituation] = useState('')
  const [noticeType, setNoticeType] = useState('Demand Notice')
  const [recipientType, setRecipientType] = useState('Individual')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate notice')
      }

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
          Legal Notice Generator
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Generate a professionally worded legal notice ready to send — backed by Indian law.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
          NOTICE TYPE
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {NOTICE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setNoticeType(type)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: noticeType === type ? 'var(--color-gold)' : 'var(--color-border)',
                background: noticeType === type ? 'var(--color-gold)' : 'transparent',
                color: noticeType === type ? '#000' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: noticeType === type ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
          SENDING NOTICE TO
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {RECIPIENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setRecipientType(type)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: recipientType === type ? 'var(--color-gold)' : 'var(--color-border)',
                background: recipientType === type ? 'var(--color-gold)' : 'transparent',
                color: recipientType === type ? '#000' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: recipientType === type ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
          DESCRIBE YOUR SITUATION
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Describe your situation in detail — what happened, who is involved, what you want them to do..."
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
          {situation.length}/3000
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
        {loading ? 'Generating Notice...' : 'Generate Legal Notice'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚖️</div>
          <p>Lexa is drafting your legal notice...</p>
        </div>
      )}

      {notice && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-gold)' }}>Legal Notice</h2>
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
            <ReactMarkdown>{DOMPurify.sanitize(notice)}</ReactMarkdown>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            ⚠️ This is an AI-generated draft. Have a lawyer review before sending. Fill in all blank fields with actual details.
          </p>
        </div>
      )}
    </div>
  )
}