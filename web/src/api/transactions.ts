import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: number
  amount: number
  description: string
  date: string
  categoryId: number
  category: {
    id: number
    name: string
    type: TransactionType
    color: string
    icon: string
  }
  userId: number
  recurringRuleId?: number
  isRecurring: boolean
  createdAt: string
  updatedAt: string
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringRule {
  id: number
  userId: number
  amount: number
  description: string
  categoryId: number
  category: {
    id: number
    name: string
    type: TransactionType
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

export interface TransactionFormData {
  amount: number
  description: string
  date: string
  categoryId: number
  createRecurring?: boolean
  frequency?: RecurringFrequency
  endDate?: string
}

export interface RecurringRuleFormData {
  amount: number
  description: string
  categoryId: number
  frequency: RecurringFrequency
  startDate: string
  endDate?: string
}

export interface BulkTransactionFormData {
  transactions: TransactionFormData[]
}

export interface TransactionFilters {
  categoryId?: number
  startDate?: string
  endDate?: string
  type?: 'expense' | 'income'
  limit?: number
  page?: number
  perPage?: number
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

interface TransactionResponse {
  status: string
  data: Transaction
  message?: string
}

interface TransactionsResponse {
  status: string
  data: Transaction[]
  message?: string
  meta?: PaginationMeta
}

// Базовые функции для работы с API

const getTransactions = async (
  filters?: TransactionFilters,
): Promise<TransactionsResponse> => {
  try {
    const params = new URLSearchParams()

    if (filters?.categoryId) {
      params.append('category_id', filters.categoryId.toString())
    }

    if (filters?.startDate) {
      params.append('start_date', filters.startDate)
    }

    if (filters?.endDate) {
      params.append('end_date', filters.endDate)
    }

    if (filters?.type) {
      params.append('type', filters.type)
    }

    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }

    if (filters?.page) {
      params.append('page', filters.page.toString())
    }

    if (filters?.perPage) {
      params.append('per_page', filters.perPage.toString())
    }

    const response = await api.get(
      `/transactions${params.toString() ? '?' + params.toString() : ''}`,
    )

    return response.data
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error)
    throw error
  }
}

const getTransactionById = async (id: number): Promise<TransactionResponse> => {
  try {
    const response = await api.get(`/transactions/${id}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при получении транзакции с ID ${id}:`, error)
    throw error
  }
}

const createTransaction = async (
  data: TransactionFormData,
): Promise<TransactionResponse> => {
  try {
    const response = await api.post(`/transactions`, data)
    return response.data
  } catch (error) {
    console.error('Ошибка при создании транзакции:', error)
    throw error
  }
}

const createBulkTransactions = async (
  data: BulkTransactionFormData,
): Promise<TransactionsResponse> => {
  try {
    const response = await api.post(`/transactions/bulk`, data)
    return response.data
  } catch (error) {
    console.error('Ошибка при массовом создании транзакций:', error)
    throw error
  }
}

const updateTransaction = async (
  id: number,
  data: TransactionFormData,
): Promise<TransactionResponse> => {
  try {
    const response = await api.put(`/transactions/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении транзакции с ID ${id}:`, error)
    throw error
  }
}

const deleteTransaction = async (id: number): Promise<void> => {
  try {
    await api.delete(`/transactions/${id}`)
  } catch (error) {
    console.error(`Ошибка при удалении транзакции с ID ${id}:`, error)
    throw error
  }
}

const deleteBulkTransactions = async (ids: number[]): Promise<void> => {
  try {
    await api.delete('/transactions/bulk', {
      data: { transactionIds: ids },
    })
  } catch (error) {
    console.error('Ошибка при массовом удалении транзакций:', error)
    throw error
  }
}

// React Query хуки

export interface TransactionsWithMeta {
  data: Transaction[]
  meta?: PaginationMeta
}

export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters),
    select: (data): TransactionsWithMeta => ({
      data: data.data,
      meta: data.meta,
    }),
  })
}

export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => getTransactionById(id),
    select: data => data.data,
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useCreateBulkTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBulkTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionFormData }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useDeleteBulkTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBulkTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

// Экспорт транзакций

// Экспорт транзакций в CSV
export const exportTransactionsToCSV = async (
  filters?: TransactionFilters,
): Promise<void> => {
  try {
    const params = new URLSearchParams()

    if (filters?.categoryId) {
      params.append('category_id', filters.categoryId.toString())
    }

    if (filters?.startDate) {
      params.append('start_date', filters.startDate)
    }

    if (filters?.endDate) {
      params.append('end_date', filters.endDate)
    }

    if (filters?.type) {
      params.append('type', filters.type)
    }

    const url = `/transactions/export/csv${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url, { responseType: 'blob' })

    // Создаем ссылку для скачивания файла
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = downloadUrl

    // Формируем имя файла с текущей датой
    const currentDate = new Date().toISOString().slice(0, 10)
    link.setAttribute('download', `transactions_${currentDate}.csv`)

    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Ошибка при экспорте транзакций в CSV:', error)
    throw error
  }
}

// Экспорт транзакций в Excel
export const exportTransactionsToExcel = async (
  filters?: TransactionFilters,
): Promise<void> => {
  try {
    const params = new URLSearchParams()

    if (filters?.categoryId) {
      params.append('category_id', filters.categoryId.toString())
    }

    if (filters?.startDate) {
      params.append('start_date', filters.startDate)
    }

    if (filters?.endDate) {
      params.append('end_date', filters.endDate)
    }

    if (filters?.type) {
      params.append('type', filters.type)
    }

    const url = `/transactions/export/excel${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url, { responseType: 'blob' })

    // Создаем ссылку для скачивания файла
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = downloadUrl

    // Формируем имя файла с текущей датой
    const currentDate = new Date().toISOString().slice(0, 10)
    link.setAttribute('download', `transactions_${currentDate}.xlsx`)

    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Ошибка при экспорте транзакций в Excel:', error)
    throw error
  }
}

// React Query хуки для экспорта
export const useExportTransactionsToCSV = () => {
  return useMutation({
    mutationFn: exportTransactionsToCSV,
  })
}

export const useExportTransactionsToExcel = () => {
  return useMutation({
    mutationFn: exportTransactionsToExcel,
  })
}

// Recurring Rules API functions

interface RecurringRuleResponse {
  status: string
  data: RecurringRule
  message?: string
}

interface RecurringRulesResponse {
  status: string
  data: RecurringRule[]
  message?: string
}

const getRecurringRules = async (): Promise<RecurringRulesResponse> => {
  try {
    const response = await api.get('/recurring')
    return response.data
  } catch (error) {
    console.error('Ошибка при получении регулярных платежей:', error)
    throw error
  }
}

const getRecurringRuleById = async (
  id: number,
): Promise<RecurringRuleResponse> => {
  try {
    const response = await api.get(`/recurring/${id}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при получении регулярного платежа с ID ${id}:`, error)
    throw error
  }
}

const createRecurringRule = async (
  data: RecurringRuleFormData,
): Promise<RecurringRuleResponse> => {
  try {
    const response = await api.post('/recurring', data)
    return response.data
  } catch (error) {
    console.error('Ошибка при создании регулярного платежа:', error)
    throw error
  }
}

const updateRecurringRule = async (
  id: number,
  data: RecurringRuleFormData,
): Promise<RecurringRuleResponse> => {
  try {
    const response = await api.put(`/recurring/${id}`, data)
    return response.data
  } catch (error) {
    console.error(
      `Ошибка при обновлении регулярного платежа с ID ${id}:`,
      error,
    )
    throw error
  }
}

const toggleRecurringRule = async (
  id: number,
): Promise<RecurringRuleResponse> => {
  try {
    const response = await api.put(`/recurring/${id}/toggle`)
    return response.data
  } catch (error) {
    console.error(
      `Ошибка при изменении статуса регулярного платежа с ID ${id}:`,
      error,
    )
    throw error
  }
}

const deleteRecurringRule = async (id: number): Promise<void> => {
  try {
    await api.delete(`/recurring/${id}`)
  } catch (error) {
    console.error(`Ошибка при удалении регулярного платежа с ID ${id}:`, error)
    throw error
  }
}

// React Query hooks for recurring rules

export const useRecurringRules = () => {
  return useQuery({
    queryKey: ['recurring-rules'],
    queryFn: getRecurringRules,
    select: data => data.data,
  })
}

export const useRecurringRule = (id: number) => {
  return useQuery({
    queryKey: ['recurring-rule', id],
    queryFn: () => getRecurringRuleById(id),
    select: data => data.data,
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
    mutationFn: ({ id, data }: { id: number; data: RecurringRuleFormData }) =>
      updateRecurringRule(id, data),
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
