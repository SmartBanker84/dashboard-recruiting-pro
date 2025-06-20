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

// Export default type for convenience
export type { Database as default }
