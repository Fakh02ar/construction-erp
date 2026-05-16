'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    async function checkAuth() {
      // DEMO MODE: Skip auth check and show demo user
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@example.com',
      }
      const demoProfile = {
        id: 'demo-user-123',
        full_name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
      }
      
      setUser(demoUser)
      setUserProfile(demoProfile)
      setIsLoading(false)
      return

      // Production auth check (commented for demo)
      // const supabase = createClient()
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser()
      //
      // if (!user) {
      //   router.push('/auth/login')
      //   return
      // }
      //
      // setUser(user)
      //
      // const { data: profile } = await supabase
      //   .from('user_profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single()
      //
      // setUserProfile(profile)
      // setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userProfile={userProfile}>
      <DashboardContent user={user} userProfile={userProfile} />
    </DashboardLayout>
  )
}
