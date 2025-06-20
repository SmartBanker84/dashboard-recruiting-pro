'use client'

import React from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  User,
  Briefcase,
  MapPin,
  Star,
  ChevronDown,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { clsx } from 'clsx'
import { dbHelpers } from '../lib/supabase'
import type { Candidate, ExperienceLevel, CandidateStatus } from '../types'

interface CVListProps {
  candidates: Candidate[]
  loading?: boolean
  onRefresh?: () => void
}

interface SortConfig {
  key: keyof Candidate
  direction: 'asc' | 'desc'
}

interface FilterConfig {
  status: CandidateStatus[]
  experience: ExperienceLevel[]
  search: string
}

const STATUS_OPTIONS: { value: CandidateStatus; label: string; color: string }[] = [
  { value: 'new', label: 'Nuovo', color: 'bg-blue-100 text-blue-800' },
  { value: 'review', label: 'In Revisione', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interview', label: 'Colloquio', color: 'bg-purple-100 text-purple-800' },
  { value: 'offer', label: 'Offerta', color: 'bg-orange-100 text-orange-800' },
  { value: 'hired', label: 'Assunto', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rifiutato', color: 'bg-red-100 text-red-800' }
]

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' }
]

export function CVList({ candidates, loading = false, onRefresh }: CVListProps) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  })
  
  const [filters, setFilters] = React.useState<FilterConfig>({
    status: [],
    experience: [],
    search: ''
  })
  
  const [showFilters, setShowFilters] = React.useState(false)

  // Sort candidates
  const sortedCandidates = React.useMemo(() => {
    if (!candidates) return []

    return [...candidates].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1
      if (bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return sortConfig.direction === 'asc' ? -1 : 1
      if (bValue === null) return sortConfig.direction === 'asc' ? 1 : -1

      // Compare non-null, non-undefined values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [candidates, sortConfig])

  // Filter candidates
  const filteredCandidates = React.useMemo(() => {
    return sortedCandidates.filter(candidate => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = [
          candidate.full_name,
          candidate.email,
          candidate.position,
          candidate.location,
          ...(candidate.skills || [])
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(candidate.status)) {
        return false
      }

      // Experience filter
      if (filters.experience.length > 0 && !filters.experience.includes(candidate.experience_level)) {
        return false
      }

      return true
    })
  }, [sortedCandidates, filters])

  const handleSort = (key: keyof Candidate) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (type: keyof FilterConfig, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      experience: [],
      search: ''
    })
  }

  const hasActiveFilters = filters.status.length > 0 || filters.experience.length > 0 || filters.search

  const downloadCV = async (candidate: Candidate) => {
    if (!candidate.cv_url) return

    try {
      const response = await fetch(candidate.cv_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `CV_${candidate.full_name.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading CV:', error)
    }
  }

  const previewCV = (candidate: Candidate) => {
    if (candidate.cv_url) {
      window.open(candidate.cv_url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento CV...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lista CV</h2>
          <p className="text-sm text-gray-600">
            {filteredCandidates.length} di {candidates.length} candidati
          </p>
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca candidati..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors',
              showFilters || hasActiveFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            <Filter className="h-4 w-4" />
            Filtri
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filters.status.length + filters.experience.length + (filters.search ? 1 : 0)}
              </span>
            )}
            <ChevronDown className={clsx(
              'h-4 w-4 transition-transform',
              showFilters && 'transform rotate-180'
            )} />
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Filtri</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Cancella tutti
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato
              </label>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={(e) => {
                        const newStatus = e.target.checked
                          ? [...filters.status, option.value]
                          : filters.status.filter(s => s !== option.value)
                        handleFilterChange('status', newStatus)
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Esperienza
              </label>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.experience.includes(option.value)}
                      onChange={(e) => {
                        const newExperience = e.target.checked
                          ? [...filters.experience, option.value]
                          : filters.experience.filter(exp => exp !== option.value)
                        handleFilterChange('experience', newExperience)
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV List */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {candidates.length === 0 ? 'Nessun CV disponibile' : 'Nessun risultato'}
          </h3>
          <p className="text-gray-600">
            {candidates.length === 0 
              ? 'I CV dei candidati appariranno qui una volta caricati.'
              : 'Prova a modificare i filtri di ricerca.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Cancella filtri
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sort controls */}
          <div className="flex gap-2 text-sm">
            <span className="text-gray-600">Ordina per:</span>
            <SortButton
              label="Nome"
              active={sortConfig.key === 'full_name'}
              direction={sortConfig.key === 'full_name' ? sortConfig.direction : undefined}
              onClick={() => handleSort('full_name')}
            />
            <SortButton
              label="Data"
              active={sortConfig.key === 'created_at'}
              direction={sortConfig.key === 'created_at' ? sortConfig.direction : undefined}
              onClick={() => handleSort('created_at')}
            />
            <SortButton
              label="Posizione"
              active={sortConfig.key === 'position'}
              direction={sortConfig.key === 'position' ? sortConfig.direction : undefined}
              onClick={() => handleSort('position')}
            />
          </div>

          {/* CV Cards */}
          <div className="grid gap-4">
            {filteredCandidates.map(candidate => (
              <CVCard
                key={candidate.id}
                candidate={candidate}
                onDownload={() => downloadCV(candidate)}
                onPreview={() => previewCV(candidate)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Sort button component
interface SortButtonProps {
  label: string
  active: boolean
  direction?: 'asc' | 'desc'
  onClick: () => void
}

function SortButton({ label, active, direction, onClick }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1 px-2 py-1 rounded transition-colors',
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      {label}
      {active && direction === 'asc' && <SortAsc className="h-3 w-3" />}
      {active && direction === 'desc' && <SortDesc className="h-3 w-3" />}
    </button>
  )
}

// CV card component
interface CVCardProps {
  candidate: Candidate
  onDownload: () => void
  onPreview: () => void
}

function CVCard({ candidate, onDownload, onPreview }: CVCardProps) {
  const statusOption = STATUS_OPTIONS.find(s => s.value === candidate.status)
  const experienceOption = EXPERIENCE_OPTIONS.find(e => e.value === candidate.experience_level)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {candidate.full_name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {candidate.email}
              </p>
            </div>

            {statusOption && (
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                statusOption.color
              )}>
                {statusOption.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="truncate">{candidate.position}</span>
            </div>
            
            {experienceOption && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{experienceOption.label}</span>
              </div>
            )}
            
            {candidate.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{candidate.location}</span>
              </div>
            )}
          </div>

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{candidate.skills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>
              Aggiunto il {new Date(candidate.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
        </div>

        {/* CV Actions */}
        <div className="flex-shrink-0 ml-4">
          {candidate.cv_url ? (
            <div className="flex gap-2">
              <button
                onClick={onPreview}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Anteprima CV"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={onDownload}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Scarica CV"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <AlertCircle className="h-3 w-3" />
              <span>CV non disponibile</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
