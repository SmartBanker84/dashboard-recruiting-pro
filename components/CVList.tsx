'use client'

import React from 'react'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreHorizontal,
  X
} from 'lucide-react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { 
  Candidate, 
  CandidateStatus, 
  ExperienceLevel, 
  SortConfig, 
  FilterOptions 
} from '../types'

interface CVListProps {
  candidates: Candidate[]
  loading?: boolean
  onEdit?: (candidate: Candidate) => void
  onDelete?: (candidateId: string) => void
  onViewCV?: (cvUrl: string) => void
  className?: string
}

export function CVList({ 
  candidates, 
  loading = false, 
  onEdit, 
  onDelete, 
  onViewCV,
  className 
}: CVListProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ 
    key: 'created_at', 
    direction: 'desc' 
  })
  const [filters, setFilters] = React.useState<FilterOptions>({})
  const [showFilters, setShowFilters] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage] = React.useState(10)

  // Filter and search candidates
  const filteredCandidates = React.useMemo(() => {
    let filtered = candidates

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate => 
        candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(candidate => filters.status!.includes(candidate.status))
    }

    // Experience level filter
    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      filtered = filtered.filter(candidate => 
        filters.experienceLevel!.includes(candidate.experience_level)
      )
    }

    // Position filter
    if (filters.position && filters.position.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.position!.some(pos => 
          candidate.position.toLowerCase().includes(pos.toLowerCase())
        )
      )
    }

    return filtered
  }, [candidates, searchTerm, filters])

  // Sort candidates
  const sortedCandidates = React.useMemo(() => {
    if (!sortConfig.key) return filteredCandidates

    return [...filteredCandidates].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Candidate]
      const bValue = b[sortConfig.key as keyof Candidate]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredCandidates, sortConfig])

  // Paginate candidates
  const paginatedCandidates = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedCandidates.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCandidates, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage)

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Handle filter change
  const handleFilterChange = (filterKey: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
  }

  if (loading) {
    return <TableSkeleton />
  }

  return (
    <div className={clsx('rounded-2xl border border-secondary-200 bg-white', className)}>
      {/* Header */}
      <div className="border-b border-secondary-200 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">
              Lista Candidati
            </h3>
            <p className="text-sm text-secondary-600">
              {sortedCandidates.length} candidati trovati
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Cerca candidati..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-secondary-300 bg-white pl-10 pr-4 text-sm placeholder-secondary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:w-64"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors',
                showFilters
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
              )}
            >
              <Filter className="h-4 w-4" />
              Filtri
              {Object.values(filters).some(f => f && f.length > 0) && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                  {Object.values(filters).filter(f => f && f.length > 0).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <FilterPanel 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            candidates={candidates}
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200 bg-secondary-50">
              <TableHeader 
                label="Nome" 
                sortKey="full_name" 
                sortConfig={sortConfig} 
                onSort={handleSort} 
              />
              <TableHeader 
                label="Posizione" 
                sortKey="position" 
                sortConfig={sortConfig} 
                onSort={handleSort} 
              />
              <TableHeader 
                label="Esperienza" 
                sortKey="experience_level" 
                sortConfig={sortConfig} 
                onSort={handleSort} 
              />
              <TableHeader 
                label="Stato" 
                sortKey="status" 
                sortConfig={sortConfig} 
                onSort={handleSort} 
              />
              <TableHeader 
                label="Data" 
                sortKey="created_at" 
                sortConfig={sortConfig} 
                onSort={handleSort} 
              />
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500">
                CV
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary-500">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {paginatedCandidates.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                candidate={candidate}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewCV={onViewCV}
              />
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {paginatedCandidates.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-secondary-700 mb-2">
              Nessun candidato trovato
            </h4>
            <p className="text-sm text-secondary-500 mb-4">
              {filteredCandidates.length === 0 && candidates.length > 0
                ? 'Prova a modificare i filtri di ricerca'
                : 'Inizia aggiungendo il primo candidato'}
            </p>
            {Object.values(filters).some(f => f && f.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Cancella filtri
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

// Table header component
interface TableHeaderProps {
  label: string
  sortKey: string
  sortConfig: SortConfig
  onSort: (key: string) => void
}

function TableHeader({ label, sortKey, sortConfig, onSort }: TableHeaderProps) {
  const isSorted = sortConfig.key === sortKey
  
  return (
    <th className="px-6 py-3 text-left">
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-secondary-500 hover:text-secondary-700"
      >
        {label}
        {isSorted ? (
          sortConfig.direction === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ChevronDown className="h-4 w-4 opacity-30" />
        )}
      </button>
    </th>
  )
}

// Candidate row component
interface CandidateRowProps {
  candidate: Candidate
  onEdit?: (candidate: Candidate) => void
  onDelete?: (candidateId: string) => void
  onViewCV?: (cvUrl: string) => void
}

function CandidateRow({ candidate, onEdit, onDelete, onViewCV }: CandidateRowProps) {
  return (
    <tr className="hover:bg-secondary-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-secondary-900">{candidate.full_name}</div>
          <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {candidate.email}
            </span>
            {candidate.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {candidate.phone}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-secondary-900">{candidate.position}</div>
          {candidate.location && (
            <div className="flex items-center gap-1 mt-1 text-sm text-secondary-500">
              <MapPin className="h-3 w-3" />
              {candidate.location}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <ExperienceBadge level={candidate.experience_level} />
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={candidate.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 text-sm text-secondary-500">
          <Calendar className="h-3 w-3" />
          {format(new Date(candidate.created_at), 'dd/MM/yyyy', { locale: it })}
        </div>
      </td>
      <td className="px-6 py-4">
        {candidate.cv_url ? (
          <button
            onClick={() => onViewCV?.(candidate.cv_url!)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <FileText className="h-4 w-4" />
            Visualizza
          </button>
        ) : (
          <span className="text-sm text-secondary-400">Nessun CV</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <ActionMenu
          candidate={candidate}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewCV={onViewCV}
        />
      </td>
    </tr>
  )
}

// Status badge component
function StatusBadge({ status }: { status: CandidateStatus }) {
  const statusConfig = {
    new: { label: 'Nuovo', color: 'bg-blue-100 text-blue-800' },
    screening: { label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
    interview: { label: 'Colloquio', color: 'bg-purple-100 text-purple-800' },
    offer: { label: 'Offerta', color: 'bg-orange-100 text-orange-800' },
    hired: { label: 'Assunto', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Scartato', color: 'bg-red-100 text-red-800' }
  }

  const config = statusConfig[status]

  return (
    <span className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      config.color
    )}>
      {config.label}
    </span>
  )
}

// Experience badge component
function ExperienceBadge({ level }: { level: ExperienceLevel }) {
  const levelConfig = {
    junior: { label: 'Junior', color: 'bg-gray-100 text-gray-800' },
    mid: { label: 'Mid', color: 'bg-blue-100 text-blue-800' },
    senior: { label: 'Senior', color: 'bg-purple-100 text-purple-800' },
    lead: { label: 'Lead', color: 'bg-indigo-100 text-indigo-800' }
  }

  const config = levelConfig[level]

  return (
    <span className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      config.color
    )}>
      {config.label}
    </span>
  )
}

// Action menu component
interface ActionMenuProps {
  candidate: Candidate
  onEdit?: (candidate: Candidate) => void
  onDelete?: (candidateId: string) => void
  onViewCV?: (cvUrl: string) => void
}

function ActionMenu({ candidate, onEdit, onDelete, onViewCV }: ActionMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg">
            {candidate.cv_url && (
              <button
                onClick={() => {
                  onViewCV?.(candidate.cv_url!)
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
              >
                <Eye className="h-4 w-4" />
                Visualizza CV
              </button>
            )}
            <button
              onClick={() => {
                onEdit?.(candidate)
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
            >
              <Edit className="h-4 w-4" />
              Modifica
            </button>
            <button
              onClick={() => {
                onDelete?.(candidate.id)
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Elimina
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Filter panel component
interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (key: keyof FilterOptions, value: any) => void
  onClearFilters: () => void
  candidates: Candidate[]
}

function FilterPanel({ filters, onFilterChange, onClearFilters, candidates }: FilterPanelProps) {
  const statusOptions = [
    { value: 'new', label: 'Nuovo' },
    { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Colloquio' },
    { value: 'offer', label: 'Offerta' },
    { value: 'hired', label: 'Assunto' },
    { value: 'rejected', label: 'Scartato' }
  ]

  const experienceOptions = [
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' }
  ]

  const uniquePositions = [...new Set(candidates.map(c => c.position))]

  return (
    <div className="mt-4 rounded-lg border border-secondary-200 bg-secondary-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-secondary-900">Filtri</h4>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 text-sm text-secondary-600 hover:text-secondary-800"
        >
          <X className="h-4 w-4" />
          Cancella tutto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Stato
          </label>
          <div className="space-y-2">
            {statusOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(option.value as CandidateStatus) || false}
                  onChange={(e) => {
                    const currentStatus = filters.status || []
                    const newStatus = e.target.checked
                      ? [...currentStatus, option.value as CandidateStatus]
                      : currentStatus.filter(s => s !== option.value)
                    onFilterChange('status', newStatus)
                  }}
                  className="rounded border-secondary-300 text-primary-600 focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience filter */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Esperienza
          </label>
          <div className="space-y-2">
            {experienceOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.experienceLevel?.includes(option.value as ExperienceLevel) || false}
                  onChange={(e) => {
                    const currentLevel = filters.experienceLevel || []
                    const newLevel = e.target.checked
                      ? [...currentLevel, option.value as ExperienceLevel]
                      : currentLevel.filter(l => l !== option.value)
                    onFilterChange('experienceLevel', newLevel)
                  }}
                  className="rounded border-secondary-300 text-primary-600 focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Position filter */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Posizione
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uniquePositions.map(position => (
              <label key={position} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.position?.includes(position) || false}
                  onChange={(e) => {
                    const currentPositions = filters.position || []
                    const newPositions = e.target.checked
                      ? [...currentPositions, position]
                      : currentPositions.filter(p => p !== position)
                    onFilterChange('position', newPositions)
                  }}
                  className="rounded border-secondary-300 text-primary-600 focus:border-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">{position}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Pagination component
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  
  return (
    <div className="border-t border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-secondary-700">
          Pagina {currentPage} di {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-secondary-300 px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Precedente
          </button>
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={clsx(
                'rounded-lg px-3 py-2 text-sm font-medium',
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-700 hover:bg-secondary-50'
              )}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-secondary-300 px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Successiva
          </button>
        </div>
      </div>
    </div>
  )
}

// Table skeleton
function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-secondary-200 bg-white">
      <div className="border-b border-secondary-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 rounded bg-secondary-200 mb-2" />
            <div className="h-4 w-24 rounded bg-secondary-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-64 rounded-lg bg-secondary-200" />
            <div className="h-10 w-20 rounded-lg bg-secondary-200" />
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-secondary-100 last:border-b-0">
            <div className="h-10 w-32 rounded bg-secondary-200" />
            <div className="h-10 w-24 rounded bg-secondary-200" />
            <div className="h-6 w-16 rounded-full bg-secondary-200" />
            <div className="h-6 w-20 rounded-full bg-secondary-200" />
            <div className="h-4 w-20 rounded bg-secondary-200" />
            <div className="h-8 w-16 rounded bg-secondary-200" />
            <div className="h-8 w-8 rounded bg-secondary-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CVList
