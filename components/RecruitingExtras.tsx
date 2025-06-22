// components/RecruitingExtras.tsx
'use client'

import * as React from 'react'
import { Candidate, CandidateStatus } from '../types'
import { CheckCircle, Edit, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

interface UrgentCandidateCardProps {
  candidate: Candidate
  onStatusUpdate: (id: string, status: CandidateStatus) => void
  onEdit: () => void
}

export function UrgentCandidateCard({ candidate, onStatusUpdate, onEdit }: UrgentCandidateCardProps) {
  const handleStatusChange = (newStatus: CandidateStatus) => {
    onStatusUpdate(candidate.id, newStatus)
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-warning-300 bg-warning-50 p-4">
      <div>
        <h4 className="font-semibold text-warning-800">{candidate.full_name}</h4>
        <p className="text-warning-700">{candidate.position}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleStatusChange('offer')}
          title="Segna come Offerta"
          className="rounded-full bg-warning-300 p-1 hover:bg-warning-400"
        >
          <CheckCircle className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={onEdit}
          title="Modifica candidato"
          className="rounded-full bg-warning-300 p-1 hover:bg-warning-400"
        >
          <Edit className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  )
}

interface PipelineViewProps {
  candidates: Candidate[]
  onStatusUpdate: (id: string, status: CandidateStatus) => void
  onEdit: (candidate: Candidate) => void
}

export function PipelineView({ candidates, onStatusUpdate, onEdit }: PipelineViewProps) {
  const stages: CandidateStatus[] = ['new', 'review', 'interview', 'offer', 'hired', 'rejected']

  return (
    <div className="flex overflow-x-auto space-x-4">
      {stages.map(stage => {
        const filteredCandidates = candidates.filter(c => c.status === stage)
        return (
          <div key={stage} className="min-w-[200px] rounded-lg border border-secondary-300 bg-secondary-50 p-4">
            <h4 className="mb-3 font-semibold capitalize">{stage}</h4>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  className={clsx(
                    'mb-2 rounded border border-secondary-200 bg-white p-2 hover:shadow cursor-pointer',
                  )}
                  onClick={() => onEdit(candidate)}
                >
                  <div className="flex justify-between">
                    <span>{candidate.full_name}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onStatusUpdate(candidate.id, 'hired')
                      }}
                      title="Segna come assunto"
                      className="text-success-600 hover:text-success-800"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-secondary-600">{candidate.position}</div>
                </div>
              ))
            ) : (
              <div className="text-secondary-500 italic">Nessun candidato</div>
            )}
          </div>
        )
      })}
    </div>
  )
}