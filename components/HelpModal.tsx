'use client'

import React from 'react'
import { Dialog } from '@headlessui/react'
import { X, HelpCircle } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

export default function HelpModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black/20" />
      <div className="relative max-w-lg w-full bg-white rounded-xl shadow-xl p-8 z-10">
        <button className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100" onClick={onClose}>
          <X />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-6 w-6 text-primary-600" />
          <h2 className="text-lg font-bold">Serve aiuto?</h2>
        </div>
        <div className="space-y-3 text-gray-700 text-sm">
          <p>Questa dashboard ti aiuta a gestire candidati, pipeline e team. Puoi:</p>
          <ul className="list-disc pl-6">
            <li>Visualizzare KPI e pipeline aggiornate</li>
            <li>Caricare e gestire CV</li>
            <li>Gestire notifiche e preferenze</li>
            <li>Contattare il supporto per richiesta funzionalità</li>
          </ul>
          <p>Per feedback o problemi, scrivi a <a href="mailto:support@yourcompany.com" className="text-primary-600 underline">support@yourcompany.com</a></p>
        </div>
      </div>
    </Dialog>
  )
}
