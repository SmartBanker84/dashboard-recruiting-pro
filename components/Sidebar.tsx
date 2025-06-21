'use client'

import React from 'react'
import { Home, Bell, Settings, Users, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

type SidebarLink = {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
}

type Props = {
  role: 'manager' | 'recruiter'
}

export default function Sidebar({ role }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const links: SidebarLink[] = [
    { label: 'Dashboard', href: `/${role}/dashboard`, icon: <Home /> },
    { label: 'Notifiche', href: `/${role}/notifications`, icon: <Bell /> },
    { label: 'Impostazioni', href: `/${role}/settings`, icon: <Settings /> },
  ]
  if (role === 'manager') {
    links.splice(2, 0, { label: 'Team', href: `/${role}/team`, icon: <Users /> })
  }

  return (
    <nav className="flex flex-col gap-2 w-56 bg-white border-r min-h-screen py-6">
      {links.map(link => (
        <button
          key={link.href}
          onClick={() => router.push(link.href)}
          className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition 
            ${pathname === link.href ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          <span className="h-5 w-5">{link.icon}</span>
          {link.label}
        </button>
      ))}
    </nav>
  )
}
