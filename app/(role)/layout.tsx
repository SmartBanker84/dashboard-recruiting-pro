'use client'

import '../globals.css';

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { clsx } from 'clsx'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import Topbar from '@/components/Topbar'
import type { UserRole } from '../../types'

interface RoleLayoutProps {
  children: React.ReactNode
}

export default function RoleLayout({ children }: RoleLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const [isOnline, setIsOnline] = React.useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false)

  const role = params.role as 'manager' | 'recruiter'

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
      <aside className="hidden md:flex md:w-64 border-r border-gray-200 bg-white shadow-sm z-10">
        <Sidebar role={role} />
      </aside>

      {/* Wrapper principale con Topbar e contenuti */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative bg-gray-50">
        {/* Accessibility landmarks */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Vai al contenuto principale
        </a>

        <Topbar />

        {/* Connection status indicator */}
        <ConnectionStatus 
          isOnline={isOnline} 
          showMessage={showOfflineMessage}
        />

        {/* Role-specific metadata injection */}
        <RoleMetadata role={role} />
        {/* Preconnect/DNS-prefetch for Supabase */}
        <link rel="preconnect" href="https://hhyloiuzgaggednuuern.supabase.co" />
        <link rel="dns-prefetch" href="//hhyloiuzgaggednuuern.supabase.co" />

        {/* Main content with role context */}
        <main 
          id="main-content"
          className="role-content flex-1 px-6 py-6 max-w-7xl mx-auto bg-white"
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
      <div className="h-16 md:hidden" />

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

// ConnectionStatus component
interface ConnectionStatusProps {
  isOnline: boolean
  showMessage: boolean
}

function ConnectionStatus({ isOnline, showMessage }: ConnectionStatusProps) {
  if (!showMessage && isOnline) return null

  return (
    <div 
      className={clsx(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300',
        showMessage || !isOnline ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}
    >
      <div className={clsx(
        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg',
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      )}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Connessione ripristinata
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            Modalità offline - Alcune funzioni potrebbero non essere disponibili
          </>
        )}
      </div>
    </div>
  )
}

// RoleMetadata component for SEO and analytics
interface RoleMetadataProps {
  role: UserRole
}

function RoleMetadata({ role }: RoleMetadataProps) {
  React.useEffect(() => {
    // Update document title based on role
    const titles: Record<string, string> = {
      manager: 'Dashboard Manager - Recruiting',
      recruiter: 'Dashboard Recruiter - Recruiting'
    }
    
    document.title = titles[role] || 'Dashboard - Recruiting'

    // Add role-specific meta tags
    const metaRole = document.querySelector('meta[name="user-role"]')
    if (metaRole) {
      metaRole.setAttribute('content', role)
    } else {
      const newMeta = document.createElement('meta')
      newMeta.name = 'user-role'
      newMeta.content = role
      document.head.appendChild(newMeta)
    }

    // Analytics tracking (if analytics service is configured)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        custom_map: { role: role }
      })
    }

    return () => {
      // Cleanup meta tags on unmount
      const metaToRemove = document.querySelector('meta[name="user-role"]')
      if (metaToRemove) {
        document.head.removeChild(metaToRemove)
      }
    }
  }, [role])

  return null
}

// ErrorBoundary component
interface ErrorBoundaryProps {
  error: Error | null
  onReset: () => void
  role: UserRole
}

function ErrorBoundary({ error, onReset, role }: ErrorBoundaryProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Oops! Qualcosa è andato storto
        </h1>
        
        <p className="mb-6 text-gray-600">
          Si è verificato un errore nella dashboard {role}. 
          I nostri sviluppatori sono stati notificati.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="mb-2 cursor-pointer font-medium text-red-600">
              Dettagli errore (sviluppo)
            </summary>
            <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-xs text-gray-800">
              {error.stack || error.message}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ricarica Pagina
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Torna alla Home
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Codice errore: {role?.toUpperCase()}_LAYOUT_ERROR</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  )
}

// Performance monitoring overlay (development only)
function PerformanceOverlay() {
  const [metrics, setMetrics] = React.useState<{
    renderTime: number
    memoryUsage: number
  } | null>(null)

  React.useEffect(() => {
    // Performance monitoring
    const startTime = performance.now()

    const updateMetrics = () => {
      const renderTime = performance.now() - startTime
      const memoryUsage = (performance as any).memory 
        ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 
        : 0

      setMetrics({
        renderTime: Math.round(renderTime * 100) / 100,
        memoryUsage: Math.round(memoryUsage * 100) / 100
      })
    }

    // Update metrics after component mount
    requestAnimationFrame(updateMetrics)

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!metrics) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-black/80 p-2 text-xs text-white font-mono">
      <div>Render: {metrics.renderTime}ms</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
    </div>
  )
}
