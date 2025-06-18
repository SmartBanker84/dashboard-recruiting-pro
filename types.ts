// User and Role Types
export type UserRole = 'manager' | 'recruiter';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Candidate Types
export type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  position: string;
  experience_level: ExperienceLevel;
  status: CandidateStatus;
  cv_url?: string;
  notes?: string;
  salary_expectation?: number;
  location?: string;
  skills: string[];
  recruiter_id: string;
  created_at: string;
  updated_at: string;
}

// Dashboard KPI Types
export interface KPIData {
  totalCandidates: number;
  newCandidates: number;
  activeInterviews: number;
  hired: number;
  conversionRate: number;
}

// Chart Data Types
export interface MonthlyData {
  month: string;
  candidates: number;
  hired: number;
  interviews: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Filter Types
export interface FilterOptions {
  status?: CandidateStatus[];
  experienceLevel?: ExperienceLevel[];
  position?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  recruiter?: string[];
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AddCandidateModalProps extends ModalProps {
  onSuccess: () => void;
}

// Form Types
export interface AddCandidateForm {
  full_name: string;
  email: string;
  phone?: string;
  position: string;
  experience_level: ExperienceLevel;
  status: CandidateStatus;
  notes?: string;
  salary_expectation?: number;
  location?: string;
  skills: string[];
  cv_file?: File;
}

// Table Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Export Types
export interface ExportOptions {
  format: 'xlsx' | 'csv';
  filename?: string;
  includeColumns?: string[];
  filters?: FilterOptions;
}

// Supabase Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      candidates: {
        Row: Candidate;
        Insert: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Candidate, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Component Props Types
export interface DashboardProps {
  userRole: UserRole;
  userId: string;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export interface BadgeProps {
  variant: CandidateStatus | ExperienceLevel | 'default';
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type SelectOption = {
  value: string;
  label: string;
};
