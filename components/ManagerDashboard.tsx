'use client'

import React from 'react'
import { 
  Users, 
  TrendingUp, 
  Target, 
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Settings,
  UserCheck,
  Clock,
  DollarSign
} from 'lucide-react'
import { clsx } from 'clsx'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'

import { KPICard, KPIGrid, KPIGridWithLoading } from './KPI'
import { MonthlyChart } from './MonthlyChart'
import { CVList } from './CVList'
import { AddCandidateModal } from './AddCandidateModal'
import { exportCandidatesToExcel, exportSummaryReport } from '../utils/exportToExcel'
import { dbHelpers } from '../lib/supabase'
import type { 
  Candidate, 
  KPIData, 
  MonthlyData, 
  DashboardProps, 
  CandidateFilters
} from '../types'

export function ManagerDashboard({ userRole, userId }: DashboardProps) {
  // State management
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [kpiData, setKpiData] = React.useState<KPIData | null>(null)
  const [monthlyData, setMonthlyData] = React.useState<MonthlyData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selectedDateRange, setSelectedDateRange] = React.useState<{
    start: Date
    end: Date
  }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingCandidate, setEditingCandidate] = React.useState<Candidate | null>(null)
  const [selectedRecruiter, setSelectedRecruiter] = React.useState<string>('all')
  const [recruiters, setRecruiters] = React.useState<Array<{ id: string; name: string }>>([])

  // Load initial data
  React.useEffect(() => {
    loadDashboardData()
  }, [selectedDateRange, selectedRecruiter])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load candidates with filters
      const candidateFilters: CandidateFilters = {
        recruiter: selectedRecruiter === 'all' ? undefined : [selectedRecruiter],
        dateRange: selectedDateRange
      }
      
      const [candidatesResult, kpiResult, monthlyResult] = await Promise.all([
        dbHelpers.getCandidates(candidateFilters),
        dbHelpers.getKPIData(candidateFilters.recruiter?.[0]),
        dbHelpers.getMonthlyData(candidateFilters.recruiter?.[0])
      ])

      if (candidatesResult.data) {
        setCandidates(candidatesResult.data)
      }
      
      if (kpiResult.data) {
        setKpiData(kpiResult.data)
      }
      
      if (monthlyResult.data) {
        setMonthlyData(monthlyResult.data)
      }

      // Load recruiters list (mock data for now)
      setRecruiters([
        { id: 'recruiter-1', name: 'Anna Verdi' },
        { id: 'recruiter-2', name: 'Marco Rossi' },
        { id: 'recruiter-3', name: 'Laura Bianchi' }
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const handleExportExcel = async () => {
    try {
      const filters: CandidateFilters = {
        dateRange: selectedDateRange,
        recruiter: selectedRecruiter === 'all' ? undefined : [selectedRecruiter]
      }
      
      await exportCandidatesToExcel(candidates, {
        format: 'xlsx',
        filename: `candidati_manager_${format(new Date(), 'yyyy-MM-dd')}`,
        filters
      })
    } catch (error) {
      console.error('Export error:', error)
      alert('Errore durante l\'esportazione')
    }
  }

  const handleExportSummary = async () => {
    try {
      await exportSummaryReport(
        candidates,
        `riepilogo_manager_${format(new Date(), 'yyyy-MM-dd')}`
      )
    } catch (error) {
      console.error('Summary export error:', error)
      alert('Errore durante l\'esportazione del riepilogo')
    }
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate)
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo candidato?')) {
      try {
        await dbHelpers.deleteCandidate(candidateId)
        await loadDashboardData()
      } catch (error) {
        console.error('Delete error:', error)
        alert('Errore durante l\'eliminazione')
      }
    }
  }

  const handleModalSuccess = () => {
    setShowAddModal(false)
    setEditingCandidate(null)
    loadDashboardData()
  }

  // Calculate additional manager metrics
  const managerMetrics = React.useMemo(() => {
    if (!candidates.length) return null

    const totalCandidates = candidates.length
    const thisMonth = candidates.filter(c => 
      new Date(c.created_at) >= selectedDateRange.start &&
      new Date(c.created_at) <= selectedDateRange.end
    ).length

    const previousMonth = candidates.filter(c => {
      const date = new Date(c.created_at)
      const prevStart = subDays(selectedDateRange.start, 30)
      const prevEnd = subDays(selectedDateRange.end, 30)
      return date >= prevStart && date <= prevEnd
    }).length

    const monthlyGrowth = previousMonth > 0 
      ? ((thisMonth - previousMonth) / previousMonth) * 100 
      : 0

    const avgSalary = candidates
      .filter(c => c.salary_expectation)
      .reduce((sum, c) => sum + (c.salary_expectation || 0), 0) / 
      (candidates.filter(c => c.salary_expectation).length || 1)

    const topPositions = candidates
      .reduce((acc, candidate) => {
        acc[candidate.position] = (acc[candidate.position] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const positionEntries = Object.entries(topPositions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    return {
      totalCandidates,
      thisMonth,
      monthlyGrowth,
      avgSalary,
      topPositions: positionEntries
    }
  }, [candidates, selectedDateRange])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Dashboard Manager
          </h1>
          <p className="text-secondary-600">
            Vista completa delle attività di recruiting
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Date range selector */}
          <select
            value={`${selectedDateRange.start.toISOString()}-${selectedDateRange.end.toISOString()}`}
            onChange={(e) => {
              const [start, end] = e.target.value.split('-').map(d => new Date(d))
              setSelectedDateRange({ start, end })
            }}
            className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm"
          >
            <option value={`${startOfMonth(new Date()).toISOString()}-${endOfMonth(new Date()).toISOString()}`}>
              Questo mese
            </option>
            <option value={`${subDays(new Date(), 30).toISOString()}-${new Date().toISOString()}`}>
              Ultimi 30 giorni
            </option>
            <option value={`${subDays(new Date(), 90).toISOString()}-${new Date().toISOString()}`}>
              Ultimi 3 mesi
            </option>
          </select>

          {/* Recruiter filter */}
          <select
            value={selectedRecruiter}
            onChange={(e) => setSelectedRecruiter(e.target.value)}
            className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Tutti i recruiter</option>
            {recruiters.map(recruiter => (
              <option key={recruiter.id} value={recruiter.id}>
                {recruiter.name}
              </option>
            ))}
          </select>

          {/* Actions */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-4 w-4', refreshing && 'animate-spin')} />
            Aggiorna
          </button>

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-2 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
          >
            <PieChart className="h-4 w-4" />
            Riepilogo
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
          >
            <Download className="h-4 w-4" />
            Esporta
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Users className="h-4 w-4" />
            Aggiungi Candidato
          </button>
        </div>
      </div>

      {/* Manager KPIs */}
      <KPIGridWithLoading loading={loading}>
        {kpiData && (
          <>
            <KPICard
              title="Candidati Totali"
              value={kpiData.totalCandidates}
              change={managerMetrics?.monthlyGrowth}
              icon={<Users className="h-6 w-6" />}
              color="primary"
            />
            <KPICard
              title="Nuovi Candidati"
              value={kpiData.newCandidates}
              icon={<UserCheck className="h-6 w-6" />}
              color="success"
            />
            <KPICard
              title="Colloqui Attivi"
              value={kpiData.activeInterviews}
              icon={<Clock className="h-6 w-6" />}
              color="warning"
            />
            <KPICard
              title="Tasso Conversione"
              value={`${kpiData.conversionRate}%`}
              icon={<Target className="h-6 w-6" />}
              color="primary"
            />
          </>
        )}
      </KPIGridWithLoading>

      {/* Additional Manager Metrics */}
      {managerMetrics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Average Salary */}
          <div className="rounded-2xl border border-secondary-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100 text-success-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">RAL Media</h3>
                <p className="text-2xl font-bold text-secondary-900">
                  €{managerMetrics.avgSalary.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <p className="text-sm text-secondary-600">
              Media delle retribuzioni richieste
            </p>
          </div>

          {/* Top Positions */}
          <div className="rounded-2xl border border-secondary-200 bg-white p-6 lg:col-span-2">
            <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-4">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              Posizioni più Richieste
            </h3>
            <div className="space-y-3">
              {managerMetrics.topPositions.map(([position, count], index) => {
                const percentage = (count / managerMetrics.totalCandidates) * 100
                return (
                  <div key={position} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-secondary-900">{position}</span>
                        <span className="text-sm text-secondary-600">{count} candidati</span>
                      </div>
                      <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <MonthlyChart 
          data={monthlyData} 
          loading={loading}
          height={350}
        />
      </div>

      {/* Team Performance (Mock) */}
      <div className="rounded-2xl border border-secondary-200 bg-white p-6">
        <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-6">
          <Award className="h-5 w-5 text-primary-600" />
          Performance Team
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {recruiters.map((recruiter, index) => {
            // Mock performance data
            const performance = {
              candidates: Math.floor(Math.random() * 50) + 10,
              hired: Math.floor(Math.random() * 10) + 1,
              conversion: Math.floor(Math.random() * 30) + 10
            }
            
            return (
              <div key={recruiter.id} className="rounded-xl border border-secondary-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 font-medium">
                    {recruiter.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900">{recruiter.name}</h4>
                    <p className="text-sm text-secondary-600">Recruiter</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Candidati</span>
                    <span className="font-medium text-secondary-900">{performance.candidates}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Assunzioni</span>
                    <span className="font-medium text-secondary-900">{performance.hired}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Conversione</span>
                    <span className="font-medium text-secondary-900">{performance.conversion}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Candidates Table */}
      <CVList
        candidates={candidates}
        loading={loading}
        onEdit={handleEditCandidate}
        onDelete={handleDeleteCandidate}
        onViewCV={(url) => window.open(url, '_blank')}
      />

      {/* Modals */}
      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
        userId={userId}
      />

      <AddCandidateModal
        isOpen={Boolean(editingCandidate)}
        onClose={() => setEditingCandidate(null)}
        onSuccess={handleModalSuccess}
        candidate={editingCandidate || undefined}
        userId={userId}
      />
    </div>
  )
}

export default ManagerDashboard
