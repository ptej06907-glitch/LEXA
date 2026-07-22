import { Router } from 'express'
import { z } from 'zod'
import { findJudgments } from '../controllers/judgmentController.js'

const router = Router()

/* ─── SECURITY: Zod schema for judgment finder requests ─────────────────────
   Validates all fields strictly:
   - situation: required, min 20 chars, max 3000
   - category: must be one of our predefined categories only
──────────────────────────────────────────────────────────────────────────── */
const judgmentSchema = z.object({
  situation: z
    .string({ required_error: 'Situation description is required' })
    .min(20, 'Please provide more detail about your situation')
    .max(3000, 'Situation must be under 3000 characters')
    .trim(),
  category: z.enum([
    'Criminal', 'Civil', 'Consumer', 'Property',
    'Employment', 'Family', 'Constitutional', 'Cyber'
  ]).default('Civil'),
})

router.post('/find', async (req, res, next) => {
  try {
    const result = judgmentSchema.safeParse(req.body)

    if (!result.success) {
      const message = result.error.errors[0]?.message || 'Invalid request'
      return res.status(400).json({ error: message })
    }

    req.body = result.data
    await findJudgments(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router