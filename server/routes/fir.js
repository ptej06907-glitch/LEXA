import { Router } from 'express'
import { z } from 'zod'
import { generateFIR } from '../controllers/firController.js'

const router = Router()

/* ─── SECURITY: Zod schema for FIR generation requests ──────────────────────
   Validates all fields before they reach the AI:
   - incident: required, min 20 chars (needs enough detail), max 3000
   - category: must be one of our predefined types only
   - location: optional but max 200 chars
   - date: optional, must be valid date string format
──────────────────────────────────────────────────────────────────────────── */
const firSchema = z.object({
  incident: z
    .string({ required_error: 'Incident description is required' })
    .min(20, 'Please provide more detail about the incident')
    .max(3000, 'Incident description must be under 3000 characters')
    .trim(),
  category: z.enum([
    'Theft', 'Assault', 'Fraud', 'Cybercrime',
    'Harassment', 'Domestic Violence', 'Property Dispute', 'Other'
  ]).default('Other'),
  location: z
    .string()
    .max(200, 'Location must be under 200 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .max(50, 'Invalid date')
    .optional(),
})

router.post('/generate', async (req, res, next) => {
  try {
    const result = firSchema.safeParse(req.body)

    if (!result.success) {
      const message = result.error.errors[0]?.message || 'Invalid request'
      return res.status(400).json({ error: message })
    }

    req.body = result.data
    await generateFIR(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router