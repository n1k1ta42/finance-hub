import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export interface ForecastData {
  projectId?: number
  investmentId?: number
  forecastPeriod: number // месяцы
  predictedAmount: number
  confidence: number // 0-100%
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface PeriodComparison {
  current: {
    period: string
    totalAmount: number
    averageGrowth: number
    projectsCount: number
    investmentsCount: number
  }
  previous: {
    period: string
    totalAmount: number
    averageGrowth: number
    projectsCount: number
    investmentsCount: number
  }
  growth: {
    amountChange: number
    amountChangePercent: number
    growthChange: number
    projectsChange: number
    investmentsChange: number
  }
}

export interface ProjectGoals {
  projectId: number
  monthlyTarget: number
  daysToTarget: number
  recommendedPayment: number
  riskLevel: 'low' | 'medium' | 'high'
  feasibility: number // 0-100%
}

// Прогнозирование для проектов
export const useProjectForecast = (projectId: number) => {
  return useQuery({
    queryKey: ['projects', projectId, 'forecast'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/forecast`)
      return response.data.data as ForecastData
    },
    enabled: !!projectId,
  })
}

// Прогнозирование для инвестиций
export const useInvestmentForecast = (investmentId: number) => {
  return useQuery({
    queryKey: ['investments', investmentId, 'forecast'],
    queryFn: async () => {
      const response = await api.get(`/investments/${investmentId}/forecast`)
      return response.data.data as ForecastData
    },
    enabled: !!investmentId,
  })
}

// Сравнение периодов для проектов
export const useProjectsComparison = (period: 'month' | 'quarter' | 'year') => {
  return useQuery({
    queryKey: ['projects', 'comparison', period],
    queryFn: async () => {
      const response = await api.get(`/projects/comparison?period=${period}`)
      return response.data.data as PeriodComparison
    },
  })
}

// Сравнение периодов для инвестиций
export const useInvestmentsComparison = (
  period: 'month' | 'quarter' | 'year',
) => {
  return useQuery({
    queryKey: ['investments', 'comparison', period],
    queryFn: async () => {
      const response = await api.get(`/investments/comparison?period=${period}`)
      return response.data.data as PeriodComparison
    },
  })
}

// Анализ целей проекта
export const useProjectGoals = (projectId: number) => {
  return useQuery({
    queryKey: ['projects', projectId, 'goals'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/goals`)
      return response.data.data as ProjectGoals
    },
    enabled: !!projectId,
  })
}
