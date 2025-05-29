import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

export interface ChangeLogEntry {
  id: number
  entityType:
    | 'project'
    | 'investment'
    | 'project_payment'
    | 'investment_operation'
  entityId: number
  entityName: string // Название связанного объекта
  action: 'create' | 'update' | 'delete' | 'archive'
  changes: Record<string, any>
  createdAt: string
}

// Получение истории изменений для конкретной сущности
export const useEntityHistory = (entityType: string, entityId: number) => {
  return useQuery({
    queryKey: ['change-logs', entityType, entityId],
    queryFn: async () => {
      const response = await api.get(`/change-logs/${entityType}/${entityId}`)
      return response.data.data as ChangeLogEntry[]
    },
    enabled: !!entityType && !!entityId,
  })
}

// Получение общей истории изменений пользователя
export const useUserHistory = (options?: {
  entityType?: string
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: ['change-logs', 'user', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.entityType) params.append('entityType', options.entityType)
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.offset) params.append('offset', options.offset.toString())

      const response = await api.get(`/change-logs?${params.toString()}`)
      return {
        data: response.data.data as ChangeLogEntry[],
        pagination: response.data.pagination,
      }
    },
  })
}

// Утилитарные функции для инвалидации кэша
export const invalidateEntityHistory = (
  queryClient: QueryClient,
  entityType: string,
  entityId: number,
) => {
  queryClient.invalidateQueries({
    queryKey: ['change-logs', entityType, entityId],
  })
}

export const invalidateUserHistory = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    queryKey: ['change-logs', 'user'],
  })
}

export const invalidateAllChangeLogs = (
  queryClient: QueryClient,
  entityType: string,
  entityId: number,
) => {
  invalidateEntityHistory(queryClient, entityType, entityId)
  invalidateUserHistory(queryClient)
}

// Функция для получения читаемого описания действия
export const getActionLabel = (action: string): string => {
  switch (action) {
    case 'create':
      return 'Создано'
    case 'update':
      return 'Обновлено'
    case 'delete':
      return 'Удалено'
    case 'archive':
      return 'Архивировано'
    default:
      return action
  }
}

// Функция для получения читаемого описания типа сущности
export const getEntityTypeLabel = (entityType: string): string => {
  switch (entityType) {
    case 'project':
      return 'Проект'
    case 'investment':
      return 'Инвестиция'
    case 'project_payment':
      return 'Платеж по проекту'
    case 'investment_operation':
      return 'Операция по инвестиции'
    default:
      return entityType
  }
}
