import { BudgetForm } from '@/components/budgets/budget-form.tsx'
import { Layout } from '@/components/layout.tsx'
import { SubscriptionRouteGuard } from '@/components/subscription-route-guard.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/budgets/new')({
  component: Component,
})

function Component() {
  return (
    <SubscriptionRouteGuard requiredPlan='premium'>
      <Layout
        links={[
          { href: '/budgets', label: 'Бюджеты' },
          { href: '/budgets/new', label: 'Новый бюджет' },
        ]}
      >
        <div className='container py-6'>
          <BudgetForm />
        </div>
      </Layout>
    </SubscriptionRouteGuard>
  )
}
