import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LegalAdvisor from './pages/LegalAdvisor'
import DocumentScanner from './pages/DocumentScanner'
import FIRGenerator from './pages/FIRGenerator'
import LegalNotice from './pages/LegalNotice'
import CaseFinder from './pages/CaseFinder'

function Navbar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-gold)', textDecoration: 'none', letterSpacing: '0.1em' }}>
        LEXA
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/advisor" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Legal Advice</Link>
        <Link to="/scanner" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Document Scan</Link>
        <Link to="/fir" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>FIR Generator</Link>
        <Link to="/notice" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Legal Notice</Link>
        <Link to="/judgments" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Case Finder</Link>
        <Link to="/" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontSize: '0.9rem', border: '1px solid var(--color-border)', padding: '0.4rem 1rem', borderRadius: '6px' }}>Sign In</Link>
      </div>
    </nav>
  )
}

function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1.5rem', lineHeight: '1.2' }}>
        Your AI Legal Advisor
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.25rem', maxWidth: '600px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
        Expert guidance on Indian law — IPC, CrPC, Constitution, document review, and court judgments — powered by AI.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/advisor" style={{ background: 'var(--color-gold)', color: '#000', padding: '0.875rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
          Get Legal Help
        </Link>
        <Link to="/scanner" style={{ background: 'transparent', color: 'var(--color-text-primary)', padding: '0.875rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', border: '1px solid var(--color-border)' }}>
          Scan a Document
        </Link>
        <Link to="/fir" style={{ background: 'transparent', color: 'var(--color-text-primary)', padding: '0.875rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', border: '1px solid var(--color-border)' }}>
          Draft an FIR
        </Link>
        <Link to="/notice" style={{ background: 'transparent', color: 'var(--color-text-primary)', padding: '0.875rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', border: '1px solid var(--color-border)' }}>
          Legal Notice
        </Link>
        <Link to="/judgments" style={{ background: 'transparent', color: 'var(--color-text-primary)', padding: '0.875rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', border: '1px solid var(--color-border)' }}>
          Find Cases
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/advisor" element={<LegalAdvisor />} />
        <Route path="/scanner" element={<DocumentScanner />} />
        <Route path="/fir" element={<FIRGenerator />} />
        <Route path="/notice" element={<LegalNotice />} />
        <Route path="/judgments" element={<CaseFinder />} />
      </Routes>
    </BrowserRouter>
  )
}