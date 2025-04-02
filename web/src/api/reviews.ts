import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Типы для работы с отзывами
export interface Review {
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

export interface CreateReviewDTO {
  rating: number
  comment: string
}

// Получение всех отзывов
const getReviews = async (): Promise<Review[]> => {
  const { data } = await api.get('/reviews')
  return data
}

// Создание нового отзыва
const createReview = async (reviewData: CreateReviewDTO): Promise<Review> => {
  const { data } = await api.post('/reviews', reviewData)
  return data
}

// Удаление отзыва
const deleteReview = async (id: number): Promise<void> => {
  await api.delete(`/reviews/${id}`)
}

// Хук для получения всех отзывов
export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: getReviews,
  })
}

// Хук для создания отзыва
export const useCreateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      // Инвалидируем кэш отзывов после успешного создания
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

// Хук для удаления отзыва
export const useDeleteReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      // Инвалидируем кэш отзывов после успешного удаления
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
