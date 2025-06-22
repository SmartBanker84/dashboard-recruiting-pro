// File: app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">Benvenuto sulla Dashboard Recruiting</h1>
      <p className="mt-2 text-gray-600">Scegli un ruolo per accedere alla dashboard:</p>
      <div className="mt-4 space-x-4">
        <Link href="/manager/dashboard" className="text-blue-600 hover:underline">Dashboard Manager</Link>
        <Link href="/recruiter/dashboard" className="text-green-600 hover:underline">Dashboard Recruiter</Link>
      </div>
    </main>
  )
}
