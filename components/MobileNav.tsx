'use client'

import React from 'react'
import { Home, Bell, Settings, Users } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

type Props = {
  role: 'manager' | 'recruiter'
}

export default function MobileNav({ role }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const links = [
    { label: 'Dashboard', href: `/${role}/dashboard`, icon: <Home /> },
    { label: 'Notifiche', href: `/${role}/notifications`, icon: <Bell /> },
    ...(role === 'manager' ? [{ label: 'Team', href: `/${role}/team`, icon: <Users /> }] : []),
    { label: 'Impostazioni', href: `/${role}/settings`, icon: <Settings /> },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around z-50 md:hidden">
      {links.map(l => (
        <button
          key={l.href}
          onClick={() => router.push(l.href)}
          className={`flex flex-col items-center px-3 py-2 text-xs ${pathname === l.href ? 'text-primary-600' : 'text-gray-500'}`}
        >
          <span className="h-6 w-6">{l.icon}</span>
          {l.label}
        </button>
      ))}
    </nav>
  )
}
