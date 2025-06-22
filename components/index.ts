// Central export file for all components
// This simplifies imports and provides better tree-shaking

// KPI Components
export { 
  KPICard, 
  KPIGrid, 
  KPIGridWithLoading, 
  CompactKPICard,
  KPICardSkeleton,
  AnimatedNumber
} from './KPI'

// Chart Components
export { 
  MonthlyChart 
} from './MonthlyChart'

// List and Table Components
export { 
  CVList,
  default as CVListDefault
} from './CVList'

// Modal Components
export { 
  AddCandidateModal,
  default as AddCandidateModalDefault 
} from './AddCandidateModal'

// Dashboard Components
export { 
  ManagerDashboard,
  default as ManagerDashboardDefault 
} from './ManagerDashboard'

export { 
  RecruitingDashboard,
  default as RecruitingDashboardDefault 
} from './RecruitingDashboard'

// Re-export types if needed
export type { 
  KPICardProps,
  CompactKPICardProps 
} from '../types'
