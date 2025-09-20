import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { ScrollProgress, ScrollToTop } from '@/components/ui/scroll-effects'  // ADD THIS LINE

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Show loading screen during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        {/* Enhanced loading with pulse effect */}
        <div className="flex flex-col items-center space-y-4">
          <div className="pulse-loader">
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
            <div className="pulse-dot"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ScrollProgress />  {/* ADD: Shows blue progress bar at top */}
      <Component {...pageProps} user={user} />
      <ScrollToTop />     {/* ADD: Shows floating back-to-top button */}
    </>
  )
}
