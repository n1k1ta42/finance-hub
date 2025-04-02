import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Payment {
  id: number
  userId: number
  subscriptionId: number
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  transactionId: string
  createdAt: string
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'succeeded'
    | 'canceled'
}

interface PaymentResponse {
  status: string
  data?: Payment
  message?: string
}

interface PaymentListResponse {
  status: string
  data: Payment[]
  message?: string
}

interface PaymentIntentResponse {
  status: string
  data: PaymentIntent
  message?: string
}

// Данные для создания платежа
export interface PaymentData {
  plan: string
  period: string
  paymentMethod?: string
}

// Получение всех платежей пользователя
const getUserPayments = async (): Promise<PaymentListResponse> => {
  const { data } = await api.get('/payments')
  return data
}

// Получение деталей платежа
const getPaymentById = async (id: number): Promise<PaymentResponse> => {
  const { data } = await api.get(`/payments/${id}`)
  return data
}

// Создание платежного намерения (мок)
const createPaymentIntent = async (
  paymentData: PaymentData,
): Promise<PaymentIntentResponse> => {
  // В реальном API здесь был бы запрос к серверу
  // Для мока возвращаем фиктивные данные

  const mockResponse: PaymentIntentResponse = {
    status: 'success',
    data: {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      clientSecret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`,
      amount: 999, // Вместо этого должна быть реальная сумма исходя из плана
      currency: 'RUB',
      status: 'requires_payment_method',
    },
  }

  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500))

  return mockResponse
}

// Обработка платежа (мок)
const processPayment = async (
  paymentData: PaymentData & { paymentIntentId: string },
): Promise<PaymentResponse> => {
  // В реальной имплементации здесь был бы запрос к API для сохранения результата платежа
  const { data } = await api.post('/payments/process', paymentData)
  return data
}

// Хуки для React Query

// Получение платежей пользователя
export const useUserPayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: getUserPayments,
    select: data => data.data,
  })
}

// Получение деталей платежа
export const usePayment = (id: number) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => getPaymentById(id),
    select: data => data.data,
    enabled: !!id,
  })
}

// Создание платежного намерения
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: createPaymentIntent,
  })
}

// Обработка платежа
export const useProcessPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: processPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['userSubscription'] })
    },
  })
}
