import { useEffect, useMemo, useState } from 'react'
import { isAuthConfigured, supabase } from '../lib/supabase'
import AuthContext from './AuthContextBase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isAuthConfigured)

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) console.error('Unable to restore authentication session')
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    configured: isAuthConfigured,
  }), [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
