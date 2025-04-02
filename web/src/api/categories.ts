import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Category {
  id: number
  name: string
  description: string
  type: 'expense' | 'income'
  color: string
  icon: string
  createdAt: string
  updatedAt: string
}

export interface CategoryFormData {
  name: string
  description: string
  type: 'expense' | 'income'
  color: string
  icon: string
}

interface CategoryResponse {
  status: string
  data: Category
  message?: string
}

interface CategoriesResponse {
  status: string
  data: Category[]
  message?: string
}

// Базовые функции для работы с API

const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    const response = await api.get(`/categories`)
    return response.data
  } catch (error) {
    console.error('Ошибка при получении категорий:', error)
    throw error
  }
}

const getCategoryById = async (id: number): Promise<CategoryResponse> => {
  try {
    const response = await api.get(`/categories/${id}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при получении категории с ID ${id}:`, error)
    throw error
  }
}

const createCategory = async (
  data: CategoryFormData,
): Promise<CategoryResponse> => {
  try {
    const response = await api.post(`/categories`, data)
    return response.data
  } catch (error) {
    console.error('Ошибка при создании категории:', error)
    throw error
  }
}

const updateCategory = async (
  id: number,
  data: CategoryFormData,
): Promise<CategoryResponse> => {
  try {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Ошибка при обновлении категории с ID ${id}:`, error)
    throw error
  }
}

const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`)
  } catch (error) {
    console.error(`Ошибка при удалении категории с ID ${id}:`, error)
    throw error
  }
}

// React Query хуки

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: data => data.data,
  })
}

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id),
    select: data => data.data,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
