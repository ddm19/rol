import { useState, useEffect } from "react"
import { supabase } from "services/supabaseClient"

export function useAuth() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, user: session?.user ?? null, loading }
}