'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Dashboard from '../components/ManagerDashboard'
import LoginForm from '../components/LoginForm'
import type { User } from '../types'

export default function HomePage() {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user profile data
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          setUser(null)
        } else {
          setUser(profile)
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    const { data: loggedInUser, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      throw new Error(error.message)
    }
    
    if (loggedInUser) {
      setUser({
        id: loggedInUser.user.id,
        email: loggedInUser.user.email ?? '',
        role: loggedInUser.user.user_metadata?.role ?? 'guest',
        full_name: loggedInUser.user.user_metadata?.full_name ?? 'Utente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  const handleLogout = async () => {
    setUser(null)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <>
      {user.role === 'manager' && (
        <Dashboard 
          userId={user.id}
          email={user.email}
          fullName={user.full_name}
          role="manager"
          onLogout={handleLogout}
        />
      )}
    </>
  )
}