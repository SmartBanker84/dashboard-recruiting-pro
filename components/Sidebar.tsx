'use client'

import React from 'react'
import { Home, Bell, Settings, Users, LogOut, Briefcase } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

type SidebarLink = {
  label: string
  href: string
  icon: React.ReactNode
}

type Props = {
  role: 'manager' | 'recruiter'
}

export default function Sidebar({ role }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const links: SidebarLink[] = [
    { label: 'Dashboard', href: `/${role}/dashboard`, icon: <Home /> },
    ...(role === 'manager'
      ? [
          { label: 'Team', href: `/${role}/team`, icon: <Users /> },
          { label: 'Recruiting', href: `/${role}/recruiting`, icon: <Briefcase /> },
        ]
      : []),
    { label: 'Notifiche', href: `/${role}/notifications`, icon: <Bell /> },
    { label: 'Impostazioni', href: `/${role}/settings`, icon: <Settings /> },
  ]

  return (
    <aside className="flex flex-col justify-between w-64 min-h-screen bg-gray-50 border-r shadow-sm rounded-r-xl">
      {/* Top section: Logo + Links */}
      <div>
        <div className="px-6 py-6 text-xl font-bold text-indigo-700 tracking-wide border-b">
          Distretto Magnani
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-2">
          {links.map(link => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition 
                ${pathname.startsWith(link.href) 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-700'}`}
            >
              <span className="h-5 w-5">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom section: Logout */}
      <div className="px-4 py-4 border-t">
        <button
          onClick={() => router.push('/logout')}
          className="flex items-center gap-3 text-sm text-gray-600 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
