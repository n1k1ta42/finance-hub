import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  importance: string
  isRead: boolean
  data: string
  createdAt: string
  updatedAt: string
  readAt: string | null
}

export interface NotificationFilters {
  type?: string
  isRead?: boolean
  importance?: string
  limit?: number
  offset?: number
}

// Получение уведомлений пользователя
export const useNotifications = (filters: NotificationFilters = {}) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.isRead !== undefined)
        params.append('isRead', String(filters.isRead))
      if (filters.importance) params.append('importance', filters.importance)
      if (filters.limit) params.append('limit', String(filters.limit))
      if (filters.offset) params.append('offset', String(filters.offset))

      const query = params.toString() ? `?${params.toString()}` : ''
      const { data } = await api.get(`/notifications${query}`)
      return data.data
    },
  })
}

// Получение количества непрочитанных уведомлений
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count')
      return data.data.count
    },
  })
}

// Пометить уведомление как прочитанное
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put(`/notifications/${id}/read`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

// Пометить все уведомления как прочитанные
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/notifications/read-all')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

// Удалить уведомление
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/notifications/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}

// Удалить все уведомления
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/notifications')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      })
    },
  })
}
