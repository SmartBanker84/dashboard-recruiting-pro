'use client'

import * as React from 'react'
import { CandidateStatus } from '../types'

export interface UrgentCandidateCardProps {
  candidate: {
    id: string
    name: string
    position: string
    priorityLevel: string
  }
  onStatusUpdate: (candidateId: string, newStatus: CandidateStatus) => Promise<void>
}

export default function UrgentCandidateCard({ candidate, onStatusUpdate }: UrgentCandidateCardProps) {
  const [updating, setUpdating] = React.useState(false)

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    setUpdating(true)
    try {
      await onStatusUpdate(candidate.id, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Errore durante l\'aggiornamento dello stato')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <div>
        <div className="font-semibold">{candidate.name}</div>
        <div className="text-sm text-secondary-600">{candidate.position}</div>
        <div className="text-xs text-secondary-400">Priorità: {candidate.priorityLevel}</div>
      </div>
      <div className="flex gap-2">
        <button
          disabled={updating}
          onClick={() => handleStatusChange('interview')}
          className="px-2 py-1 text-sm rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
        >
          Colloquio
        </button>
        <button
          disabled={updating}
          onClick={() => handleStatusChange('offer')}
          className="px-2 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
        >
          Offerta
        </button>
      </div>
    </div>
  )
}
