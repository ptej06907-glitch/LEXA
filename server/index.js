import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
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

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Lexa API', version: '1.0.0' })
})

app.use('/api/legal', legalRouter)
app.use('/api/document', documentRouter)
app.use('/api/fir', firRouter)
app.use('/api/notice', noticeRouter)
app.use('/api/judgment', judgmentRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, _req, res, _next) => {
  console.error('[Lexa API Error]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const server = app.listen(PORT, () => {
  console.log(`Lexa API running on port ${PORT}`)
})

server.on('error', (err) => {
  console.error('Server error:', err)
})

export default app