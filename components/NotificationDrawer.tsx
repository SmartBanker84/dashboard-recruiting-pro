'use client'

import React from 'react'
import { Dialog } from '@headlessui/react'
import { Bell, X, Loader, CheckCircle } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  created_at: string
  read?: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  notifications: Notification[]
  loading?: boolean
  onMarkAllRead?: () => void
}

export default function NotificationDrawer({
  open,
  onClose,
  notifications,
  loading,
  onMarkAllRead,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex justify-end">
      <Dialog.Overlay className="fixed inset-0 bg-black/20" />
      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="flex items-center gap-2 font-semibold text-lg">
            <Bell className="h-5 w-5 text-primary-600" />
            Notifiche
          </span>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><Loader className="animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-secondary-500">
              <CheckCircle className="h-10 w-10 text-success-400" />
              Nessuna notifica recente.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`rounded p-3 shadow border-l-4 ${n.read ? 'border-gray-200 bg-gray-50' : 'border-primary-400 bg-primary-50'}`}
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-secondary-700">{n.message}</div>
                <div className="text-xs text-secondary-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t flex items-center gap-2">
          <button
            className="btn btn-sm btn-secondary"
            onClick={onMarkAllRead}
            disabled={loading || notifications.length === 0}
          >
            Segna tutte come lette
          </button>
        </div>
      </div>
    </Dialog>
  )
}
