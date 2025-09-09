import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from 'services/supabaseClient'

export default function AuthCallback() {
    const navigate = useNavigate()
    useEffect(() => {
        let unsub = supabase.auth.onAuthStateChange((_e, session) => {
            if (session) navigate('/', { replace: true })
        }).data.subscription
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) navigate('/', { replace: true })
        })
        return () => unsub.unsubscribe()
    }, [navigate])
    return null
}