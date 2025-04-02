import { useUserSubscription } from '@/api/user'

// Тип плана подписки
export type SubscriptionPlan = 'basic' | 'premium' | 'pro'

// Хук для работы с подпиской пользователя
export function useSubscription() {
  const { data, isLoading, isError } = useUserSubscription()

  const subscription = data?.subscription

  // Проверяет, имеет ли пользователь активную подписку
  const hasActiveSubscription = !!subscription?.active

  // Текущий план пользователя или null если нет подписки
  const currentPlan = hasActiveSubscription
    ? (subscription?.plan as SubscriptionPlan)
    : null

  // Проверяет, доступна ли функция для текущего плана пользователя
  const canAccess = (requiredPlan: SubscriptionPlan): boolean => {
    if (!hasActiveSubscription) return false

    // Pro план имеет доступ ко всему
    if (currentPlan === 'pro') return true

    // Premium план имеет доступ к Premium и Basic функциям
    if (
      currentPlan === 'premium' &&
      (requiredPlan === 'basic' || requiredPlan === 'premium')
    )
      return true

    // Basic план имеет доступ только к Basic функциям
    return currentPlan === 'basic' && requiredPlan === 'basic'
  }

  return {
    subscription: data?.subscription,
    features: data?.features || [],
    hasActiveSubscription,
    currentPlan,
    canAccess,
    isLoading,
    isError,
  }
}
