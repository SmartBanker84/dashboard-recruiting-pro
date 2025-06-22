'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Calendar, TrendingUp, Users, Briefcase } from 'lucide-react'
import { clsx } from 'clsx'
import type { MonthlyData, ChartData } from '../types'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MonthlyChartProps {
  data: MonthlyData[]
  loading?: boolean
  className?: string
  height?: number
}

export function MonthlyChart({ 
  data, 
  loading = false, 
  className,
  height = 300 
}: MonthlyChartProps) {
  // Process data for Chart.js
  const chartData: ChartData = React.useMemo(() => {
    const labels = data.map(item => item.month)
    
    return {
      labels,
      datasets: [
        {
          label: 'Candidati Totali',
          data: data.map(item => item.candidates),
          borderColor: 'rgb(59, 130, 246)', // primary-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Assunzioni',
          data: data.map(item => item.hired),
          borderColor: 'rgb(34, 197, 94)', // success-500
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Colloqui Attivi',
          data: data.map(item => item.interviews),
          borderColor: 'rgb(245, 158, 11)', // warning-500
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
        }
      ]
    }
  }, [data])

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
            weight: 500 // <-- CORRETTO: numero, non stringa
          },
          color: '#64748b' // secondary-500
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          title: function(context: TooltipItem<'line'>[]) {
            return `${context[0].label}`
          },
          label: function(context: TooltipItem<'line'>) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${value}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#94a3b8', // secondary-400
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9', // secondary-100
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#94a3b8', // secondary-400
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          callback: function(value: any) {
            return Number.isInteger(value) ? value : ''
          }
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 3
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  }

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    if (!data.length) return null

    const totalCandidates = data.reduce((sum, item) => sum + item.candidates, 0)
    const totalHired = data.reduce((sum, item) => sum + item.hired, 0)
    const totalInterviews = data.reduce((sum, item) => sum + item.interviews, 0)
    
    const currentMonth = data[data.length - 1]
    const previousMonth = data[data.length - 2]
    
    const candidatesTrend = previousMonth 
      ? ((currentMonth.candidates - previousMonth.candidates) / previousMonth.candidates) * 100
      : 0

    return {
      totalCandidates,
      totalHired,
      totalInterviews,
      candidatesTrend: candidatesTrend.toFixed(1),
      conversionRate: totalCandidates > 0 ? parseFloat(((totalHired / totalCandidates) * 100).toFixed(1)) : 0
    }
  }, [data])

  if (loading) {
    return <ChartSkeleton height={height} />
  }

  if (!data.length) {
    return <EmptyChart height={height} />
  }

  return (
    <div className={clsx('rounded-2xl border border-secondary-200 bg-white p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Andamento Mensile
          </h3>
          <p className="text-sm text-secondary-600 mt-1">
            Candidati, colloqui e assunzioni negli ultimi 12 mesi
          </p>
        </div>
        
        {/* Time period indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary-50 px-3 py-2">
          <Calendar className="h-4 w-4 text-secondary-500" />
          <span className="text-sm font-medium text-secondary-700">
            Ultimi 12 mesi
          </span>
        </div>
      </div>

      {/* Summary stats */}
      {summaryStats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">Tot. Candidati</p>
              <p className="text-xl font-bold text-primary-900">{summaryStats.totalCandidates}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-xl bg-success-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-success-700">Assunzioni</p>
              <p className="text-xl font-bold text-success-900">{summaryStats.totalHired}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-xl bg-warning-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 text-warning-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning-700">Tasso Conversione</p>
              <p className="text-xl font-bold text-warning-900">{summaryStats.conversionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div
        style={{ height: `${height}px` }}
        role="img"
        aria-label="Grafico dell'andamento mensile di candidati, colloqui e assunzioni"
      >
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

// Loading skeleton
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="animate-pulse rounded-2xl border border-secondary-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-6 w-48 rounded bg-secondary-200 mb-2" />
          <div className="h-4 w-64 rounded bg-secondary-200" />
        </div>
        <div className="h-8 w-32 rounded-lg bg-secondary-200" />
      </div>
      
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary-50 p-4">
            <div className="h-10 w-10 rounded-lg bg-secondary-200" />
            <div>
              <div className="h-4 w-20 rounded bg-secondary-200 mb-1" />
              <div className="h-6 w-12 rounded bg-secondary-200" />
            </div>
          </div>
        ))}
      </div>
      
      <div 
        className="rounded-xl bg-secondary-100" 
        style={{ height: `${height}px` }}
      />
    </div>
  )
}

// Empty state
function EmptyChart({ height }: { height: number }) {
  return (
    <div className="rounded-2xl border border-secondary-200 bg-white p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          Andamento Mensile
        </h3>
        <p className="text-sm text-secondary-600 mt-1">
          Candidati, colloqui e assunzioni negli ultimi 12 mesi
        </p>
      </div>
      
      <div 
        className="flex items-center justify-center rounded-xl border-2 border-dashed border-secondary-300 bg-secondary-50"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-secondary-700 mb-2">
            Nessun dato disponibile
          </h4>
          <p className="text-sm text-secondary-500">
            I dati del grafico appariranno quando ci saranno candidati nel sistema
          </p>
        </div>
      </div>
    </div>
  )
}

export default MonthlyChart
