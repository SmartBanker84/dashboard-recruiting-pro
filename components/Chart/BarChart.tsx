'use client'

import React from 'react'

// Dummy chart as placeholder: plug in recharts, chart.js, etc.
type Data = {
  label: string
  value: number
  color?: string
}
type Props = {
  data: Data[]
  height?: number
}

export default function BarChart({ data, height = 180 }: Props) {
  const max = Math.max(...data.map(d => d.value)) || 1
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-col items-center flex-1">
          <div
            className="w-6 rounded-t bg-primary-500"
            style={{
              height: `${(d.value / max) * (height - 30)}px`,
              background: d.color || undefined
            }}
            title={`${d.value}`}
          />
          <span className="text-xs mt-1 text-gray-700">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
