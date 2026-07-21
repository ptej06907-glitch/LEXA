import Groq from 'groq-sdk'

const JUDGMENT_SYSTEM_PROMPT = `You are Lexa, an expert Indian legal researcher with deep knowledge of Supreme Court and High Court judgments. When given a legal situation or topic, provide:

1) **Relevant Landmark Cases** — List 5-8 most relevant Supreme Court and High Court judgments with:
   - Full case name (Petitioner vs Respondent)
   - Court and year
   - Case citation (AIR/SCC/SCR number if known)
   - Key legal principle established
   - How it applies to the situation

2) **Legal Principles** — Key legal principles established by these cases

3) **How to Use These Cases** — How the person can cite these in their situation

Always include actual case names and citations. Focus on cases that are directly relevant and frequently cited in Indian courts.`

export async function findJudgments(req, res) {
  try {
    const { situation, category } = req.body

    if (!situation || !situation.trim()) {
      return res.status(400).json({ error: 'Situation description is required' })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [
        { role: 'system', content: JUDGMENT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Find relevant Supreme Court and High Court judgments for this legal situation:

Category: ${category || 'General'}

Situation:
${situation}`,
        },
      ],
    })

    const judgments = completion.choices[0]?.message?.content

    if (!judgments) {
      return res.status(500).json({ error: 'Could not find judgments' })
    }

    res.json({ judgments })
  } catch (error) {
    console.error('[findJudgments]', error)
    res.status(500).json({ error: error.message || 'Failed to find judgments' })
  }
}