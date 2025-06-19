'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  LogOut, 
  Settings, 
  Bell, 
  User, 
  Crown, 
  UserCheck,
  Loader2,
  AlertCircle,
  Home
} from 'lucide-react'
import { clsx } from 'clsx'

import { ManagerDashboard } from '../../../components/ManagerDashboard'
import { RecruitingDashboard } from '../../../components/RecruitingDashboard'
import { authHelpers } from '../../../lib/supabase'
import type { UserRole, User as UserType } from '../../../types'

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = React.useState<UserType | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const role = params.role as UserRole

  // Validate role parameter
  React.useEffect(() => {
    if (!role || !['manager', 'recruiter'].includes(role)) {
      router.push('/')
      return
    }

    loadUserData()
  }, [role, router])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { user: authUser } = await authHelpers.getCurrentUser()
      
      if (!authUser) {
        // Redirect to home if not authenticated
        router.push('/')
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await authHelpers.getUserProfile(authUser.id)
      
      if (profileError || !profile) {
        throw new Error('Impossibile caricare il profilo utente')
      }

      // Verify role matches
      if (profile.role !== role) {
        throw new Error('Ruolo non autorizzato per questo utente')
      }

      setUser(profile)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : 'Errore durante il caricamento')
      
      // Redirect to home after error
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await authHelpers.signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const getRoleConfig = () => {
    switch (role) {
      case 'manager':
        return {
          title: 'Dashboard Manager',
          icon: <Crown className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        }
      case 'recruiter':
        return {
          title: 'Dashboard Recruiter',
          icon: <UserCheck className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      default:
        return {
          title: 'Dashboard',
          icon: <User className="h-5 w-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        }
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={loadUserData} />
  }

  if (!user) {
    return null
  }

  const roleConfig = getRoleConfig()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Logo and role */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Home className="h-4 w-4" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Recruiting Dashboard
                  </h1>
                </div>
              </button>
              
              {/* Role indicator */}
              <div className="hidden md:flex items-center gap-2">
                <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', roleConfig.bgColor)}>
                  <span className={roleConfig.color}>
                    {roleConfig.icon}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {roleConfig.title}
                </span>
              </div>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center gap-3">
              {/* Notifications (placeholder) */}
              <button className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                <Bell className="h-5 w-5" />
              </button>

              {/* Settings (placeholder) */}
              <button className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <User className="h-5 w-5" />
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Esci</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <button 
            onClick={() => router.push('/')}
            className="hover:text-gray-900 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <span className="font-medium text-gray-900">
            {roleConfig.title}
          </span>
        </nav>

        {/* Dashboard Content */}
        <div className="animate-fade-in">
          {role === 'manager' && (
            <ManagerDashboard userRole={role} userId={user.id} />
          )}
          
          {role === 'recruiter' && (
            <RecruitingDashboard userRole={role} userId={user.id} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>© 2024 Recruiting Dashboard</span>
              <span>•</span>
              <span>Versione 1.0.0</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Built with ❤️ using Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Loading screen component
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Caricamento Dashboard
        </h2>
        <p className="text-gray-600">
          Stiamo preparando la tua dashboard personalizzata...
        </p>
      </div>
    </div>
  )
}

// Error screen component
interface ErrorScreenProps {
  error: string
  onRetry: () => void
}

function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
        </div>
        
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Errore di Caricamento
        </h2>
        
        <p className="mb-6 text-gray-600">
          {error}
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Loader2 className="h-4 w-4" />
            Riprova
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  )
}
