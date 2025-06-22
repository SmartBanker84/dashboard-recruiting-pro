import React, { ReactNode } from 'react';

// Stati possibili per un candidato
export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'review';

// Traduzioni per gli stati del candidato (per UI)
export const STATUS_TRANSLATIONS: Record<CandidateStatus, string> = {
  new: 'Nuovo',
  screening: 'Screening',
  interview: 'Colloquio',
  offer: 'Offerta',
  hired: 'Assunto',
  rejected: 'Scartato',
  review: 'In revisione'
};

// Livelli di esperienza possibili
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';

// Traduzioni per i livelli di esperienza
export const EXPERIENCE_TRANSLATIONS: Record<ExperienceLevel, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead/Manager'
};

// Ruoli utente all’interno del sistema
export type UserRole = 'admin' | 'manager' | 'recruiter' | 'guest';

// Interfaccia utente
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Interfaccia candidato con campi principali
export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  experience_level: ExperienceLevel;
  status: CandidateStatus;
  location?: string;
  salary_expectation?: number;
  skills?: string[];
  notes?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  recruiter_id?: string;
  cv_url?: string;
  name?: string;
  priorityLevel?: 'High' | 'Medium' | 'Low';
}

// Opzioni filtro per ricerca candidati
export interface CandidateFilters {
  status?: CandidateStatus[];
  experienceLevel?: ExperienceLevel[];
  position?: string[];
  recruiter_id?: string[];
  dateRange?: { start: Date; end: Date };
  search?: string;
}

// Alias per i filtri, mantenuto FilterOptions
export type FilterOptions = CandidateFilters;

// Opzioni per esportazione dati
export interface ExportOptions {
  format?: 'xlsx' | 'csv';
  filename?: string;
  includeColumns?: string[];
  filters?: FilterOptions;
}

// KPI types
export interface KPIData {
  totalCandidates: number;
  newCandidates: number;
  activeInterviews: number;
  hired: number;
  conversionRate: number;
}

// Dati mensili per grafici/dashboard
export interface MonthlyData {
  month: string;
  candidates: number;
  hired: number;
  interviews: number;
}

// Props per dashboard principale (generica)
export interface DashboardProps {
  candidates: Candidate[];
  kpiData: KPIData[];
  monthlyData: MonthlyData[];
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onExport: (options: ExportOptions) => void;
}

// Props specifiche per RecruitingDashboard
// Estende DashboardProps aggiungendo informazioni sull'utente
export interface RecruitingDashboardProps extends DashboardProps {
  userRole: UserRole;
  userId: string;
}

// Props per componente UrgentCandidateCard
export interface UrgentCandidateCardProps {
  candidate: Candidate & { name: string; priorityLevel: 'High' | 'Medium' | 'Low' };
  onViewDetails: (candidateId: string) => void;
}

// Props per componente KPI Card
export type KPIColor = 'primary' | 'success' | 'warning' | 'danger';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  color?: KPIColor;
  loading?: boolean;
}

export interface CompactKPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: KPIColor;
  loading?: boolean;
  size?: 'sm' | 'xs';
}

export interface KPIGridProps {
  data: KPIData;
  loading?: boolean;
}

// Tipi per componenti chart
export interface LineChartProps {
  data: MonthlyData[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export interface BarChartProps {
  data: MonthlyData[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  showLegend?: boolean;
}

// Tipi per tabelle
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  sortConfig?: { key: keyof T; direction: 'asc' | 'desc' };
  onSort?: (key: keyof T) => void;
  onRowClick?: (row: T) => void;
}

// Tipi per form
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  error?: string;
  value?: any;
  onChange?: (value: any) => void;
}

// Tipi per bottoni
export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

// Tipi per risposte API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Tipi database Supabase
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      candidate_status: CandidateStatus;
      experience_level: ExperienceLevel;
    };
  };
}

export default Database;
