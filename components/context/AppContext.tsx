'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authHelpers } from '../../lib/supabase'
import { getUserNotifications } from '../../lib/supabase/notifications'

type User = {
  id: string
  email: string
  full_name: string
  role: string
}

type AppContextType = {
  user: User | null
  notifications: any[]
  reloadNotifications: () => void
  setUser: (u: User | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  const loadUser = async () => {
    const { user: authUser } = await authHelpers.getCurrentUser()
    if (!authUser) return setUser(null)
    const { data: p } = await authHelpers.getUserProfile(authUser.id)
    setUser(p)
  }

  const reloadNotifications = async () => {
    if (user) {
      const data = await getUserNotifications(user.id)
      setNotifications(data)
    }
  }

  useEffect(() => { loadUser() }, [])
  useEffect(() => { reloadNotifications() }, [user])

  return (
    <AppContext.Provider value={{ user, notifications, reloadNotifications, setUser }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
