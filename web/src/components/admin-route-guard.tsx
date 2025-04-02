import { useUser } from '@/api/user'
import { Navigate } from '@tanstack/react-router'
import { type ReactNode } from 'react'

interface AdminRouteGuardProps {
  /** Компонент, который будет отображен при наличии доступа */
  children: ReactNode
  /** Путь для перенаправления при отсутствии доступа */
  redirectTo?: string
}

export function AdminRouteGuard({
  children,
  redirectTo = '/403',
}: AdminRouteGuardProps) {
  const { data: user, isLoading } = useUser()

  // Пока загружаем данные о пользователе, ничего не отображаем
  if (isLoading) return null

  // Если у пользователя роль администратора, показываем контент
  if (user && user.role === 'admin') {
    return <>{children}</>
  }

  // Перенаправляем на страницу с ошибкой доступа
  return <Navigate to={redirectTo} />
}
