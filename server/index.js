/**
 * Lexa API Server
 * Express backend for the Indian legal advisor application.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import legalRouter from './routes/legal.js'
import documentRouter from './routes/document.js'

/* ─── Resolve __dirname for ES modules ───────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ─── Load environment variables from server/.env ──────────────────────── */
dotenv.config({ path: path.join(__dirname, '.env') })

/* ─── Initialize Express app ─────────────────────────────────────────────── */
const app = express()

const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

/* ─── CORS — only allow requests from the configured frontend origin ─────── */
app.use(cors({ origin: CLIENT_URL, credentials: true }))

/* ─── JSON body parser ───────────────────────────────────────────────────── */
app.use(express.json())

/* ─── Health check route ─────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Lexa API', version: '1.0.0' })
})

/* ─── Legal advice routes ─────────────────────────────────────────────────── */
app.use('/api/legal', legalRouter)

/* ─── Document scanning routes ───────────────────────────────────────────── */
app.use('/api/document', documentRouter)

/* ─── 404 handler ────────────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

/* ─── Global error handler ───────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('[Lexa API Error]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

/* ─── Start server ───────────────────────────────────────────────────────── */
const server = app.listen(PORT, () => {
  console.log(`Lexa API running on port ${PORT}`)
})

server.on('error', (err) => {
  console.error('Server error:', err)
})

export default app