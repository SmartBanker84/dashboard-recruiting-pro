'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  UserCheck, 
  Crown, 
  ArrowRight, 
  BarChart3, 
  FileText, 
  Target,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react'
import { clsx } from 'clsx'
import { authHelpers } from './lib/supabase'
import type { UserRole } from './types'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState<UserRole | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleRoleSelection = async (role: UserRole) => {
    try {
      setLoading(role)
      setError(null)

      // Sign in anonymously with selected role
      const { user, error: authError } = await authHelpers.signInAnonymously(role)
      
      if (authError) {
        throw new Error(authError.message)
      }

      if (user) {
        // Redirect to role-specific dashboard
        router.push(`/${role}/dashboard`)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Errore durante il login')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-primary-200/40 to-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-gradient-to-tr from-success-200/40 to-primary-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-warning-200/30 to-danger-200/30 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  Recruiting Dashboard
                </h1>
                <p className="text-sm text-secondary-600">
                  Gestione professionale candidati
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm text-secondary-600">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success-500" />
                Sicuro
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning-500" />
                Veloce
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-500" />
                Moderno
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
                <Sparkles className="h-4 w-4" />
                Dashboard di nuova generazione
              </div>
              
              <h1 className="mb-6 text-4xl font-bold text-secondary-900 sm:text-5xl lg:text-6xl">
                Gestisci il tuo{' '}
                <span className="text-gradient-primary">
                  processo di recruiting
                </span>
                {' '}con stile
              </h1>
              
              <p className="mb-8 text-lg text-secondary-600 sm:text-xl">
                Una dashboard moderna e intuitiva per gestire candidati, 
                colloqui e tutto il processo di recruiting. 
                Scegli il tuo ruolo per iniziare.
              </p>
            </div>

            {/* Features highlight */}
            <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/60 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-secondary-900">Analytics Avanzate</h3>
                <p className="text-sm text-secondary-600 text-center">
                  KPI in tempo reale e grafici interattivi
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/60 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100 text-success-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-secondary-900">Gestione CV</h3>
                <p className="text-sm text-secondary-600 text-center">
                  Upload, visualizzazione e organizzazione CV
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/60 p-6 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100 text-warning-600">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-secondary-900">Pipeline Visuale</h3>
                <p className="text-sm text-secondary-600 text-center">
                  Traccia i candidati attraverso ogni fase
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Role Selection */}
        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-secondary-900">
                Scegli il tuo ruolo
              </h2>
              <p className="text-secondary-600">
                Accedi alla dashboard con il ruolo più adatto alle tue esigenze
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-4">
                <div className="flex items-center gap-2 text-danger-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Errore:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Manager Role */}
              <RoleCard
                role="manager"
                title="Manager"
                description="Vista completa, analytics avanzate e gestione team"
                icon={<Crown className="h-8 w-8" />}
                features={[
                  'Vista globale candidati',
                  'Analytics e report',
                  'Gestione team recruiter',
                  'Export dati avanzato'
                ]}
                gradient="from-primary-500 to-primary-600"
                loading={loading === 'manager'}
                onClick={() => handleRoleSelection('manager')}
              />

              {/* Recruiter Role */}
              <RoleCard
                role="recruiter"
                title="Recruiter"
                description="Gestione quotidiana candidati e pipeline personale"
                icon={<UserCheck className="h-8 w-8" />}
                features={[
                  'I miei candidati',
                  'Pipeline personale',
                  'Azioni rapide',
                  'Upload CV semplificato'
                ]}
                gradient="from-success-500 to-success-600"
                loading={loading === 'recruiter'}
                onClick={() => handleRoleSelection('recruiter')}
              />
            </div>

            {/* Demo notice */}
            <div className="mt-8 rounded-xl bg-secondary-100 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Play className="h-5 w-5 text-secondary-600" />
                <span className="font-medium text-secondary-900">Demo Mode</span>
              </div>
              <p className="text-sm text-secondary-600">
                Questa è una demo. I dati sono simulati e verranno resettati periodicamente.
                Ogni ruolo offre un'esperienza personalizzata della dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-secondary-200 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                  <Users className="h-4 w-4" />
                </div>
                <span className="font-medium text-secondary-900">
                  Recruiting Dashboard
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-secondary-600">
                <span>Built with Next.js & Supabase</span>
                <span>•</span>
                <span>Tailwind CSS</span>
                <span>•</span>
                <span>TypeScript</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Role selection card component
interface RoleCardProps {
  role: UserRole
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  gradient: string
  loading: boolean
  onClick: () => void
}

function RoleCard({ 
  role, 
  title, 
  description, 
  icon, 
  features, 
  gradient, 
  loading, 
  onClick 
}: RoleCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-secondary-200 p-6 shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1">
      {/* Background gradient on hover */}
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-5',
        gradient
      )} />
      
      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div className={clsx(
          'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-110',
          gradient
        )}>
          {icon}
        </div>

        {/* Title and description */}
        <div className="mb-6">
          <h3 className="mb-2 text-xl font-bold text-secondary-900">
            {title}
          </h3>
          <p className="text-secondary-600">
            {description}
          </p>
        </div>

        {/* Features */}
        <div className="mb-6 space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success-100">
                <div className="h-2 w-2 rounded-full bg-success-500" />
              </div>
              <span className="text-sm text-secondary-700">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={onClick}
          disabled={loading}
          className={clsx(
            'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            loading 
              ? 'bg-secondary-400 cursor-not-allowed' 
              : `bg-gradient-to-r ${gradient} hover:shadow-lg focus:ring-primary-500`
          )}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Accesso in corso...
            </>
          ) : (
            <>
              Accedi come {title}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-primary-200" />
    </div>
  )
}
