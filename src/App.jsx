import { AnimatePresence, motion } from 'motion/react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import LegalAdvisor from './pages/LegalAdvisor'
import DocumentScanner from './pages/DocumentScanner'
import FIRGenerator from './pages/FIRGenerator'
import LegalNotice from './pages/LegalNotice'
import CaseFinder from './pages/CaseFinder'
import TextEffect from './components/motion/TextEffect'

const navItems = [
  ['/advisor', 'Legal Advice'],
  ['/scanner', 'Document Scan'],
  ['/fir', 'FIR Generator'],
  ['/notice', 'Legal Notice'],
  ['/judgments', 'Case Finder'],
]

function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar" aria-label="Main navigation" style={{ position: 'fixed', inset: '0 0 auto', zIndex: 100, background: 'rgba(10, 10, 15, 0.94)', backdropFilter: 'blur(14px)' }}>
      <Link className="navbar__logo" to="/" aria-label="Lexa home">LEXA</Link>
      <div className="navbar__links" style={{ overflowX: 'auto' }}>
        {navItems.map(([path, label]) => (
          <Link
            key={path}
            to={path}
            className={`navbar__link nav-link${location.pathname === path ? ' navbar__link--active' : ''}`}
            style={{ padding: '.4rem .55rem', whiteSpace: 'nowrap' }}
            aria-current={location.pathname === path ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function Home() {
  return (
    <main className="hero" style={{ minHeight: '100vh', paddingTop: '8rem' }}>
      <p className="page-eyebrow">Indian law, made understandable</p>
      <TextEffect className="hero__heading">Your AI Legal Advisor</TextEffect>
      <p className="hero__subheading">
        Practical guidance on Indian law — from legal questions and document review to FIR drafts, notices, and court judgments.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-md)' }}>
        <Link className="home-action home-action--primary" to="/advisor" style={{ background: 'var(--color-gold)', color: 'var(--color-bg)', padding: '.875rem 1.75rem', fontWeight: 650, textDecoration: 'none' }}>
          Get Legal Help
        </Link>
        <Link className="home-action home-action--secondary" to="/scanner" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', padding: '.875rem 1.75rem', fontWeight: 650, textDecoration: 'none' }}>
          Scan a Document
        </Link>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
        {navItems.slice(2).map(([path, label]) => (
          <Link key={path} className="nav-link" to={path} style={{ color: 'var(--color-text-secondary)', padding: '.45rem .7rem', textDecoration: 'none', fontSize: '.875rem' }}>
            {label} →
          </Link>
        ))}
      </div>
    </main>
  )
}

const transition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.2, ease: 'easeOut' },
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} {...transition} style={{ minHeight: '100vh' }}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/advisor" element={<LegalAdvisor />} />
          <Route path="/scanner" element={<DocumentScanner />} />
          <Route path="/fir" element={<FIRGenerator />} />
          <Route path="/notice" element={<LegalNotice />} />
          <Route path="/judgments" element={<CaseFinder />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
