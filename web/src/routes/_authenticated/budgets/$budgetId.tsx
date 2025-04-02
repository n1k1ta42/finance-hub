import { useBudget } from '@/api/budgets.ts'
import { BudgetDetails } from '@/components/budgets/budget-details.tsx'
import { Layout } from '@/components/layout.tsx'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/budgets/$budgetId')({
  component: Component,
})

function Component() {
  const { budgetId } = useParams({ from: '/_authenticated/budgets/$budgetId' })
  const id = parseInt(budgetId)

  const { data: budget } = useBudget(id)

  return (
    <Layout
      links={[
        { href: '/budgets', label: 'Бюджеты' },
        { href: `/budgets/${id}`, label: budget?.name || 'Бюджет' },
      ]}
    >
      <div className='container mx-auto max-w-3xl py-6'>
        <BudgetDetails budgetId={id} />
      </div>
    </Layout>
  )
}
