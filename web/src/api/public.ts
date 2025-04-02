import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

// Создаем отдельный экземпляр axios для публичных запросов без авторизации
const publicApi = axios.create({
  baseURL:
    (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/public',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерфейсы для типизации данных
interface Feature {
  title: string
  description: string
}

interface SubscriptionPlan {
  plan: string
  period: string
  price: number
  description: string
  features: string[]
}

interface AppInfo {
  name: string
  description: string
  tagline: string
  contacts: {
    telegram: string
  }
}

// Интерфейс для отзывов
interface Review {
  id: number
  user: {
    id: number
    firstName: string
    email: string
  }
  rating: number
  comment: string
  createdAt: string
}

interface FeaturesResponse {
  features: Feature[]
}

// Функции для работы с API

/**
 * Получение информации о функциях приложения
 */
const getFeatures = async (): Promise<FeaturesResponse> => {
  const { data } = await publicApi.get<FeaturesResponse>('/features')
  return data
}

/**
 * Получение информации о планах подписок
 */
const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data } = await publicApi.get<SubscriptionPlan[]>(
    '/subscriptions/plans',
  )
  return data
}

/**
 * Получение общей информации о приложении
 */
const getAppInfo = async (): Promise<AppInfo> => {
  const { data } = await publicApi.get<AppInfo>('/info')
  return data
}

/**
 * Получение последних отзывов пользователей
 */
const getLatestReviews = async (limit: number = 5): Promise<Review[]> => {
  const { data } = await publicApi.get<Review[]>(
    `/reviews/latest?limit=${limit}`,
  )
  return data
}

// React Query хуки для использования в компонентах

/**
 * Хук для получения функций приложения
 */
export const useFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: getFeatures,
    select: data => data.features,
    staleTime: 1000 * 60 * 60, // Кэшируем на 1 час
  })
}

/**
 * Хук для получения планов подписок
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans,
    staleTime: 1000 * 60 * 60, // Кэшируем на 1 час
  })
}

/**
 * Хук для получения общей информации о приложении
 */
export const useAppInfo = () => {
  return useQuery({
    queryKey: ['appInfo'],
    queryFn: getAppInfo,
    staleTime: 1000 * 60 * 60, // Кэшируем на 1 час
  })
}

/**
 * Хук для получения последних отзывов
 */
export const useLatestReviews = (limit: number = 5) => {
  return useQuery({
    queryKey: ['latestReviews', limit],
    queryFn: () => getLatestReviews(limit),
    staleTime: 1000 * 60 * 15, // Кэшируем на 15 минут
  })
}
