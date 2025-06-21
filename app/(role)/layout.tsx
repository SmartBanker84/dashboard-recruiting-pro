'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { clsx } from 'clsx'
import Sidebar from '../../components/Sidebar'
import MobileNav from '../../components/MobileNav'
import type { UserRole } from '../../types'

interface RoleLayoutProps {
  children: React.ReactNode
}

export default function RoleLayout({ children }: RoleLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const [isOnline, setIsOnline] = React.useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false)

  const role = params.role as UserRole

  // Validate role parameter
  React.useEffect(() => {
    if (!role || !['manager', 'recruiter'].includes(role)) {
      console.warn('Invalid role detected, redirecting to home')
      router.replace('/')
      return
    }
  }, [role, router])

  // Online/offline status monitoring
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
      setTimeout(() => setShowOfflineMessage(false), 5000)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Error boundary for role-specific layouts
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Role layout error:', event.error)
      setError(event.error)
      setHasError(true)
    }
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      setError(new Error(event.reason))
      setHasError(true)
    }
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const resetError = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
  }

  if (hasError) {
    return (
      <ErrorBoundary 
        error={error} 
        onReset={resetError} 
        role={role}
      />
    )
  }

  return (
    <div className="role-layout min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:block">
        <Sidebar role={role} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Accessibility landmarks */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Vai al contenuto principale
        </a>

        {/* Connection status indicator */}
        <ConnectionStatus 
          isOnline={isOnline} 
          showMessage={showOfflineMessage}
        />

        {/* Role-specific metadata injection */}
        <RoleMetadata role={role} />

        {/* Main content with role context */}
        <main 
          id="main-content"
          className="role-content flex-1"
          data-role={role}
          role="main"
          aria-label={`Dashboard ${role}`}
        >
          {children}
        </main>

        {/* Performance monitoring overlay (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <PerformanceOverlay />
        )}
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav role={role} />

      {/* Role-specific styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .role-layout {
            position: relative;
          }
          .role-content {
            position: relative;
            z-index: 1;
          }
          .role-content[data-role="manager"] {
            --role-primary: #2563eb;
            --role-secondary: #dbeafe;
          }
          .role-content[data-role="recruiter"] {
            --role-primary: #059669;
            --role-secondary: #d1fae5;
          }
          .role-content::-webkit-scrollbar {
            width: 8px;
          }
          .role-content::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          .role-content::-webkit-scrollbar-thumb {
            background: var(--role-primary);
            border-radius: 4px;
          }
          .role-content::-webkit-scrollbar-thumb:hover {
            background: var(--role-primary);
            opacity: 0.8;
          }
        `
      }} />
    </div>
  )
}

// ConnectionStatus, RoleMetadata, ErrorBoundary, PerformanceOverlay: come già presenti nel tuo file.
