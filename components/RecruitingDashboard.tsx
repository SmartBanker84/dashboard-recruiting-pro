'use client'

import * as React from 'react'
import { CandidateStatus } from '../types'

export interface RecruitingDashboardProps {
  role: 'recruiter'
  userId: string
  onLogout: () => Promise<void>
}

export default function RecruitingDashboard({ role, userId, onLogout }: RecruitingDashboardProps) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
      <p>Dashboard per il ruolo: {role}</p>
      <p>User ID: {userId}</p>
    </div>
  )
}
