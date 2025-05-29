import { useCreateInvestment } from '@/api/investments'
import { InvestmentForm } from '@/components/investments/investment-form'
import { Layout } from '@/components/layout.tsx'
import { useToast } from '@/components/ui/use-toast'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/investments/new')({
  component: Component,
})

function Component() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createInvestmentMutation = useCreateInvestment()

  const handleSubmit = async (data: any) => {
    try {
      await createInvestmentMutation.mutateAsync(data)
      toast({
        title: 'Инвестиция создана',
        description: 'Инвестиция успешно создана',
      })
      navigate({ to: '/investments' })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать инвестицию',
        variant: 'destructive',
      })
    }
  }

  return (
    <Layout
      links={[
        { href: '/investments', label: 'Инвестиции' },
        { href: '/investments/new', label: 'Создать инвестицию' },
      ]}
    >
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-6 text-3xl font-bold'>Создать инвестицию</h1>
        <InvestmentForm
          onSubmit={handleSubmit}
          isSubmitting={createInvestmentMutation.isPending}
        />
      </div>
    </Layout>
  )
}
