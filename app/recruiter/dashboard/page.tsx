'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authHelpers } from '@/lib/supabase'
import RecruitingDashboard from '@/components/RecruitingDashboard'

export default function RecruitingDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleSignOut = async () => {
    await authHelpers.signOut();
    router.push('/');
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { user, error } = await authHelpers.getCurrentUser()

      if (error || !user) {
        console.error('Authentication error:', error)
        router.push('/')
        return
      }

      setUserId(user.id)
      setLoading(false)
    }

    fetchUser()
  }, [router])

  if (loading) return <div className="p-6">Caricamento...</div>

  return (
    <div className="p-6">
      <RecruitingDashboard userId={userId!} role="recruiter" onLogout={handleSignOut} />
    </div>
  )
}