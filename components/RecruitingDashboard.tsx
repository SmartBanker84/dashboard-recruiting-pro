'use client'

import * as React from 'react'
import { CandidateStatus } from '../types'

export interface RecruitingDashboardProps {
  role: 'recruiter' | 'manager'
  userId: string
}

export default function RecruitingDashboard({ role, userId }: RecruitingDashboardProps) {
  return (
    <div>
      <p>Dashboard per il ruolo: {role}</p>
      <p>User ID: {userId}</p>
    </div>
  )
}
