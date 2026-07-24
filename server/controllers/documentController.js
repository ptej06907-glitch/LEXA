import Groq from 'groq-sdk'
import fs from 'fs'
import mammoth from 'mammoth'

const SCAN_SYSTEM_PROMPT = `You are Lexa, an expert Indian legal document analyzer. When given the text of a legal document or agreement, analyze it thoroughly and provide:

1) **Document Summary** — What type of document is this and what is its purpose
2) **Red Flags** — List every clause that is unfair, exploitative, or potentially illegal under Indian law. For each red flag cite the specific section or law it violates.
3) **Missing Clauses** — Important protections that should be in this document but are missing
4) **Exploits** — Any clauses that could be used against the signing party
5) **Overall Risk Level** — Low / Medium / High with explanation
6) **Recommendations** — What to negotiate or demand before signing

Be thorough, specific, and cite relevant Indian laws (Contract Act 1872, Consumer Protection Act, etc).`

function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    import('pdfreader').then(({ PdfReader }) => {
      const reader = new PdfReader()
      const lines = []

      reader.parseFileItems(filePath, (err, item) => {
        if (err) {
          reject(err)
        } else if (!item) {
          resolve(lines.join(' '))
        } else if (item.text) {
          lines.push(item.text)
        }
      })
    }).catch(reject)
  })
}

export async function scanDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { mimetype, path: filePath, originalname } = req.file
    let extractedText = ''

    if (mimetype === 'application/pdf') {
      try {
        extractedText = await extractTextFromPDF(filePath)
      } catch {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        return res.status(400).json({ error: 'Could not read PDF. Make sure it is not a scanned image.' })
      }
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath })
      extractedText = result.value
    } else {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      return res.status(400).json({ error: 'Only PDF and DOCX files are supported' })
    }

    // Clean up temp file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract text from document.' })
    }

    // Limit to 3000 characters to stay within Groq free tier limits
    const truncatedText = extractedText.slice(0, 2000)

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SCAN_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Please analyze this legal document:\n\nFilename: ${originalname}\n\nDocument Text:\n${truncatedText}`,
        },
      ],
    })

    const analysis = completion.choices[0]?.message?.content

    if (!analysis) {
      return res.status(500).json({ error: 'No analysis generated' })
    }

    res.json({ analysis, filename: originalname, charactersAnalyzed: truncatedText.length })
  } catch (error) {
    console.error('[scanDocument]', error)
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    next(error)
  }
}
