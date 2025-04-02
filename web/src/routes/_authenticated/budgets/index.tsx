import { BudgetList } from '@/components/budgets/budget-list.tsx'
import { Layout } from '@/components/layout.tsx'
import { SubscriptionRouteGuard } from '@/components/subscription-route-guard.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/budgets/')({
  component: Component,
})

function Component() {
  return (
    <SubscriptionRouteGuard requiredPlan='premium'>
      <Layout links={[{ href: '/budgets', label: 'Бюджеты' }]}>
        <div className='container py-6'>
          <BudgetList />
        </div>
      </Layout>
    </SubscriptionRouteGuard>
  )
}
