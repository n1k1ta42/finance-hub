import { useInvestment, useUpdateInvestment } from '@/api/investments'
import { InvestmentForm } from '@/components/investments/investment-form'
import { Layout } from '@/components/layout.tsx'
import { useToast } from '@/components/ui/use-toast'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/investments/edit/$investmentId',
)({
  component: Component,
})

function Component() {
  const { investmentId } = Route.useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: investment, isLoading } = useInvestment(parseInt(investmentId))
  const updateInvestmentMutation = useUpdateInvestment()

  const handleSubmit = async (data: any) => {
    try {
      await updateInvestmentMutation.mutateAsync({
        id: parseInt(investmentId),
        data,
      })
      toast({
        title: 'Инвестиция обновлена',
        description: 'Инвестиция успешно обновлена',
      })
      navigate({ to: '/investments/$investmentId', params: { investmentId } })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить инвестицию',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Layout
        links={[
          { href: '/investments', label: 'Инвестиции' },
          { href: `/investments/${investmentId}`, label: 'Инвестиция' },
          {
            href: `/investments/edit/${investmentId}`,
            label: 'Редактирование',
          },
        ]}
      >
        <div className='flex justify-center py-8'>Загрузка...</div>
      </Layout>
    )
  }

  if (!investment) {
    return (
      <Layout links={[{ href: '/investments', label: 'Инвестиции' }]}>
        <div className='py-8 text-center text-red-500'>
          Инвестиция не найдена
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      links={[
        { href: '/investments', label: 'Инвестиции' },
        { href: `/investments/${investmentId}`, label: investment.name },
        { href: `/investments/edit/${investmentId}`, label: 'Редактирование' },
      ]}
    >
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-6 text-3xl font-bold'>Редактировать инвестицию</h1>
        <InvestmentForm
          investment={investment}
          onSubmit={handleSubmit}
          isSubmitting={updateInvestmentMutation.isPending}
        />
      </div>
    </Layout>
  )
}
