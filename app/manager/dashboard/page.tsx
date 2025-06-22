'use client'

import { useRouter } from 'next/navigation'
import { authHelpers } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()

  const handleLogin = async (role: 'manager' | 'recruiter') => {
    const { user, error } = await authHelpers.signInAnonymously(role)
    if (error) {
      alert('Errore di login. Verifica credenziali Supabase.')
      return
    }

    // Redirect in base al ruolo
    if (role === 'manager') {
      router.push('/manager/dashboard')
    } else {
      router.push('/recruiter/dashboard')
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center px-4 text-white"
      style={{
        backgroundImage: "url('/bg-login.jpg')"
      }}
    >
      <div className="bg-black bg-opacity-60 p-8 rounded-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Benvenuto nel Distretto Magnani</h1>
        <p className="mb-6 text-gray-200">Seleziona il tuo ruolo per accedere alla dashboard</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleLogin('manager')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Accedi come Manager
          </button>
          <button
            onClick={() => handleLogin('recruiter')}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Accedi come Recruiter
          </button>
        </div>
      </div>
    </main>
  )
}
