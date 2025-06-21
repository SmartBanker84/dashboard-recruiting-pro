'use client'

import { useEffect, useState } from 'react'
import { getUserNotifications } from '@/lib/supabase/notifications'
import { Bell, Loader, CheckCircle } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserNotifications().then(data => {
      setNotifications(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary-600" />
        Notifiche
      </h1>
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader className="animate-spin" /></div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-secondary-500 mt-8">
          <CheckCircle className="h-10 w-10 text-success-400" />
          Nessuna notifica recente.
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n, i) => (
            <li key={i} className="rounded-xl bg-white p-4 shadow border-l-4 border-primary-300">
              <div className="font-medium">{n.title || 'Notifica'}</div>
              <div className="text-sm text-secondary-600">{n.body || n.message}</div>
              <div className="text-xs text-secondary-400 mt-2">{n.created_at && new Date(n.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
