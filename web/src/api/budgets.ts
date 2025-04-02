import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'

export interface Budget {
  id: number
  name: string
  amount: number
  spent: number
  period: BudgetPeriod
  startDate: string
  endDate: string
  categoryId?: number
  category?: {
    id: number
    name: string
    color: string
  }
  userId: number
  createdAt: string
  updatedAt: string
}

export interface BudgetFormData {
  name: string
  amount: number
  period: BudgetPeriod
  startDate: string
  endDate: string
  categoryId?: number
}

interface BudgetResponse {
  status: string
  data: Budget
  message?: string
}

interface BudgetsResponse {
  status: string
  data: Budget[]
  message?: string
}

// Базовые функции для работы с API

const getBudgets = async (): Promise<BudgetsResponse> => {
  try {
    const response = await api.get('/budgets')
    return response.data
  } catch (error) {
    console.error('Ошибка при получении бюджетов:', error)
    throw error
  }
}

const getBudgetById = async (id: number): Promise<BudgetResponse> => {
  try {
    const response = await api.get(`/budgets/${id}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при получении бюджета с ID ${id}:`, error)
    throw error
  }
}

const createBudget = async (
  budget: BudgetFormData,
): Promise<BudgetResponse> => {
  try {
    const response = await api.post('/budgets', budget)
    return response.data
  } catch (error) {
    console.error('Ошибка при создании бюджета:', error)
    throw error
  }
}

const updateBudget = async (
  id: number,
  budget: BudgetFormData,
): Promise<BudgetResponse> => {
  try {
    const response = await api.put(`/budgets/${id}`, budget)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении бюджета с ID ${id}:`, error)
    throw error
  }
}

const deleteBudget = async (id: number): Promise<void> => {
  try {
    await api.delete(`/budgets/${id}`)
  } catch (error) {
    console.error(`Ошибка при удалении бюджета с ID ${id}:`, error)
    throw error
  }
}

// React Query хуки

export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgets,
    select: data => data.data,
  })
}

export const useBudget = (id: number) => {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => getBudgetById(id),
    select: data => data.data,
  })
}

export const useCreateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetFormData }) =>
      updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useDeleteBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}
