import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

function getCurrentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getCurrentTheme)
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      localStorage.setItem('lexa-theme', theme)
    } catch {
      // The selected theme still applies when browser storage is unavailable.
    }
  }, [theme])

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="theme-toggle__glyph" aria-hidden="true">{isDark ? <Sun size={15} /> : <Moon size={15} />}</span>
      <span className="theme-toggle__label">{isDark ? 'Light' : 'Dark'}</span>
      <span className="theme-toggle__state" aria-hidden="true">{isDark ? 'D' : 'L'}</span>
    </button>
  )
}
