'use client'

import React from 'react'

interface KPI {
  totalCandidates: number
  totalRecruiters: number
  averageRAL: number
  conversionRate: number
}

interface KPIHeaderProps {
  loading: boolean;
  kpiData: {
    totalCandidates: number;
    totalRecruiters: number;
    averageRAL: number;
    conversionRate: number;
  };
  managerMetrics: {
    totalCandidates: number;
    thisMonth: number;
    monthlyGrowth: number;
    avgSalary: number;
    topPositions: [string, number][];
  } | null;
}

const KPIHeader: React.FC<KPIHeaderProps> = ({ loading, kpiData, managerMetrics }) => {

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 sm:text-3xl">
          KPI Performance
        </h1>
        <p className="mt-1 text-sm text-secondary-600">
          Riepilogo degli indicatori chiave di performance per il team.
        </p>
      </div>
      {kpiData && (
        <div className="flex gap-4">
          <div>
            <p className="text-sm font-medium text-secondary-600">Candidati Totali</p>
            <p className="text-xl font-bold text-secondary-900">{kpiData.totalCandidates}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-600">Recruiter Attivi</p>
            <p className="text-xl font-bold text-secondary-900">{kpiData.totalRecruiters}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-600">RAL Media</p>
            <p className="text-xl font-bold text-secondary-900">€ {kpiData.averageRAL.toLocaleString('it-IT')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-600">Tasso Conversione</p>
            <p className="text-xl font-bold text-secondary-900">{kpiData.conversionRate}%</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default KPIHeader;
