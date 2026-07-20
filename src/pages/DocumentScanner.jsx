/**
 * Document Scanner Page
 * Allows users to upload PDF/DOCX legal documents
 * and get AI-powered analysis of red flags and exploits.
 */

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

export default function DocumentScanner() {
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Handle file selection from input or drag and drop
  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF and DOCX files are supported')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB')
      return
    }

    setFile(selectedFile)
    setError('')
    setAnalysis('')
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  // Submit file for scanning
  const handleScan = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError('')
    setAnalysis('')

    try {
      // Use FormData to send file to backend
      const formData = new FormData()
      formData.append('document', file)

      const response = await fetch('http://localhost:3001/api/document/scan', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header — browser sets it automatically with boundary
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan document')
      }

      setAnalysis(data.analysis)
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

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
        }}>
          Document Scanner
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
          Upload any legal document — contract, agreement, rental deed — and Lexa will find red flags, unfair clauses, and exploits.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--color-gold)' : 'var(--color-border)'}`,
          borderRadius: '12px',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(201, 168, 76, 0.05)' : 'var(--color-surface)',
          transition: 'all 0.2s ease',
          marginBottom: '1.5rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
        />

        {/* Upload Icon */}
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>

        {file ? (
          <div>
            <p style={{ color: 'var(--color-gold)', fontWeight: '600', fontSize: '1rem' }}>
              {file.name}
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB — Click to change file
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--color-text-primary)', fontWeight: '600', fontSize: '1rem' }}>
              Drop your document here or click to browse
            </p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Supports PDF and DOCX — Max 10MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
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

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={!file || loading}
        style={{
          background: !file || loading ? '#333' : 'var(--color-gold)',
          color: !file || loading ? '#666' : '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '0.875rem 2rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: !file || loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '2rem',
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? 'Scanning Document...' : 'Scan for Red Flags'}
      </button>

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚖️</div>
          <p>Lexa is analyzing your document...</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            This may take 15-30 seconds for large documents
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
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
            Document Analysis
          </h2>
          <div style={{
            color: 'var(--color-text-primary)',
            lineHeight: '1.8',
            fontSize: '0.95rem',
          }}>
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}