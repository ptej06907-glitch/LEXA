import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react'
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
  { number: '01', group: 'Understand', path: '/advisor', title: 'Legal Advice', copy: 'Clarify your position, possible rights, and practical next steps.' },
  { number: '02', group: 'Understand', path: '/scanner', title: 'Document Review', copy: 'Examine agreements for risks, unfair clauses, and missing protections.' },
  { number: '03', group: 'Prepare', path: '/fir', title: 'FIR Draft', copy: 'Organise the facts into a structured first information report.' },
  { number: '04', group: 'Prepare', path: '/notice', title: 'Legal Notice', copy: 'Prepare a formally structured notice for review and sending.' },
  { number: '05', group: 'Research', path: '/judgments', title: 'Case Research', copy: 'Find relevant Supreme Court and High Court precedents.' },
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
    <main className="home">
      <section className="home__opening" aria-labelledby="home-title">
        <header className="home__intro">
          <p className="home__kicker">Lexa · Indian legal tools</p>
          <h1 id="home-title">A practical starting point for legal matters.</h1>
          <p>Understand an issue, examine a document, or organise a first draft before consulting a legal professional.</p>
        </header>
        <Link className="home__primary-action" to="/advisor">
          <span><small>Not sure where to begin?</small><strong>Start with legal guidance</strong></span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </section>

      <section className="service-index" aria-labelledby="services-title">
        <header className="service-index__header">
          <div><p className="section-label">Services</p><h2 id="services-title">Choose a starting point</h2></div>
          <p>Each tool guides you through the information needed for that task.</p>
        </header>
        <div className="service-index__list">
          {tools.map(({ number, group, path, title, copy }) => (
            <Link key={path} className="service-row" to={path}>
              <span className="service-row__number">{number}</span>
              <span className="service-row__group">{group}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <ArrowRight className="service-row__arrow" size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <aside className="home__notice" aria-label="Important information">
        <ShieldCheck size={17} aria-hidden="true" />
        <div><strong>Designed to help you prepare</strong><p>Lexa provides general legal information and drafting assistance. Verify important decisions and documents with a qualified lawyer.</p></div>
      </aside>
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
