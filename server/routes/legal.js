import { Router } from 'express'
import { z } from 'zod'
import { getLegalAdvice } from '../controllers/legalController.js'

const router = Router()

/* ─── SECURITY: Zod schema for legal advice requests ────────────────────────
   Defines exactly what we accept:
   - situation: must be a non-empty string, max 2000 chars
   - category: must be one of our predefined categories only
   No other fields are accepted. Wrong types = rejected immediately.
──────────────────────────────────────────────────────────────────────────── */
const legalAdviceSchema = z.object({
  situation: z
    .string({ required_error: 'Situation is required' })
    .min(10, 'Situation must be at least 10 characters')
    .max(2000, 'Situation must be under 2000 characters')
    .trim(),
  category: z.enum([
    'Criminal', 'Civil', 'Consumer', 'Property',
    'Employment', 'Family', 'Constitutional', 'General'
  ]).default('General'),
}).strict()

router.post('/advice', async (req, res, next) => {
  try {
    /* Validate incoming request against schema */
    const result = legalAdviceSchema.safeParse(req.body)

    if (!result.success) {
      /* Return first validation error clearly */
      const message = result.error.issues[0]?.message || 'Invalid request'
      return res.status(400).json({ error: message })
    }

    /* Replace req.body with validated, sanitized data */
    req.body = result.data

    await getLegalAdvice(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router
