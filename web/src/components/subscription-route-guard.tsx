import {
  useSubscription,
  type SubscriptionPlan,
} from '@/hooks/use-subscription'
import { Navigate } from '@tanstack/react-router'
import { type ReactNode } from 'react'

interface SubscriptionRouteGuardProps {
  /** Минимальный требуемый план подписки */
  requiredPlan: SubscriptionPlan
  /** Компонент, который будет отображен при наличии доступа */
  children: ReactNode
  /** Путь для перенаправления при отсутствии доступа */
  redirectTo?: string
}

export function SubscriptionRouteGuard({
  requiredPlan,
  children,
  redirectTo = '/subscriptions',
}: SubscriptionRouteGuardProps) {
  const { canAccess, isLoading } = useSubscription()

  // Пока загружаем данные о подписке, ничего не отображаем
  if (isLoading) return null

  // Если у пользователя есть доступ, показываем контент
  if (canAccess(requiredPlan)) {
    return <>{children}</>
  }

  // Перенаправляем на страницу подписок
  return <Navigate to={redirectTo} />
}
