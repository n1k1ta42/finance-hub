import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface RecurringRule {
  id: number
  userId: number
  amount: number
  description: string
  categoryId: number
  category: {
    id: number
    name: string
    color: string
    icon: string
  }
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
  nextExecuteDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringRuleFormData {
  amount: number
  description: string
  categoryId: number
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
}

interface RecurringRulesResponse {
  status: string
  data: RecurringRule[]
}

interface RecurringRuleResponse {
  status: string
  data: RecurringRule
  message?: string
}

// API функции
const getRecurringRules = async (): Promise<RecurringRulesResponse> => {
  const response = await api.get('/recurring')
  return response.data
}

const getRecurringRule = async (id: number): Promise<RecurringRuleResponse> => {
  const response = await api.get(`/recurring/${id}`)
  return response.data
}

const createRecurringRule = async (
  data: RecurringRuleFormData,
): Promise<RecurringRuleResponse> => {
  const response = await api.post('/recurring', data)
  return response.data
}

const updateRecurringRule = async ({
  id,
  data,
}: {
  id: number
  data: RecurringRuleFormData
}): Promise<RecurringRuleResponse> => {
  const response = await api.put(`/recurring/${id}`, data)
  return response.data
}

const toggleRecurringRule = async (
  id: number,
): Promise<RecurringRuleResponse> => {
  const response = await api.put(`/recurring/${id}/toggle`)
  return response.data
}

const deleteRecurringRule = async (
  id: number,
): Promise<{ status: string; message: string }> => {
  const response = await api.delete(`/recurring/${id}`)
  return response.data
}

// React Query hooks
export const useRecurringRules = () => {
  return useQuery({
    queryKey: ['recurring-rules'],
    queryFn: () => getRecurringRules().then(res => res.data),
  })
}

export const useRecurringRule = (id: number) => {
  return useQuery({
    queryKey: ['recurring-rule', id],
    queryFn: () => getRecurringRule(id).then(res => res.data),
    enabled: !!id,
  })
}

export const useCreateRecurringRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRecurringRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
    },
  })
}

export const useUpdateRecurringRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRecurringRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
    },
  })
}

export const useToggleRecurringRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleRecurringRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
    },
  })
}

export const useDeleteRecurringRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRecurringRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-rules'] })
    },
  })
}
