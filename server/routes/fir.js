/**
 * FIR Routes
 * API endpoints for FIR draft generation.
 */

import { Router } from 'express'
import { generateFIR } from '../controllers/firController.js'

const router = Router()

// POST /api/fir/generate
// Accepts incident details and returns a complete FIR draft
router.post('/generate', async (req, res, next) => {
  try {
    const { incident } = req.body

    if (!incident || typeof incident !== 'string' || !incident.trim()) {
      return res.status(400).json({ error: 'Incident description is required' })
    }

    if (incident.length > 3000) {
      return res.status(400).json({ error: 'Incident description must be under 3000 characters' })
    }

    await generateFIR(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router