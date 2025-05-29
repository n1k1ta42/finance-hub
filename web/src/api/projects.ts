import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Project {
  id: number
  userId: number
  name: string
  type: 'saving' | 'loan'
  status: 'open' | 'closed' | 'archived'
  targetAmount: number
  currentAmount: number
  startDate: string
  endDate?: string
  comments: string
  tags: string
  createdAt: string
  updatedAt: string
}

export interface ProjectFormData {
  name: string
  type: 'saving' | 'loan'
  targetAmount: number
  currentAmount?: number
  startDate: string
  endDate?: string
  comments?: string
  tags?: string
}

export interface ProjectPayment {
  id: number
  projectId: number
  userId: number
  amount: number
  date: string
  comment: string
  createdAt: string
  updatedAt: string
}

export interface ProjectPaymentFormData {
  amount: number
  date: string
  comment?: string
}

export interface ProjectAnalytics {
  project: Project
  payments: ProjectPayment[]
  totalPaid: number
  remainingAmount: number
  progressPercentage: number
  monthlyProgress: Array<{
    month: string
    amount: number
    cumulative: number
  }>
}

// Projects API
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/projects')
      return response.data.data as Project[]
    },
  })
}

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await api.get(`/projects/${id}`)
      return response.data.data as Project
    },
    enabled: !!id,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await api.post('/projects', data)
      return response.data.data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProjectFormData }) => {
      const response = await api.put(`/projects/${id}`, data)
      return response.data.data as Project
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
    },
  })
}

export const useArchiveProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/projects/${id}/archive`)
      return response.data.data as Project
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
    },
  })
}

export const useUnarchiveProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/projects/${id}/unarchive`)
      return response.data.data as Project
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
    },
  })
}

export const useCompleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/projects/${id}/complete`)
      return response.data.data as Project
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
    },
  })
}

export const useProjectAnalytics = (id: number) => {
  return useQuery({
    queryKey: ['projects', id, 'analytics'],
    queryFn: async () => {
      const response = await api.get(`/projects/${id}/analytics`)
      return response.data.data as ProjectAnalytics
    },
    enabled: !!id,
  })
}

// Project Payments API
export const useProjectPayments = (projectId: number) => {
  return useQuery({
    queryKey: ['projects', projectId, 'payments'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/payments`)
      return response.data.data as ProjectPayment[]
    },
    enabled: !!projectId,
  })
}

export const useCreateProjectPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: number
      data: ProjectPaymentFormData
    }) => {
      const response = await api.post(`/projects/${projectId}/payments`, data)
      return response.data.data as ProjectPayment
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'payments'],
      })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useDeleteProjectPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      paymentId,
    }: {
      projectId: number
      paymentId: number
    }) => {
      await api.delete(`/projects/${projectId}/payments/${paymentId}`)
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'payments'],
      })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useProjectsStats = () => {
  return useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: async () => {
      const response = await api.get('/projects/stats')
      return response.data
    },
  })
}
