import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  useSubscription,
  type SubscriptionPlan,
} from '@/hooks/use-subscription'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { type ReactNode } from 'react'

interface SubscriptionGuardProps {
  /** Минимальный требуемый план подписки */
  requiredPlan: SubscriptionPlan
  /** Контент, который будет отображен если у пользователя есть доступ */
  children: ReactNode
  /** Сообщение для отображения если нет доступа */
  fallbackMessage?: string
  /** Отображать ли сообщение или полностью скрывать контент */
  showFallback?: boolean
}

export function SubscriptionGuard({
  requiredPlan,
  children,
  fallbackMessage = 'Для доступа к этой функции требуется подписка более высокого уровня',
  showFallback = true,
}: SubscriptionGuardProps) {
  const { canAccess, isLoading } = useSubscription()
  const navigate = useNavigate()

  // Пока загружаем данные о подписке, ничего не отображаем
  if (isLoading) return null

  // Если у пользователя есть доступ, показываем контент
  if (canAccess(requiredPlan)) {
    return <>{children}</>
  }

  // Если у пользователя нет доступа и мы не хотим показывать сообщение, ничего не отображаем
  if (!showFallback) {
    return null
  }

  // Отображаем сообщение о необходимости улучшения подписки
  return (
    <Alert className='mb-4'>
      <AlertTriangle className='h-4 w-4' />
      <AlertTitle>Требуется улучшение подписки</AlertTitle>
      <AlertDescription>
        <div className='mt-2'>{fallbackMessage}</div>
        <Button
          variant='outline'
          size='sm'
          className='mt-2'
          onClick={() => navigate({ to: '/subscriptions' })}
        >
          Улучшить подписку
        </Button>
      </AlertDescription>
    </Alert>
  )
}
