'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { clsx } from 'clsx'
import type { KPICardProps } from '../types'

type KPIColor = 'primary' | 'success' | 'warning' | 'danger'

const colorMap: Record<KPIColor, {
  bg: string
  border: string
  icon: string
  iconBg: string
}> = {
  primary: {
    bg: 'bg-primary-50',
    border: 'border-primary-100',
    icon: 'text-primary-600',
    iconBg: 'bg-primary-100'
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-100',
    icon: 'text-success-600',
    iconBg: 'bg-success-100'
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-100',
    icon: 'text-warning-600',
    iconBg: 'bg-warning-100'
  },
  danger: {
    bg: 'bg-danger-50',
    border: 'border-danger-100',
    icon: 'text-danger-600',
    iconBg: 'bg-danger-100'
  }
}

// KPI Card Component
export function KPICard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'primary' 
}: KPICardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('tasso') || title.toLowerCase().includes('rate')) {
        return `${val.toFixed(1)}%`
      }
      return val.toLocaleString('it-IT')
    }
    return String(val)
  }

  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-4 w-4" />
    return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-secondary-400'
    return change > 0 ? 'text-success-500' : 'text-danger-500'
  }

  const getCardColors = () => {
    const fallback: KPIColor = 'primary'
    const key = ['primary', 'success', 'warning', 'danger'].includes(color)
      ? color as KPIColor
      : fallback
    return colorMap[key]
  }

  const colors = getCardColors()

  return (
    <div className={clsx(
      'relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-soft-lg',
      'bg-white', colors.border, 'group hover:scale-[1.02]'
    )}>
      <div className={clsx(
        'absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 transition-opacity group-hover:opacity-10',
        colors.iconBg
      )} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-secondary-900 mb-2">
            {formatValue(value)}
          </p>
        </div>
        <div className={clsx(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          colors.iconBg, colors.icon
        )}>
          {icon}
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div className={clsx('flex items-center gap-1', getTrendColor())}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
          <span className="text-sm text-secondary-500">
            vs mese scorso
          </span>
        </div>
      )}

      <div className={clsx(
        'absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full',
        color === 'primary' && 'bg-primary-500',
        color === 'success' && 'bg-success-500',
        color === 'warning' && 'bg-warning-500',
        color === 'danger' && 'bg-danger-500'
      )} />
    </div>
  )
}

// KPI Grid Container
interface KPIGridProps {
  children: React.ReactNode
  className?: string
}

export function KPIGrid({ children, className }: KPIGridProps) {
  return (
    <div className={clsx(
      'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {children}
    </div>
  )
}

// Loading skeleton for KPI cards
export function KPICardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-secondary-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 h-4 w-24 rounded bg-secondary-200" />
          <div className="mb-2 h-8 w-16 rounded bg-secondary-200" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-secondary-200" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-secondary-200" />
        <div className="h-4 w-20 rounded bg-secondary-200" />
      </div>
    </div>
  )
}

// KPI Grid with loading state
interface KPIGridWithLoadingProps {
  loading: boolean
  children: React.ReactNode
  className?: string
}

export function KPIGridWithLoading({ loading, children, className }: KPIGridWithLoadingProps) {
  if (loading) {
    return (
      <KPIGrid className={className}>
        {Array.from({ length: 4 }).map((_, index) => (
          <KPICardSkeleton key={index} />
        ))}
      </KPIGrid>
    )
  }

  return (
    <KPIGrid className={className}>
      {children}
    </KPIGrid>
  )
}

// Animated number component for smooth value transitions
interface AnimatedNumberProps {
  value: number
  duration?: number
  formatValue?: (value: number) => string
}

export function AnimatedNumber({ 
  value, 
  duration = 1000, 
  formatValue = (val) => val.toString() 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    let startTime: number
    let startValue = displayValue

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (value - startValue) * easeOutQuart
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{formatValue(displayValue)}</span>
}

// Compact KPI card for smaller spaces
interface CompactKPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: KPIColor
}

export function CompactKPICard({ title, value, icon, color = 'primary' }: CompactKPICardProps) {
  const getColors = () => {
    const colorMapCompact: Record<KPIColor, string> = {
      primary: 'text-primary-600 bg-primary-100',
      success: 'text-success-600 bg-success-100',
      warning: 'text-warning-600 bg-warning-100',
      danger: 'text-danger-600 bg-danger-100'
    }
    return colorMapCompact[color]
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-secondary-200 bg-white p-4 transition-all hover:shadow-soft">
      <div className={clsx(
        'flex h-10 w-10 items-center justify-center rounded-lg',
        getColors()
      )}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-secondary-600">{title}</p>
        <p className="text-xl font-bold text-secondary-900">{value}</p>
      </div>
    </div>
  )
}

export default KPICard
