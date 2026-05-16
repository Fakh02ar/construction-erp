'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        // DEMO MODE: Redirect straight to dashboard
        router.push('/dashboard')
        return

        // Production auth check (commented out for demo)
        // const supabase = createClient()
        // const {
        //   data: { user },
        // } = await supabase.auth.getUser()
        //
        // if (user) {
        //   router.push('/dashboard')
        // } else {
        //   router.push('/auth/login')
        // }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
