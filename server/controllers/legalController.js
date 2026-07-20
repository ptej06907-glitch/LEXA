/**
 * Legal Controller
 * Handles AI-powered legal advice generation via Groq API.
 */

import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are Lexa, an expert AI legal advisor specializing in Indian law. You have deep knowledge of the Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), Indian Constitution, Consumer Protection Act, and all major Indian legislation. When given a situation, provide:
1) A clear assessment of the legal position
2) Relevant IPC/CrPC sections or constitutional articles that apply
3) Recommended course of action step by step
4) Important rights the person should know
5) Whether they urgently need a lawyer
Always cite specific section numbers. Be precise, practical, and empathetic.`

export async function getLegalAdvice(req, res, next) {
  try {
    const { situation, category } = req.body

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Legal category: ${category || 'General'}\n\nSituation:\n${situation}`,
        },
      ],
    })

    const advice = completion.choices[0]?.message?.content

    if (!advice) {
      return res.status(500).json({ error: 'No advice generated' })
    }

    res.json({ advice })
  } catch (error) {
    console.error('[getLegalAdvice]', error)
    res.status(500).json({ error: error.message || 'Failed to generate legal advice' })
  }
}