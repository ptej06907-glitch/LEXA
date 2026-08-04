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

Account for India's criminal-law transition on 1 July 2024. Older judgments may interpret the IPC, CrPC, or Indian Evidence Act; label those as legacy-law authorities and explain their possible relevance to BNS, BNSS, or BSA only when a reliable correspondence exists. Do not claim that differently worded provisions are equivalent. If the date of the alleged conduct is unclear, explain why it affects the applicable code.

Only provide case names and citations you are sufficiently confident are real. Never fabricate a citation. Tell the user to verify every citation and the continued applicability of each principle using an authoritative legal database. Focus on cases directly relevant to the supplied facts.`

export async function findJudgments(req, res, next) {
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
    next(error)
  }
}
