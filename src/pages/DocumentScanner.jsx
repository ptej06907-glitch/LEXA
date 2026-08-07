import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DOMPurify from 'dompurify'
import Button from '../components/Button'
import LoadingState from '../components/LoadingState'
import { FileCheck2, UploadCloud } from 'lucide-react'
import { apiUrl } from '../lib/api'

const markdownComponents = {
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
}

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
      const response = await fetch(apiUrl('/api/document/scan'), { method: 'POST', body: formData })
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
      <header className="page-header"><p className="page-eyebrow">Review before you sign</p><h1 className="page-title">Document Scanner</h1><p className="page-subtitle">Upload a legal document and Lexa will identify red flags, unfair clauses, and potential risks.</p><div className="page-header__folio"><span>Workspace 02</span><span>Document intake</span><span>PDF / DOC / DOCX</span></div></header>

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
        <span className="upload-zone__reference" aria-hidden="true">INTAKE / 01</span>
        <div className="tool-card__icon upload-zone__icon" aria-hidden="true">{file ? <FileCheck2 size={21} /> : <UploadCloud size={21} />}</div>
        {file ? <><p className="upload-zone__title upload-zone__title--selected">{file.name}</p><p className="upload-zone__copy">{(file.size / 1024 / 1024).toFixed(2)} MB / Click to change file</p></> : <><p className="upload-zone__title">Drop your document here or click to browse</p><p className="upload-zone__copy">PDF, DOC, or DOCX / Maximum 10MB</p></>}
        <span className="upload-zone__security">Private upload / validated file types</span>
      </div>

      <div className="scan-actions">
        <span>Automated review / not a substitute for counsel</span>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <Button onClick={handleScan} disabled={!file} loading={loading} fullWidth className="mb-8">Scan for Red Flags</Button>
      </div>
      {loading && <LoadingState label="Reviewing your document" detail="Reading clauses, identifying risks, and checking for missing protections." />}
      {analysis && <article className="result-card"><div className="result-header"><h2 className="result-title">Document Analysis</h2><span className="result-reference">Risk review / preliminary</span></div><div className="result-content"><ReactMarkdown components={markdownComponents}>{DOMPurify.sanitize(analysis)}</ReactMarkdown></div><p className="result-disclaimer">This is AI-generated analysis. Have a lawyer review the complete document before signing.</p></article>}
    </main>
  )
}
