/**
 * Document Routes
 * Handles file upload and document scanning endpoints.
 */

import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { scanDocument } from '../controllers/documentController.js'

const router = Router()

// Configure multer for file uploads
// Files are stored temporarily in uploads/ folder
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (_req, file, cb) => {
    // Give file a unique name to avoid conflicts
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

// Only allow PDF and DOCX files
const fileFilter = (_req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
})

// POST /api/document/scan
// Accepts a single file upload with field name 'document'
router.post('/scan', upload.single('document'), scanDocument)

export default router