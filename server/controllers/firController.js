/**
 * FIR Controller
 * Generates a ready-to-file First Information Report
 * based on the user's situation using Groq AI.
 */

import Groq from 'groq-sdk'

const FIR_SYSTEM_PROMPT = `You are Lexa, an expert Indian legal advisor specializing in drafting First Information Reports (FIRs). When given details of an incident, generate a complete, properly formatted FIR draft that would be accepted by Indian police stations.

The FIR must include:
1) **TO** — Addressed to the correct officer (Station House Officer)
2) **FROM** — Complainant details section (leave blanks for personal info)
3) **Date and Place of Incident**
4) **Nature of Complaint** — Clear, formal legal language
5) **Facts of the Case** — Detailed chronological account
6) **Relevant IPC Sections** — List every applicable IPC/BNS section with explanation
7) **Accused Details** — Section for known/unknown accused
8) **Witnesses** — Section for witness details
9) **Relief Sought** — What action the complainant seeks
10) **Declaration** — Standard declaration that the information is true

Use formal legal language. Cite specific IPC sections (or BNS 2023 equivalents). Make it ready to print and submit.`

export async function generateFIR(req, res, next) {
  try {
    const { incident, category, location, date } = req.body

    if (!incident || !incident.trim()) {
      return res.status(400).json({ error: 'Incident description is required' })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [
        { role: 'system', content: FIR_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate a complete FIR draft for the following incident:

Category: ${category || 'General'}
Location: ${location || 'Not specified'}
Date of Incident: ${date || 'Not specified'}

Incident Description:
${incident}`,
        },
      ],
    })

    const fir = completion.choices[0]?.message?.content

    if (!fir) {
      return res.status(500).json({ error: 'Could not generate FIR' })
    }

    res.json({ fir })
  } catch (error) {
    console.error('[generateFIR]', error)
    next(error)
  }
}
