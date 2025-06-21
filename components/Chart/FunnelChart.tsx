'use client'

import React from 'react'

// Dummy chart as placeholder: integrate with your preferred chart lib (e.g. recharts, chart.js)
type Stage = {
  label: string
  value: number
  color?: string
}
type Props = {
  stages: Stage[]
}

export default function FunnelChart({ stages }: Props) {
  const max = Math.max(...stages.map(s => s.value))
  return (
    <div className="w-full max-w-md mx-auto">
      {stages.map((stage, i) => (
        <div key={stage.label} className="mb-3 flex items-center gap-2">
          <div className="w-24 text-xs text-gray-700">{stage.label}</div>
          <div
            className="h-6 rounded bg-primary-500"
            style={{
              width: `${(stage.value / max) * 100}%`,
              background: stage.color || undefined
            }}
          >
            <span className="pl-2 text-white text-xs">{stage.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
