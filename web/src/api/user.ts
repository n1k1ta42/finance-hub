import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  telegramChatId: string
  createdAt: string
  updatedUt: string
}

export interface UpdateUserData {
  firstName: string
  lastName: string
  email: string
  telegramChatId: string
}

export interface UpdateRoleData {
  role: string
}

export interface Subscription {
  id: number
  plan: string
  period: string
  startDate: string
  endDate: string | null
  active: boolean
  price: number
  features: string
}

export interface PlanInfo {
  plan: string
  period: string
  price: number
  description: string
  features: string[]
}

interface UserResponse {
  status: string
  data?: User
  message?: string
}

interface SubscriptionResponse {
  status: string
  data?: {
    subscription: Subscription
    features: string[]
    expired?: boolean
  }
  message?: string
}

interface PlansResponse {
  status: string
  data: PlanInfo[]
}

interface UsersListResponse {
  status: string
  data: User[]
  meta?: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
  message?: string
}

// Получение данных текущего пользователя
const getUser = async (): Promise<UserResponse> => {
  const { data } = await api.get('/me')
  return data
}

// Обновление данных пользователя
const updateUser = async (userData: UpdateUserData): Promise<UserResponse> => {
  const { data } = await api.put('/me', userData)
  return data
}

// Получение текущей активной подписки пользователя
const getUserSubscription = async (): Promise<SubscriptionResponse> => {
  const { data } = await api.get('/subscriptions/current')
  return data
}

// Получение всех доступных планов подписки
const getSubscriptionPlans = async (): Promise<PlansResponse> => {
  const { data } = await api.get('/subscriptions/plans')
  return data
}

// Смена подписки пользователя
const updateSubscription = async (subscriptionData: {
  plan: string
  period: string
}): Promise<SubscriptionResponse> => {
  const { data } = await api.post('/subscriptions/subscribe', subscriptionData)
  return data
}

// Получение списка всех пользователей (только для админов)
const getAllUsers = async (params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<UsersListResponse> => {
  const { data } = await api.get('/admin/users', {
    params,
  })
  return data
}

// Обновление роли пользователя (только для админов)
const updateUserRole = async ({
  userId,
  roleData,
}: {
  userId: number
  roleData: UpdateRoleData
}): Promise<UserResponse> => {
  const { data } = await api.put(`/admin/users/${userId}/role`, roleData)
  return data
}

// Хук для получения данных пользователя
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    select: data => data.data,
  })
}

// Хук для обновления данных пользователя
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

// Хук для получения активной подписки пользователя
export const useUserSubscription = () => {
  return useQuery({
    queryKey: ['userSubscription'],
    queryFn: getUserSubscription,
    select: data => data.data,
  })
}

// Хук для получения всех планов подписки
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans,
    select: data => data.data,
  })
}

// Хук для смены подписки пользователя
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubscription'] })
    },
  })
}

// Хук для получения списка всех пользователей
export const useAllUsers = (params?: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery({
    queryKey: ['allUsers', params],
    queryFn: () => getAllUsers(params),
    select: data => ({
      users: data.data,
      meta: data.meta,
    }),
  })
}

// Хук для обновления роли пользователя
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] })
    },
  })
}
