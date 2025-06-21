import React from 'react'

// User types
export type UserRole = 'manager' | 'recruiter'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

// Candidate types
export type CandidateStatus = 'new' | 'review' | 'interview' | 'offer' | 'hired' | 'rejected'
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead'

export interface Candidate {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  experience_level: ExperienceLevel
  location: string
  status: CandidateStatus
  notes: string
  cv_url: string
  skills: string[]
  recruiter_id: string
  created_at: string
  updated_at: string
}

// Form types
export interface AddCandidateForm {
  full_name: string
  email: string
  phone: string
  position: string
  experience_level: ExperienceLevel
  location: string
  notes: string
  cv_url: string
  skills: string[]
  cv_file?: File
}

// KPI types
export interface KPIData {
  totalCandidates: number
  newCandidates: number
  activeInterviews: number
  hired: number
  conversionRate: number
}

// Monthly data type for charts/dashboard
export interface MonthlyData {
  month: string
  candidates: number
  hired: number
  interviews: number
}

export interface ChartData {
  month: string
  candidates: number
  hired: number
  interviews: number
}

// Filter types
export interface CandidateFilters {
  status?: CandidateStatus[]
  experience?: ExperienceLevel[]
  recruiter?: string
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}

// Search and sort types
export interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
}

export interface SearchConfig {
  query: string
  fields: string[]
  caseSensitive: boolean
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  totalPages: number
  hasMore: boolean
}

// Database types (Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      candidates: {
        Row: Candidate
        Insert: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Candidate, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      candidate_status: CandidateStatus
      experience_level: ExperienceLevel
    }
  }
}

// Component props types
export interface DashboardProps {
  userRole: UserRole
  userId: string
}

export interface CandidateCardProps {
  candidate: Candidate
  onUpdate?: (candidate: Candidate) => void
  onDelete?: (candidateId: string) => void
  compact?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

// Chart configuration types
export interface ChartConfig {
  responsive: boolean
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right'
    }
    title: {
      display: boolean
      text: string
    }
  }
}

// Status configuration
export interface StatusConfig {
  value: CandidateStatus
  label: string
  color: string
  bgColor: string
  textColor: string
  icon?: string
}

// Experience configuration
export interface ExperienceConfig {
  value: ExperienceLevel
  label: string
  description: string
  yearsRange: string
}

// KPI Component types
export type KPIColor = 'primary' | 'success' | 'warning' | 'danger'

export interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: KPIColor
  loading?: boolean
}

export interface KPIGridProps {
  data: KPIData
  loading?: boolean
}

// Chart component types
export interface LineChartProps {
  data: MonthlyData[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export interface BarChartProps {
  data: MonthlyData[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
}

export interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  height?: number
  showLegend?: boolean
}

// Table component types
export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  sortConfig?: SortConfig<T>
  onSort?: (key: keyof T) => void
  onRowClick?: (row: T) => void
}

// Form component types
export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file'
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  error?: string
  value?: any
  onChange?: (value: any) => void
}

// Button component types
export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

// Export default type for convenience
export type { Database as default }
