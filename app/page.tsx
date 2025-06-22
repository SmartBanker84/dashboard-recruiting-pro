'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authHelpers } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')

    if (userRole === 'manager') {
      router.push('/manager/dashboard')
    } else if (userRole === 'recruiter') {
      router.push('/recruiter/dashboard')
    }
  }, [router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
      <h1 className="text-2xl font-bold">Benvenuto nella piattaforma Recruiting</h1>
      <p className="text-gray-500">Seleziona il tuo ruolo per iniziare</p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={async () => {
            const { user, error } = await authHelpers.signInAnonymously('manager')
            if (user) {
              localStorage.setItem('userRole', 'manager')
              router.push('/manager/dashboard')
            } else {
              console.error('Errore login manager:', error)
              alert('Errore di accesso come Manager')
            }
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Accedi come Manager
        </button>
        <button
          onClick={async () => {
            const { user, error } = await authHelpers.signInAnonymously('recruiter')
            if (user) {
              localStorage.setItem('userRole', 'recruiter')
              router.push('/recruiter/dashboard')
            } else {
              console.error('Errore login recruiter:', error)
              alert('Errore di accesso come Recruiter')
            }
          }}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Accedi come Recruiter
        </button>
      </div>
    </main>
  )
}
