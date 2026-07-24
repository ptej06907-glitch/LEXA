import { Router } from 'express'
import { z } from 'zod'
import { generateNotice } from '../controllers/noticeController.js'

const router = Router()

/* ─── SECURITY: Zod schema for legal notice requests ────────────────────────
   Validates all fields strictly:
   - situation: required, min 20 chars, max 3000
   - noticeType: must be one of our predefined types only
   - recipientType: must be one of our predefined types only
──────────────────────────────────────────────────────────────────────────── */
const noticeSchema = z.object({
  situation: z
    .string({ required_error: 'Situation description is required' })
    .min(20, 'Please provide more detail about your situation')
    .max(3000, 'Situation must be under 3000 characters')
    .trim(),
  noticeType: z.enum([
    'Demand Notice',
    'Cease and Desist',
    'Eviction Notice',
    'Employment Termination',
    'Consumer Complaint',
    'Defamation',
    'Recovery of Money',
    'Property Dispute',
  ]).default('Demand Notice'),
  recipientType: z.enum([
    'Individual',
    'Company',
    'Landlord',
    'Tenant',
    'Employer',
    'Employee',
    'Bank',
    'Government Body',
  ]).default('Individual'),
}).strict()

router.post('/generate', async (req, res, next) => {
  try {
    const result = noticeSchema.safeParse(req.body)

    if (!result.success) {
      const message = result.error.issues[0]?.message || 'Invalid request'
      return res.status(400).json({ error: message })
    }

    req.body = result.data
    await generateNotice(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router
