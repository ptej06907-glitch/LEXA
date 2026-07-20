/**
 * Legal Advisor Page
 * Lets users describe a legal situation, pick a category, and receive AI advice.
 * All styling uses CSS custom properties from index.css.
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'

/* Legal practice areas available for categorization */
const CATEGORIES = [
  'Criminal',
  'Civil',
  'Consumer',
  'Property',
  'Employment',
  'Family',
  'Constitutional',
]

const API_URL = 'http://localhost:3001/api/legal/advice'
const MAX_SITUATION_LENGTH = 2000

function LegalAdvisor() {
  const [category, setCategory] = useState('Criminal')
  const [situation, setSituation] = useState('')
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Submit the situation to the Lexa API and display the AI response.
   */
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setAdvice('')

    const trimmed = situation.trim()
    if (!trimmed) {
      setError('Please describe your legal situation before submitting.')
      return
    }

    if (trimmed.length > MAX_SITUATION_LENGTH) {
      setError(`Situation must be ${MAX_SITUATION_LENGTH} characters or fewer.`)
      return
    }

    setLoading(true)

    try {
      const { data } = await axios.post(API_URL, {
        situation: trimmed,
        category,
      })
      setAdvice(data.advice)
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="advisor">
      <header className="advisor__header">
        <h1 className="advisor__title">Legal Advice</h1>
        <p className="advisor__subtitle">
          Describe your situation and get guidance grounded in Indian law.
        </p>
      </header>

      <form className="advisor__form" onSubmit={handleSubmit}>
        {/* Category selector — pill buttons, gold when active */}
        <fieldset className="advisor__categories">
          <legend className="advisor__label">Category</legend>
          <div className="advisor__pills">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={`category-pill${category === item ? ' category-pill--active' : ''}`}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Situation input */}
        <label className="advisor__field" htmlFor="situation">
          <span className="advisor__label">Your situation</span>
          <textarea
            id="situation"
            className="advisor__textarea"
            placeholder="Describe your legal situation in detail..."
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            maxLength={MAX_SITUATION_LENGTH}
            rows={8}
            disabled={loading}
          />
          <span className="advisor__char-count">
            {situation.length}/{MAX_SITUATION_LENGTH}
          </span>
        </label>

        {/* Submit — gold primary action */}
        <button
          type="submit"
          className="cta-button advisor__submit"
          disabled={loading}
        >
          {loading ? 'Analyzing your situation…' : 'Get Legal Advice'}
        </button>
      </form>

      {/* Loading indicator while waiting for the API */}
      {loading && (
        <div className="advisor__loading" role="status" aria-live="polite">
          <span className="advisor__spinner" aria-hidden="true" />
          Lexa is reviewing your situation under Indian law…
        </div>
      )}

      {/* API or validation errors */}
      {error && (
        <div className="advisor__error" role="alert">
          {error}
        </div>
      )}

      {/* AI response rendered as markdown inside a card */}
      {advice && !loading && (
        <article className="advisor__response">
          <h2 className="advisor__response-title">Lexa&apos;s Advice</h2>
          <div className="advisor__markdown">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
        </article>
      )}
    </main>
  )
}

export default LegalAdvisor
