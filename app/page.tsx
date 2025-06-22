'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Forza redirect diretto alla dashboard manager
    localStorage.setItem('userRole', 'manager')
    router.push('/manager/dashboard')
  }, [router])

  return null
}
