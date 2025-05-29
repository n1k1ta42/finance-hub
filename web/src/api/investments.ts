import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invalidateAllChangeLogs } from './change-logs'

export interface Investment {
  id: number
  userId: number
  name: string
  type: 'deposit' | 'security' | 'realty'
  status: 'open' | 'closed' | 'archived'
  amount: number
  startDate: string
  endDate?: string
  capitalization: number
  comments: string
  tags: string
  createdAt: string
  updatedAt: string
}

export interface InvestmentFormData {
  name: string
  type: 'deposit' | 'security' | 'realty'
  amount: number
  startDate: string
  endDate?: string
  capitalization?: number
  comments?: string
  tags?: string
}

export interface InvestmentOperation {
  id: number
  investmentId: number
  userId: number
  type: 'deposit' | 'withdrawal' | 'capitalization'
  amount: number
  date: string
  comment: string
  createdAt: string
  updatedAt: string
}

export interface InvestmentOperationFormData {
  type: 'deposit' | 'withdrawal' | 'capitalization'
  amount: number
  date: string
  comment?: string
}

export interface InvestmentAnalytics {
  investment: Investment
  operations: InvestmentOperation[]
  totalDeposits: number
  totalWithdrawals: number
  totalCapitalization: number
  currentValue: number
  profitLoss: number
  profitLossPercentage: number
  monthlyProgress: Array<{
    month: string
    deposits: number
    withdrawals: number
    capitalization: number
    value: number
  }>
}

// Investments API
export const useInvestments = () => {
  return useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const response = await api.get('/investments')
      return response.data.data as Investment[]
    },
  })
}

export const useInvestment = (id: number) => {
  return useQuery({
    queryKey: ['investments', id],
    queryFn: async () => {
      const response = await api.get(`/investments/${id}`)
      return response.data.data as Investment
    },
    enabled: !!id,
  })
}

export const useCreateInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InvestmentFormData) => {
      const response = await api.post('/investments', data)
      return response.data.data as Investment
    },
    onSuccess: newInvestment => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      invalidateAllChangeLogs(queryClient, 'investment', newInvestment.id)
    },
  })
}

export const useUpdateInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: InvestmentFormData
    }) => {
      const response = await api.put(`/investments/${id}`, data)
      return response.data.data as Investment
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      queryClient.invalidateQueries({ queryKey: ['investments', id] })
      invalidateAllChangeLogs(queryClient, 'investment', id)
    },
  })
}

export const useArchiveInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/investments/${id}/archive`)
      return response.data.data as Investment
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      queryClient.invalidateQueries({ queryKey: ['investments', id] })
      invalidateAllChangeLogs(queryClient, 'investment', id)
    },
  })
}

export const useUnarchiveInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/investments/${id}/unarchive`)
      return response.data.data as Investment
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      queryClient.invalidateQueries({ queryKey: ['investments', id] })
      invalidateAllChangeLogs(queryClient, 'investment', id)
    },
  })
}

export const useCompleteInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/investments/${id}/complete`)
      return response.data.data as Investment
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      queryClient.invalidateQueries({ queryKey: ['investments', id] })
      invalidateAllChangeLogs(queryClient, 'investment', id)
    },
  })
}

export const useInvestmentAnalytics = (id: number) => {
  return useQuery({
    queryKey: ['investments', id, 'analytics'],
    queryFn: async () => {
      const response = await api.get(`/investments/${id}/analytics`)
      return response.data.data as InvestmentAnalytics
    },
    enabled: !!id,
  })
}

// Investment Operations API
export const useInvestmentOperations = (investmentId: number) => {
  return useQuery({
    queryKey: ['investments', investmentId, 'operations'],
    queryFn: async () => {
      const response = await api.get(`/investments/${investmentId}/operations`)
      return response.data.data as InvestmentOperation[]
    },
    enabled: !!investmentId,
  })
}

export const useCreateInvestmentOperation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      investmentId,
      data,
    }: {
      investmentId: number
      data: InvestmentOperationFormData
    }) => {
      const response = await api.post(
        `/investments/${investmentId}/operations`,
        data,
      )
      return response.data.data as InvestmentOperation
    },
    onSuccess: (newOperation, { investmentId }) => {
      queryClient.invalidateQueries({
        queryKey: ['investments', investmentId, 'operations'],
      })
      queryClient.invalidateQueries({ queryKey: ['investments', investmentId] })
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      invalidateAllChangeLogs(queryClient, 'investment', investmentId)
      invalidateAllChangeLogs(
        queryClient,
        'investment_operation',
        newOperation.id,
      )
    },
  })
}

export const useDeleteInvestmentOperation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      investmentId,
      operationId,
    }: {
      investmentId: number
      operationId: number
    }) => {
      await api.delete(`/investments/${investmentId}/operations/${operationId}`)
    },
    onSuccess: (_, { investmentId, operationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['investments', investmentId, 'operations'],
      })
      queryClient.invalidateQueries({ queryKey: ['investments', investmentId] })
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      invalidateAllChangeLogs(queryClient, 'investment', investmentId)
      invalidateAllChangeLogs(queryClient, 'investment_operation', operationId)
    },
  })
}

export const useInvestmentsStats = () => {
  return useQuery({
    queryKey: ['investments', 'stats'],
    queryFn: async () => {
      const response = await api.get('/investments/stats')
      return response.data.data
    },
  })
}
