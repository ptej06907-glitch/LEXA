import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
            <span>{label}</span>
            {location.pathname === path && <motion.span className="navbar__active-line" layoutId="navbar-active" transition={{ duration: .2, ease: 'easeOut' }} />}
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
  const reduceMotion = useReducedMotion()
  const reveal = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: .48, ease: [0.22, 1, 0.36, 1] } } }
  const optionReveal = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 32, scale: .985 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: .52, ease: [0.22, 1, 0.36, 1] } } }
  const sequence = { hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : .07, delayChildren: reduceMotion ? 0 : .08 } } }
  const scrollViewport = { once: false, amount: .28 }

  return (
    <motion.main className="home" initial="hidden" animate="visible" variants={sequence}>
      <motion.div className="home__masthead" variants={reveal}>
        <span>LEXA / LEGAL DESK</span><span>IND · 2026</span><span className="home__status"><i />Systems available</span>
      </motion.div>

      <section className="case-hero" aria-labelledby="home-title">
        <motion.header className="case-hero__intro" variants={reveal}>
          <p className="section-label">AI-assisted Indian legal workspace</p>
          <h1 id="home-title">Legal work begins with a clear record.</h1>
          <p>Turn an uncertain situation into organised facts, a reviewable draft, or a focused line of legal research.</p>
        </motion.header>
        <motion.div className="scroll-reveal" initial="hidden" animate="hidden" whileInView="visible" viewport={scrollViewport} variants={optionReveal}>
          <Link className="case-feature" to="/advisor">
            <span className="case-feature__top"><small>01 / Advisory</small><ArrowRight size={19} aria-hidden="true" /></span>
            <span className="case-feature__body"><strong>Start with your situation</strong><small>Describe what happened. Lexa will help identify the issues and practical next steps.</small></span>
            <span className="case-feature__footer">Open legal advisor <i aria-hidden="true" /></span>
          </Link>
        </motion.div>
      </section>

      <motion.dl className="home__facts" variants={reveal}>
        <div><dt>Jurisdiction</dt><dd>India</dd></div>
        <div><dt>Workspace</dt><dd>Guidance · Drafting · Research</dd></div>
        <div><dt>Review standard</dt><dd>Verify with qualified counsel</dd></div>
      </motion.dl>

      <section className="case-docket" aria-labelledby="services-title">
        <motion.header className="case-docket__header" variants={reveal}>
          <div><p className="section-label">Matter index</p><h2 id="services-title">Select a legal task</h2></div>
          <span>Four focused workspaces</span>
        </motion.header>
        <motion.div className="case-docket__list" initial="hidden" animate="hidden" whileInView="visible" viewport={scrollViewport} variants={sequence}>
          {tools.slice(1).map(({ number, group, path, title, copy }) => (
            <motion.div className="scroll-reveal" key={path} variants={optionReveal}>
              <Link className="docket-row" to={path}>
                <span className="docket-row__number">{number}</span>
                <span className="docket-row__group">{group}</span>
                <span className="docket-row__content"><strong>{title}</strong><small>{copy}</small></span>
                <span className="docket-row__action">Open file <ArrowRight size={16} aria-hidden="true" /></span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <motion.aside className="home__notice" aria-label="Important information" variants={reveal}>
        <ShieldCheck size={17} aria-hidden="true" />
        <div><strong>Designed to help you prepare</strong><p>Lexa provides general legal information and drafting assistance. Verify important decisions and documents with a qualified lawyer.</p></div>
      </motion.aside>
    </motion.main>
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
