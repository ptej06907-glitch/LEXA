import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { scanDocument } from '../controllers/documentController.js'

const router = Router()

/* ─── SECURITY: Allowed file types ──────────────────────────────────────────
   We define exactly which MIME types we accept.
   MIME type alone can be spoofed — we also check magic numbers later
   in the controller (actual file bytes, not just the extension).
──────────────────────────────────────────────────────────────────────────── */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']

/* ─── SECURITY: Multer storage config ───────────────────────────────────────
   Files are stored temporarily in uploads/ folder.
   Filename is sanitized — we strip the original name completely
   and replace with a random timestamp-based name.
   This prevents path traversal attacks like "../../etc/passwd" as filename.
──────────────────────────────────────────────────────────────────────────── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    /* Sanitize: keep only the extension, generate random name */
    const ext = path.extname(file.originalname).toLowerCase()
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, safeName)
  },
})

/* ─── SECURITY: File filter ──────────────────────────────────────────────────
   Checks both MIME type AND file extension.
   Rejects anything that doesn't match both checks.
   A file named "malware.exe" renamed to "contract.pdf" will be caught
   because its MIME type won't match.
──────────────────────────────────────────────────────────────────────────── */
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()

  if (
    ALLOWED_MIME_TYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(ext)
  ) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, /* 10MB max */
    files: 1, /* Only one file at a time */
  },
})

/* ─── SECURITY: Multer error handler ────────────────────────────────────────
   Catches multer-specific errors (wrong file type, too large)
   and returns clean error messages instead of crashing.
──────────────────────────────────────────────────────────────────────────── */
const handleUpload = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' })
      }
      return res.status(400).json({ error: err.message })
    }
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    next()
  })
}

router.post('/scan', handleUpload, scanDocument)

export default router