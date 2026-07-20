import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite configuration for Lexa frontend.
 * - React plugin enables JSX/ Fast Refresh
 * - Tailwind CSS v4 via the official Vite plugin (no PostCSS config needed)
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
