import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import helmet from 'helmet'
import { fileURLToPath, pathToFileURL } from 'url'
import { rateLimit } from 'express-rate-limit'
import legalRouter from './routes/legal.js'
import documentRouter from './routes/document.js'
import firRouter from './routes/fir.js'
import noticeRouter from './routes/notice.js'
import judgmentRouter from './routes/judgment.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

/* ─── SECURITY 1: Helmet ─────────────────────────────────────────────────────
   Automatically sets 15+ secure HTTP headers on every response.
   This single line prevents clickjacking, MIME sniffing, XSS via headers,
   protocol downgrade attacks, and information leakage.
   Think of it as a security shield wrapping every response Lexa sends.
──────────────────────────────────────────────────────────────────────────── */
app.use(helmet())

/* ─── SECURITY 2: CORS lockdown ──────────────────────────────────────────────
   Only allows requests from your exact frontend URL.
   No wildcards, no other origins allowed.
   Prevents random websites from making requests to your API on behalf of users.
──────────────────────────────────────────────────────────────────────────── */
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10kb' }))

/* ─── SECURITY 3: Rate limiting ──────────────────────────────────────────────
   Different limits for different routes:
   - AI routes (legal, FIR, notice, judgment): 10 requests per minute
     These call Groq which costs money — strict limit prevents abuse
   - Document scan: 5 requests per minute
     File uploads are expensive — even stricter limit
   - General API: 100 requests per minute
     Health checks etc. — generous limit
   When limit is hit: returns 429 Too Many Requests
──────────────────────────────────────────────────────────────────────────── */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many uploads. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

/* ─── Apply general rate limit to all routes ─────────────────────────────── */
app.use(generalLimiter)

/* ─── Health check ───────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Lexa API', version: '1.0.0' })
})

/* ─── Routes with specific rate limits ───────────────────────────────────── */
app.use('/api/legal', aiLimiter, legalRouter)
app.use('/api/document', uploadLimiter, documentRouter)
app.use('/api/fir', aiLimiter, firRouter)
app.use('/api/notice', aiLimiter, noticeRouter)
app.use('/api/judgment', aiLimiter, judgmentRouter)

/* ─── 404 handler ────────────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

/* ─── SECURITY 4: Error sanitization ────────────────────────────────────────
   In production, never expose internal error details to the client.
   Stack traces, file paths, and database errors stay server-side only.
   Users see a generic message — attackers learn nothing useful.
──────────────────────────────────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  const status = Number.isInteger(err.status) ? err.status : 500
  const isDev = process.env.NODE_ENV !== 'production'
  const safeClientErrors = {
    400: 'Invalid request.',
    413: 'Request payload is too large.',
  }

  if (status >= 500) console.error('[Lexa API Error]', err)

  res.status(status).json({
    error: status >= 500
      ? (isDev ? err.message : 'Something went wrong. Please try again.')
      : (safeClientErrors[status] || 'Request could not be processed.'),
  })
})

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isMainModule) {
  const server = app.listen(PORT, () => {
    console.log(`Lexa API running on port ${PORT}`)
  })

  server.on('error', (err) => {
    console.error('Server error:', err)
  })
}

export default app
