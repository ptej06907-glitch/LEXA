import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Button from '../components/Button'
import useAuth from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19">
      <path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
      <path fill="currentColor" opacity=".75" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z" />
      <path fill="currentColor" opacity=".55" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z" />
      <path fill="currentColor" opacity=".9" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z" />
    </svg>
  )
}

export default function SignIn() {
  const { user, loading: sessionLoading, configured } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const location = useLocation()

  if (user) return <Navigate to={location.state?.from || '/'} replace />

  const handleGoogleSignIn = async () => {
    if (!supabase) return
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signin`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (signInError) {
      setError('Google sign-in could not be started. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signin-title">
        <LinkMark />
        <p className="page-eyebrow">Your private workspace</p>
        <h1 className="auth-title" id="signin-title">Sign in to Lexa</h1>
        <p className="auth-copy">Continue securely with your Google account. Lexa never receives or stores your Google password.</p>

        {!configured && (
          <div className="auth-config-note" role="status">
            Google sign-in is ready in the interface but needs the Supabase project URL and publishable key configured before it can connect.
          </div>
        )}
        {error && <div className="alert-error" role="alert">{error}</div>}

        <Button onClick={handleGoogleSignIn} disabled={!configured || sessionLoading} loading={loading || sessionLoading} fullWidth variant="secondary" className="auth-google-button">
          <GoogleIcon /> Continue with Google
        </Button>

        <p className="auth-privacy">By continuing, you agree to use Lexa responsibly. AI-generated legal information should always be reviewed by a qualified professional.</p>
      </section>
    </main>
  )
}

function LinkMark() {
  return <div className="auth-mark" aria-hidden="true">L</div>
}
