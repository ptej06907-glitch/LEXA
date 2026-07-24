import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import LoadingState from '../components/LoadingState'
import { FileCheck2, UploadCloud } from 'lucide-react'

export default function DocumentScanner() {
  const [file, setFile] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
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

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)

  const handleScan = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }
    setLoading(true)
    setError('')
    setAnalysis('')
    try {
      const formData = new FormData()
      formData.append('document', file)
      const response = await fetch('http://localhost:3001/api/document/scan', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to scan document')
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openFilePicker = () => {
    if (!loading) fileInputRef.current?.click()
  }

  return (
    <main className="page-shell">
      <header className="page-header"><p className="page-eyebrow">Review before you sign</p><h1 className="page-title">Document Scanner</h1><p className="page-subtitle">Upload a legal document and Lexa will identify red flags, unfair clauses, and potential risks.</p></header>

      <div
        className={`upload-zone${dragOver ? ' upload-zone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFilePicker}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFilePicker() } }}
        role="button"
        tabIndex={loading ? -1 : 0}
        aria-disabled={loading}
        aria-label={file ? `Selected ${file.name}. Choose a different document` : 'Choose a PDF or Word document'}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" hidden disabled={loading} onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} />
        <div className="tool-card__icon" aria-hidden="true" style={{ margin: '0 auto var(--space-md)' }}>{file ? <FileCheck2 size={19} /> : <UploadCloud size={19} />}</div>
        {file ? <><p style={{ color: 'var(--color-gold)', fontWeight: 650, margin: 0 }}>{file.name}</p><p style={{ color: 'var(--color-text-secondary)', fontSize: '.875rem', margin: '.25rem 0 0' }}>{(file.size / 1024 / 1024).toFixed(2)} MB — Click to change file</p></> : <><p style={{ fontWeight: 650, margin: 0 }}>Drop your document here or click to browse</p><p style={{ color: 'var(--color-text-secondary)', fontSize: '.875rem', margin: '.5rem 0 0' }}>PDF, DOC, or DOCX · Maximum 10MB</p></>}
      </div>

      <div style={{ height: 'var(--space-lg)' }} />
      {error && <div className="alert-error" role="alert">{error}</div>}
      <Button onClick={handleScan} disabled={!file} loading={loading} fullWidth className="mb-8">Scan for Red Flags</Button>
      {loading && <LoadingState label="Reviewing your document" detail="Reading clauses, identifying risks, and checking for missing protections." />}
      {analysis && <article className="result-card"><div className="result-header"><h2 className="result-title">Document Analysis</h2></div><div className="result-content"><ReactMarkdown>{DOMPurify.sanitize(analysis)}</ReactMarkdown></div><p className="result-disclaimer">This is AI-generated analysis. Have a lawyer review the document before signing.</p></article>}
    </main>
  )
}
