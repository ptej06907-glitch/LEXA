import Groq from 'groq-sdk'

const NOTICE_SYSTEM_PROMPT = `You are Lexa, an expert Indian legal advisor specializing in drafting formal legal notices. Generate complete, professionally worded legal notices that comply with Indian law.

The notice must include:
1) **Sender Details** — Leave blanks for personal info
2) **Recipient Details** — Leave blanks for recipient info
3) **Date**
4) **Subject** — Clear subject line
5) **Body** — Formal legal language with:
   - Background and facts
   - Legal basis (cite specific Indian laws and sections)
   - Grievance clearly stated
   - Specific demand or relief sought
   - Deadline for compliance (usually 15-30 days)
   - Consequences of non-compliance
6) **Closing** — Formal closing with signature block

Use formal legal language. Cite specific Indian laws. Make it ready to send.`

export async function generateNotice(req, res, next) {
  try {
    const { situation, noticeType, recipientType } = req.body

    if (!situation || !situation.trim()) {
      return res.status(400).json({ error: 'Situation description is required' })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [
        { role: 'system', content: NOTICE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Generate a ${noticeType || 'Legal'} notice to a ${recipientType || 'party'} for the following situation:\n\n${situation}`,
        },
      ],
    })

    const notice = completion.choices[0]?.message?.content

    if (!notice) {
      return res.status(500).json({ error: 'Could not generate notice' })
    }

    res.json({ notice })
  } catch (error) {
    console.error('[generateNotice]', error)
    next(error)
  }
}
