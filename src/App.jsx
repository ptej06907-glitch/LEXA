/**
 * Lexa App Shell
 * Root layout with shared navbar and React Router pages.
 * All styling uses CSS custom properties from index.css.
 */

import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import LegalAdvisor from './pages/LegalAdvisor.jsx'

/* Navigation links — Legal Advice routes to the advisor page */
const NAV_LINKS = [
  { label: 'Legal Advice', to: '/advisor' },
  { label: 'Document Scan', to: '#scan' },
  { label: 'Judgments', to: '#judgments' },
  { label: 'Sign In', to: '#signin' },
]

/** Shared top navigation used on every page */
function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo" aria-label="Lexa home">
        LEXA
      </Link>

      <nav aria-label="Main navigation">
        <ul className="navbar__links">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              {to.startsWith('/') ? (
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `navbar__link${isActive ? ' navbar__link--active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              ) : (
                <a href={to} className="navbar__link">
                  {label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

/** Homepage — hero with CTA linking to the legal advisor */
function HomePage() {
  return (
    <main className="hero">
      <h1 className="hero__heading">Your AI Legal Advisor</h1>
      <p className="hero__subheading">
        Expert guidance on Indian law — IPC, CrPC, Constitution, document
        review, and court judgments — powered by AI.
      </p>
      <Link to="/advisor" className="cta-button">
        Get Legal Help
      </Link>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/advisor" element={<LegalAdvisor />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
