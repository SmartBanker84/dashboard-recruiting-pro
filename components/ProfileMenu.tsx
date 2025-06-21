'use client'

import React, { useState } from 'react'
import { Menu } from '@headlessui/react'
import { User, LogOut, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  fullName: string
  email: string
  onSignOut: () => void
  avatarUrl?: string
}

export default function ProfileMenu({ fullName, email, onSignOut, avatarUrl }: Props) {
  const router = useRouter()

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-2 rounded-full bg-gray-100 p-1 hover:ring-2 ring-primary-200 transition">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <User className="h-7 w-7 text-gray-500" />
        )}
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/10 focus:outline-none z-50">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-gray-900">{fullName}</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => router.push('/settings')}
              className={`w-full px-4 py-2 flex items-center gap-2 text-sm ${active ? 'bg-gray-50' : ''}`}
            >
              <Settings className="h-4 w-4" />
              Impostazioni
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={onSignOut}
              className={`w-full px-4 py-2 flex items-center gap-2 text-sm text-red-600 ${active ? 'bg-gray-50' : ''}`}
            >
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  )
}
