'use client'

import React from 'react'
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Phone,
  Mail,
  FileText,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  Bell,
  Star
} from 'lucide-react'
import { clsx } from 'clsx'
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns'
import { it } from 'date-fns/locale'

import { KPICard, KPIGrid, KPIGridWithLoading, CompactKPICard } from './KPI'
import { MonthlyChart } from './MonthlyChart'
import { CVList } from './CVList'
import { AddCandidateModal } from './AddCandidateModal'
import { exportCandidatesToExcel } from '../utils/exportToExcel'
import { dbHelpers } from '../lib/supabase'
import type { 
  Candidate, 
  KPIData, 
  MonthlyData, 
  DashboardProps, 
  CandidateStatus 
} from '../types'

export function RecruitingDashboard({ userRole, userId }: DashboardProps) {
  // State management
  const [candidates, setCandidates] = React.useState<Candidate[]>([])
  const [kpiData, setKpiData] = React.useState<KPIData | null>(null)
  const [monthlyData, setMonthlyData] = React.useState<MonthlyData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [modalState, setModalState] = React.useState<{ mode: 'add' | 'edit'; candidate?: Candidate } | null>(null)
  const [selectedView, setSelectedView] = React.useState<'all' | 'today' | 'thisweek'>('all')
  const [quickFilter, setQuickFilter] = React.useState<CandidateStatus | 'all'>('all')

  // Load data (filtered for this recruiter)
  React.useEffect(() => {
    loadDashboardData()
  }, [userId, selectedView, quickFilter])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load only this recruiter's candidates
      const candidateFilters = {
        recruiterId: userId,
        status: quickFilter === 'all' ? undefined : [quickFilter]
      }
      
      const [candidatesResult, kpiResult, monthlyResult] = await Promise.all([
        dbHelpers.getCandidates(candidateFilters),
        dbHelpers.getKPIData(userId),
        dbHelpers.getMonthlyData(userId)
      ])

      if (candidatesResult.data) {
        let filteredCandidates = candidatesResult.data

        // Apply time-based filters
        if (selectedView === 'today') {
          filteredCandidates = filteredCandidates.filter(c => 
            isToday(new Date(c.created_at)) || 
            isToday(new Date(c.updated_at))
          )
        } else if (selectedView === 'thisweek') {
          filteredCandidates = filteredCandidates.filter(c => 
            isThisWeek(new Date(c.created_at)) || 
            isThisWeek(new Date(c.updated_at))
          )
        }

        setCandidates(filteredCandidates)
      }
      
      if (kpiResult.data) {
        setKpiData(kpiResult.data)
      }
      
      if (monthlyResult.data) {
        setMonthlyData(monthlyResult.data)
      }

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
      await exportCandidatesToExcel(candidates, {
        format: 'xlsx',
        filename: `miei_candidati_${format(new Date(), 'yyyy-MM-dd')}`
      })
    } catch (error) {
      console.error('Export error:', error)
      alert('Errore durante l\'esportazione')
    }
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setModalState({ mode: 'edit', candidate })
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

  const handleStatusUpdate = async (candidateId: string, newStatus: CandidateStatus) => {
    try {
      await dbHelpers.updateCandidate(candidateId, { status: newStatus })
      await loadDashboardData()
    } catch (error) {
      console.error('Status update error:', error)
      alert('Errore durante l\'aggiornamento dello stato')
    }
  }

  const handleModalSuccess = () => {
    setModalState(null)
    loadDashboardData()
  }

  // Calculate today's activities and upcoming tasks
  const todayActivities = React.useMemo(() => {
    const todayCandidates = candidates.filter(c => 
      isToday(new Date(c.created_at)) || isToday(new Date(c.updated_at))
    )
    
    const interviews = candidates.filter(c => c.status === 'interview')
    const newCandidates = candidates.filter(c => c.status === 'new')
    const pendingOffers = candidates.filter(c => c.status === 'offer')

    return {
      todayCandidates: todayCandidates.length,
      interviews: interviews.length,
      newCandidates: newCandidates.length,
      pendingOffers: pendingOffers.length
    }
  }, [candidates])

  // Quick actions candidates
  const urgentCandidates = React.useMemo(() => {
    return candidates
      .filter(c => c.status === 'interview' || c.status === 'offer')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
  }, [candidates])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Dashboard Recruiter
          </h1>
          <p className="text-secondary-600">
            I tuoi candidati e attività di recruiting
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* View selector */}
          <div className="flex rounded-lg border border-secondary-300 bg-white">
            {[
              { key: 'all', label: 'Tutti' },
              { key: 'today', label: 'Oggi' },
              { key: 'thisweek', label: 'Settimana' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={clsx(
                  'px-3 py-2 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg',
                  selectedView === key
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-700 hover:bg-secondary-50'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quick filter */}
          <select
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value as CandidateStatus | 'all')}
            className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Tutti gli stati</option>
            <option value="new">Nuovi</option>
            <option value="review">Screening</option>
            <option value="interview">Colloquio</option>
            <option value="offer">Offerta</option>
          </select>

          {/* Actions */}
          <button
            aria-label="Aggiorna dati"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-4 w-4', refreshing && 'animate-spin')} />
            Aggiorna
          </button>

          <button
            aria-label="Esporta candidati"
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
          >
            <Download className="h-4 w-4" />
            Esporta
          </button>

          <button
            onClick={() => setModalState({ mode: 'add' })}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <UserPlus className="h-4 w-4" />
            Nuovo Candidato
          </button>
        </div>
      </div>

      {/* Recruiter KPIs */}
      <KPIGridWithLoading loading={loading}>
        {kpiData && (
          <>
            <KPICard
              title="Miei Candidati"
              value={kpiData.totalCandidates}
              icon={<Users className="h-6 w-6" />}
              color="primary"
            />
            <KPICard
              title="Nuovi Oggi"
              value={todayActivities.todayCandidates}
              icon={<UserPlus className="h-6 w-6" />}
              color="success"
            />
            <KPICard
              title="Colloqui Attivi"
              value={kpiData.activeInterviews}
              icon={<Calendar className="h-6 w-6" />}
              color="warning"
            />
            <KPICard
              title="Tasso Successo"
              value={`${kpiData.conversionRate}%`}
              icon={<Target className="h-6 w-6" />}
              color="primary"
            />
          </>
        )}
      </KPIGridWithLoading>

      {/* Today's Overview & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Activities */}
        <div className="rounded-2xl border border-secondary-200 bg-white p-6">
          <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-4">
            <Clock className="h-5 w-5 text-primary-600" />
            Attività di Oggi
          </h3>
          
          <div className="space-y-3">
            <CompactKPICard
              title="Nuovi Candidati"
              value={todayActivities.newCandidates}
              icon={<UserPlus className="h-5 w-5" />}
              color="success"
            />
            <CompactKPICard
              title="Colloqui"
              value={todayActivities.interviews}
              icon={<Calendar className="h-5 w-5" />}
              color="warning"
            />
            <CompactKPICard
              title="Offerte Pending"
              value={todayActivities.pendingOffers}
              icon={<CheckCircle className="h-5 w-5" />}
              color="primary"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-secondary-200 bg-white p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-4">
            <Bell className="h-5 w-5 text-primary-600" />
            Azioni Prioritarie
          </h3>
          
          {urgentCandidates.length > 0 ? (
            <div className="space-y-3">
              {urgentCandidates.map((candidate) => (
                <UrgentCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onStatusUpdate={handleStatusUpdate}
                  onEdit={() => handleEditCandidate(candidate)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success-400 mx-auto mb-3" />
              <p className="text-secondary-600">Nessuna azione urgente richiesta</p>
              <p className="text-sm text-secondary-500">Ottimo lavoro! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Chart */}
      <MonthlyChart 
        data={monthlyData} 
        loading={loading}
        height={300}
      />

      {/* My Pipeline */}
      <div className="rounded-2xl border border-secondary-200 bg-white p-6">
        <h3 className="flex items-center gap-2 font-semibold text-secondary-900 mb-6">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          La Mia Pipeline
        </h3>
        
        <PipelineView 
          candidates={candidates}
          onStatusUpdate={handleStatusUpdate}
          onEdit={handleEditCandidate}
        />
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
        isOpen={!!modalState}
        onClose={() => setModalState(null)}
        onSuccess={handleModalSuccess}
        userId={userId}
        candidate={modalState?.candidate}
      />
    </div>
  )
}

// Urgent candidate card component
interface UrgentCandidateCardProps {
  candidate: Candidate
  onStatusUpdate: (id: string, status: CandidateStatus) => void
  onEdit: () => void
}

function UrgentCandidateCard({ candidate, onStatusUpdate, onEdit }: UrgentCandidateCardProps) {
  const getUrgencyColor = () => {
    if (candidate.status === 'offer') return 'border-l-orange-500 bg-orange-50'
    if (candidate.status === 'interview') return 'border-l-purple-500 bg-purple-50'
    return 'border-l-blue-500 bg-blue-50'
  }

  const getNextActions = () => {
    switch (candidate.status) {
      case 'new':
        return [{ label: 'Avvia Screening', status: 'review' as CandidateStatus }]
      case 'review':
        return [{ label: 'Pianifica Colloquio', status: 'interview' as CandidateStatus }]
      case 'interview':
        return [
          { label: 'Invia Offerta', status: 'offer' as CandidateStatus },
          { label: 'Scarta', status: 'rejected' as CandidateStatus }
        ]
      case 'offer':
        return [
          { label: 'Conferma Assunzione', status: 'hired' as CandidateStatus },
          { label: 'Scarta', status: 'rejected' as CandidateStatus }
        ]
      default:
        return []
    }
  }

  return (
    <div className={clsx(
      'rounded-xl border-l-4 p-4 transition-all hover:shadow-soft',
      getUrgencyColor()
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-secondary-900">{candidate.full_name}</h4>
            <span className="text-sm text-secondary-600">•</span>
            <span className="text-sm text-secondary-600">{candidate.position}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-secondary-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {candidate.email}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Aggiornato {format(new Date(candidate.updated_at), 'dd/MM', { locale: it })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getNextActions().map(action => (
            <button
              key={action.status}
              onClick={() => onStatusUpdate(candidate.id, action.status as CandidateStatus)}
              className={clsx(
                'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                action.status === 'rejected'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              )}
            >
              {action.label}
            </button>
          ))}
          <button
            aria-label="Modifica candidato"
            onClick={onEdit}
            className="rounded-lg p-2 text-secondary-400 hover:bg-white hover:text-secondary-600"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Pipeline view component
interface PipelineViewProps {
  candidates: Candidate[]
  onStatusUpdate: (id: string, status: CandidateStatus) => void
  onEdit: (candidate: Candidate) => void
}

function PipelineView({ candidates, onStatusUpdate, onEdit }: PipelineViewProps) {
  const pipelineStages = [
    { status: 'new' as CandidateStatus, label: 'Nuovi', color: 'bg-blue-100 text-blue-800' },
    { status: 'review' as CandidateStatus, label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
    { status: 'interview' as CandidateStatus, label: 'Colloquio', color: 'bg-purple-100 text-purple-800' },
    { status: 'offer' as CandidateStatus, label: 'Offerta', color: 'bg-orange-100 text-orange-800' },
    { status: 'hired' as CandidateStatus, label: 'Assunti', color: 'bg-green-100 text-green-800' }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
      {pipelineStages.map(stage => {
        const stageCandidates = candidates.filter(c => c.status === stage.status)
        
        return (
          <div key={stage.status} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={clsx(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                stage.color
              )}>
                {stage.label}
              </span>
              <span className="text-sm font-medium text-secondary-600">
                {stageCandidates.length}
              </span>
            </div>
            
            <div className="space-y-2 min-h-[200px]">
              {stageCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  className="rounded-lg border border-secondary-200 bg-white p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onEdit(candidate)}
                >
                  <h5 className="font-medium text-secondary-900 text-sm mb-1">
                    {candidate.full_name}
                  </h5>
                  <p className="text-xs text-secondary-600 mb-2">
                    {candidate.position}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-500">
                      {format(new Date(candidate.updated_at), 'dd/MM', { locale: it })}
                    </span>
                    {candidate.cv_url && (
                      <FileText className="h-3 w-3 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
              
              {stageCandidates.length === 0 && (
                <div className="flex items-center justify-center h-32 text-secondary-400">
                  <span className="text-sm">Nessun candidato</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RecruitingDashboard
