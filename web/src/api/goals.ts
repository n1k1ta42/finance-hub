import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Goal {
  id: number
  projectId?: number
  investmentId?: number
  userId: number
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  milestones: Milestone[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: number
  goalId: number
  title: string
  targetAmount: number
  dueDate: string
  isCompleted: boolean
  completedAt?: string
  order: number
}

export interface GoalFormData {
  projectId?: number
  investmentId?: number
  title: string
  description?: string
  targetAmount: number
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  milestones?: {
    title: string
    targetAmount: number
    dueDate: string
  }[]
}

export interface GoalRecommendation {
  dailyTarget: number
  weeklyTarget: number
  monthlyTarget: number
  feasibility: 'achievable' | 'challenging' | 'unrealistic'
  suggestions: string[]
}

// Получение целей проекта
export const useProjectGoals = (projectId: number) => {
  return useQuery({
    queryKey: ['projects', projectId, 'goals'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/goals`)
      return response.data.data as Goal[]
    },
    enabled: !!projectId,
  })
}

// Получение целей инвестиции
export const useInvestmentGoals = (investmentId: number) => {
  return useQuery({
    queryKey: ['investments', investmentId, 'goals'],
    queryFn: async () => {
      const response = await api.get(`/investments/${investmentId}/goals`)
      return response.data.data as Goal[]
    },
    enabled: !!investmentId,
  })
}

// Создание цели
export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: GoalFormData) => {
      const response = await api.post('/goals', data)
      return response.data.data as Goal
    },
    onSuccess: newGoal => {
      if (newGoal.projectId) {
        queryClient.invalidateQueries({
          queryKey: ['projects', newGoal.projectId, 'goals'],
        })
      }
      if (newGoal.investmentId) {
        queryClient.invalidateQueries({
          queryKey: ['investments', newGoal.investmentId, 'goals'],
        })
      }
    },
  })
}

// Получение рекомендаций для достижения цели
export const useGoalRecommendations = (goalId: number) => {
  return useQuery({
    queryKey: ['goals', goalId, 'recommendations'],
    queryFn: async () => {
      const response = await api.get(`/goals/${goalId}/recommendations`)
      return response.data.data as GoalRecommendation
    },
    enabled: !!goalId,
  })
}

// Завершение milestone
export const useCompleteMilestone = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (milestoneId: number) => {
      const response = await api.put(`/milestones/${milestoneId}/complete`)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
