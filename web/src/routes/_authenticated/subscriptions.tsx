import type { PlanInfo } from '@/api/user'
import { useSubscriptionPlans, useUserSubscription } from '@/api/user'
import { Layout } from '@/components/layout.tsx'
import { PaymentDialog } from '@/components/subscriptions/payment-dialog.tsx'
import { PeriodTabs } from '@/components/subscriptions/period-tabs.tsx'
import { PlanCard } from '@/components/subscriptions/plan-card.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createFileRoute } from '@tanstack/react-router'
import { InfoIcon, Loader } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_authenticated/subscriptions')({
  component: Component,
})

function Component() {
  const { data: plans, isLoading: isPlansLoading } = useSubscriptionPlans()

  const { data: subscriptionData, isLoading: isSubscriptionLoading } =
    useUserSubscription()

  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  // Фильтрация планов по выбранному периоду
  const filteredPlans = useMemo(() => {
    if (!plans) return []
    return plans.filter(plan => plan.period === selectedPeriod)
  }, [plans, selectedPeriod])

  // Обработчик выбора плана
  const handleSelectPlan = (plan: PlanInfo) => {
    setSelectedPlan(plan)
    setIsPaymentDialogOpen(true)
  }

  const isLoading = isPlansLoading || isSubscriptionLoading

  return (
    <Layout links={[{ href: '/subscriptions', label: 'Подписка' }]}>
      <div className='container py-6'>
        <h1 className='mb-4 text-3xl font-bold tracking-tight'>Подписка</h1>

        <Alert className='mb-6 border-blue-200 bg-blue-50'>
          <InfoIcon className='h-4 w-4 text-blue-600' />
          <AlertTitle className='text-blue-800'>Тестовый режим</AlertTitle>
          <AlertDescription className='text-blue-700'>
            <strong>Важно</strong> В настоящий момент функционал подписок
            работает в тестовом режиме. Вы можете протестировать любой план без
            реального списания средств. В будущем мы планируем запустить
            полноценную систему платных подписок для финансирования проекта без
            рекламы.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader className='h-8 w-8 animate-spin' />
          </div>
        ) : (
          <>
            <div className='mb-8'>
              <h2 className='mb-4 text-center text-xl font-semibold'>
                Выберите период оплаты
              </h2>
              <PeriodTabs value={selectedPeriod} onChange={setSelectedPeriod} />
            </div>

            <div className='grid gap-6 md:grid-cols-3'>
              {filteredPlans
                .sort((a, b) => a.price - b.price)
                .map(plan => (
                  <PlanCard
                    key={`${plan.plan}-${plan.period}`}
                    plan={plan}
                    isCurrent={
                      subscriptionData?.subscription?.plan === plan.plan &&
                      subscriptionData?.subscription?.period === plan.period
                    }
                    isExpired={
                      subscriptionData?.expired ||
                      subscriptionData?.subscription?.active === false
                    }
                    onSelect={handleSelectPlan}
                  />
                ))}
            </div>

            <div className='bg-muted mt-6 rounded-lg p-4'>
              <h3 className='mb-2 font-medium'>Информация о подписках:</h3>
              <ul className='text-muted-foreground list-inside list-disc space-y-1 text-sm'>
                <li>
                  Базовая подписка включает основные функции для учёта финансов
                </li>
                <li>
                  Премиум подписка добавляет расширенную статистику,
                  бюджетирование и регулярные платежи
                </li>
                <li>
                  Профессиональная подписка включает все функции без ограничений
                </li>
                <li>
                  Годовая подписка дает скидку 20% по сравнению с ежемесячной
                </li>
                <li>
                  Подписка "Навсегда" - единоразовый платеж без необходимости
                  продления
                </li>
              </ul>
            </div>

            <PaymentDialog
              isOpen={isPaymentDialogOpen}
              onClose={() => setIsPaymentDialogOpen(false)}
              selectedPlan={selectedPlan}
            />
          </>
        )}
      </div>
    </Layout>
  )
}
