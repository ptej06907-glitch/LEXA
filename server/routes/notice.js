import { Router } from 'express'
import { generateNotice } from '../controllers/noticeController.js'

const router = Router()

router.post('/generate', async (req, res, next) => {
  try {
    const { situation } = req.body

    if (!situation || typeof situation !== 'string' || !situation.trim()) {
      return res.status(400).json({ error: 'Situation description is required' })
    }

    if (situation.length > 3000) {
      return res.status(400).json({ error: 'Situation must be under 3000 characters' })
    }

    await generateNotice(req, res, next)
  } catch (err) {
    next(err)
  }
})

export default router