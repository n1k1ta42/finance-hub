import { useBudget } from '@/api/budgets.ts'
import { BudgetForm } from '@/components/budgets/budget-form.tsx'
import { Layout } from '@/components/layout.tsx'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/budgets/edit/$budgetId')({
  component: Component,
})

function Component() {
  const { budgetId } = useParams({
    from: '/_authenticated/budgets/edit/$budgetId',
  })
  const id = parseInt(budgetId)

  const { data: budget, isLoading } = useBudget(id)

  return (
    <Layout
      links={[
        { href: '/budgets', label: 'Бюджеты' },
        { href: `/budgets/${id}`, label: budget?.name || 'Бюджет' },
        { href: `/budgets/${id}/edit`, label: 'Редактирование' },
      ]}
    >
      <div className='container mx-auto max-w-3xl py-6'>
        {isLoading ? (
          <div className='flex justify-center py-8'>Загрузка бюджета...</div>
        ) : (
          <BudgetForm budget={budget} isEdit />
        )}
      </div>
    </Layout>
  )
}
