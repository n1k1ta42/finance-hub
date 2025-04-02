import api from '@/lib/api'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface LoginResponse {
  data: {
    user: {
      id: string
      email: string
    }
  }
  message: string
  status: string
}

interface RegisterResponse {
  data: {
    user: {
      id: string
      email: string
    }
  }
  message: string
  status: string
}

interface ForgotPasswordCredentials {
  email: string
}

interface ForgotPasswordResponse {
  status: string
  message: string
}

interface MeResponse {
  status: string
  data?: {
    id: number
    email: string
    firstName: string
    lastName: string
    createdAt: Date
    updatedUt: Date
  }
  message?: string
  error?: string
}

interface ResetPasswordCredentials {
  token: string
  newPassword: string
}

interface ResetPasswordResponse {
  status: string
  message: string
}

const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)

  return data
}

const register = async (
  credentials: RegisterCredentials,
): Promise<RegisterResponse> => {
  const { data } = await api.post<RegisterResponse>(
    '/auth/register',
    credentials,
  )

  return data
}

const getMe = async (): Promise<MeResponse> => {
  const { data } = await api.get('/me')

  return data
}

const forgotPassword = async (
  credentials: ForgotPasswordCredentials,
): Promise<ForgotPasswordResponse> => {
  const { data } = await api.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    credentials,
  )
  return data
}

const resetPassword = async (
  credentials: ResetPasswordCredentials,
): Promise<ResetPasswordResponse> => {
  const { data } = await api.post<ResetPasswordResponse>(
    '/auth/reset-password',
    credentials,
  )
  return data
}

// Новый метод для выхода из системы
const logout = async (): Promise<{ status: string; message: string }> => {
  const { data } = await api.post('/auth/logout')
  return data
}

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      localStorage.setItem('isAuthenticated', 'true')
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      localStorage.setItem('isAuthenticated', 'true')
    },
  })
}

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('isAuthenticated')
      window.location.href = '/login'
    },
  })
}

export const useMe = () => {
  return useSuspenseQuery({
    queryKey: ['me'],
    queryFn: getMe,
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  })
}
