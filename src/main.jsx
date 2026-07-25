import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

let savedTheme
try {
  savedTheme = localStorage.getItem('lexa-theme')
} catch {
  savedTheme = null
}
const initialTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light'
document.documentElement.dataset.theme = initialTheme
document.documentElement.style.colorScheme = initialTheme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
