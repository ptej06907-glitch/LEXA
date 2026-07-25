import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowUpRight, BookOpen, FileSearch, FileText, Menu, MessageSquareText, Scale, ShieldCheck, Sparkles, X } from 'lucide-react'
import LegalAdvisor from './pages/LegalAdvisor'
import DocumentScanner from './pages/DocumentScanner'
import FIRGenerator from './pages/FIRGenerator'
import LegalNotice from './pages/LegalNotice'
import CaseFinder from './pages/CaseFinder'
import ThemeToggle from './components/ThemeToggle'

const navItems = [
  ['/advisor', 'Legal Advice'],
  ['/scanner', 'Document Scan'],
  ['/fir', 'FIR Generator'],
  ['/notice', 'Legal Notice'],
  ['/judgments', 'Case Finder'],
]

const tools = [
  { path: '/advisor', title: 'Legal Advice', copy: 'Understand your position, rights, and practical next steps under Indian law.', icon: MessageSquareText, featured: true },
  { path: '/scanner', title: 'Document Scan', copy: 'Review contracts and agreements for risks, unfair clauses, and missing protections.', icon: FileSearch, featured: true },
  { path: '/fir', title: 'FIR Draft', copy: 'Build a structured first information report through a guided workflow.', icon: FileText },
  { path: '/notice', title: 'Legal Notice', copy: 'Prepare a formal notice with the correct structure and legal framing.', icon: Scale },
  { path: '/judgments', title: 'Case Finder', copy: 'Research relevant Supreme Court and High Court precedents.', icon: BookOpen },
]

function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar" aria-label="Main navigation">
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
      <ThemeToggle className="theme-toggle--desktop" />
      <button type="button" className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button className="mobile-drawer-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div id="mobile-navigation" className="mobile-drawer" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: .18, ease: 'easeOut' }}>
              {navItems.map(([path, label]) => <Link key={path} to={path} onClick={() => setMenuOpen(false)} aria-current={location.pathname === path ? 'page' : undefined}>{label}</Link>)}
              <ThemeToggle className="theme-toggle--mobile" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}

function Home() {
  return (
    <main className="hero">
      <header className="hero__intro">
        <p className="hero__eyebrow"><span aria-hidden="true" />Built for Indian law</p>
        <h1 className="hero__heading">Understand your position.<br />Prepare your next step.</h1>
        <p className="hero__subheading">
          Ask a legal question, review a document, or prepare a first draft. Lexa helps you organise the facts before you speak with a lawyer.
        </p>
        <div className="hero__scope" aria-label="Lexa capabilities">
          <span>Legal guidance</span>
          <span>Document review</span>
          <span>Draft preparation</span>
        </div>
      </header>
      <div className="tool-grid">
        {tools.map(({ path, title, copy, icon: Icon, featured }) => (
          <Link key={path} className={`tool-card${featured ? ' tool-card--featured' : ''}`} to={path}>
            <span className="tool-card__icon"><Icon size={18} aria-hidden="true" /></span>
            <h2>{title}</h2><p>{copy}</p><ArrowUpRight className="tool-card__arrow" size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
      <div className="trust-strip"><span><ShieldCheck size={14} /> Strict input and upload controls</span><span><Sparkles size={14} /> No account required</span><span><Scale size={14} /> Always verify with a lawyer</span></div>
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
