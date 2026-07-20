import { Router } from 'express'
import { getLegalAdvice } from '../controllers/legalController.js'

const router = Router()

router.post('/advice', async (req, res, next) => {
  try {
    const { situation } = req.body

    if (!situation || typeof situation !== 'string' || !situation.trim()) {
      return res.status(400).json({ error: 'Situation is required' })
    }

    if (situation.length > 2000) {
      return res.status(400).json({ error: 'Situation must be 2000 characters or fewer' })
    }

    await getLegalAdvice(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router