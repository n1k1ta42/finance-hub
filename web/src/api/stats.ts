import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export interface BalanceStats {
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface CategoryStat {
  categoryId: number
  categoryName: string
  amount: number
  percentage: number
}

export interface CategoryStatsResponse {
  status: string
  data: {
    categories: CategoryStat[]
    total: number
    start_date: string
    end_date: string
  }
  message?: string
}

export interface BalanceStatsResponse {
  status: string
  data: {
    stats: BalanceStats
    start_date: string
    end_date: string
  }
  message?: string
}

// Интерфейс для точки динамики баланса
export interface BalanceDynamicsPoint {
  date: string
  income: number
  expense: number
  balance: number
}

// Интерфейс для ответа API с динамикой баланса
export interface BalanceDynamicsResponse {
  status: string
  data: {
    dynamics: BalanceDynamicsPoint[]
    start_date: string
    end_date: string
  }
  message?: string
}

export interface StatsOptions {
  period?: string
  startDate?: string
  endDate?: string
}

export interface CategoryStatsOptions extends StatsOptions {
  type?: 'expense' | 'income'
}

// Базовые функции для работы с API

const getBalanceSummary = async (
  options?: StatsOptions,
): Promise<BalanceStatsResponse> => {
  try {
    const params = new URLSearchParams()

    if (options?.period) {
      params.append('period', options.period)
    }

    if (options?.startDate) {
      params.append('start_date', options.startDate)
    }

    if (options?.endDate) {
      params.append('end_date', options.endDate)
    }

    const response = await api.get(
      `/stats/balance${params.toString() ? '?' + params.toString() : ''}`,
    )

    return response.data
  } catch (error) {
    console.error('Ошибка при получении сводки баланса:', error)
    throw error
  }
}

const getCategorySummary = async (
  options?: CategoryStatsOptions,
): Promise<CategoryStatsResponse> => {
  try {
    const params = new URLSearchParams()

    if (options?.type) {
      params.append('type', options.type)
    }

    if (options?.period) {
      params.append('period', options.period)
    }

    if (options?.startDate) {
      params.append('start_date', options.startDate)
    }

    if (options?.endDate) {
      params.append('end_date', options.endDate)
    }

    const response = await api.get(
      `/stats/categories${params.toString() ? '?' + params.toString() : ''}`,
    )

    return response.data
  } catch (error) {
    console.error('Ошибка при получении статистики по категориям:', error)
    throw error
  }
}

const getBudgetProgress = async (): Promise<any> => {
  try {
    const response = await api.get(`/stats/budgets`)
    return response.data
  } catch (error) {
    console.error('Ошибка при получении прогресса бюджетов:', error)
    throw error
  }
}

// Функция для получения динамики баланса по дням или часам
const getBalanceDynamics = async (
  options?: StatsOptions,
): Promise<BalanceDynamicsResponse> => {
  try {
    const params = new URLSearchParams()

    if (options?.period) {
      params.append('period', options.period)
    }

    if (options?.startDate) {
      params.append('start_date', options.startDate)
    }

    if (options?.endDate) {
      params.append('end_date', options.endDate)
    }

    const response = await api.get(
      `/stats/dynamics${params.toString() ? '?' + params.toString() : ''}`,
    )

    return response.data
  } catch (error) {
    console.error('Ошибка при получении динамики баланса:', error)
    throw error
  }
}

// React Query хуки

export const useBalanceSummary = (options?: StatsOptions) => {
  return useQuery({
    queryKey: ['stats', 'balance', options],
    queryFn: () => getBalanceSummary(options),
    select: data => data.data,
  })
}

export const useCategorySummary = (
  options?: CategoryStatsOptions,
  queryOptions?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['stats', 'categories', options],
    queryFn: () => getCategorySummary(options),
    select: data => data.data,
    ...queryOptions,
  })
}

export const useBudgetProgress = () => {
  return useQuery({
    queryKey: ['stats', 'budgets'],
    queryFn: getBudgetProgress,
    select: data => data.data,
  })
}

export const useBalanceDynamics = (options?: StatsOptions) => {
  return useQuery({
    queryKey: ['stats', 'dynamics', options],
    queryFn: () => getBalanceDynamics(options),
    select: data => data.data,
  })
}

// Экспорт статистики в PDF
export const exportStatsToPDF = async (
  options?: StatsOptions,
): Promise<Blob> => {
  try {
    const params = new URLSearchParams()

    if (options?.period) {
      params.append('period', options.period)
    }

    if (options?.startDate) {
      params.append('start_date', options.startDate)
    }

    if (options?.endDate) {
      params.append('end_date', options.endDate)
    }

    const response = await api.get(
      `/stats/export/pdf${params.toString() ? '?' + params.toString() : ''}`,
      { responseType: 'blob' },
    )

    return response.data
  } catch (error) {
    console.error('Ошибка при экспорте статистики в PDF:', error)
    throw error
  }
}
