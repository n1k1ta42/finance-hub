import { useRecurringRules } from '@/api/recurring'
import { Layout } from '@/components/layout'
import { RecurringRuleCard } from '@/components/recurring/recurring-rule-card'
import { RecurringRuleForm } from '@/components/recurring/recurring-rule-form'
import { SubscriptionRouteGuard } from '@/components/subscription-route-guard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/recurring')({
  component: Component,
})

function Component() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { data: rules, isLoading, error } = useRecurringRules()

  if (error) {
    return (
      <Layout links={[{ href: '/recurring', label: 'Регулярные платежи' }]}>
        <div className='container py-6'>
          <div className='text-center text-red-500'>
            Ошибка при загрузке регулярных платежей
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <SubscriptionRouteGuard requiredPlan='premium'>
      <Layout links={[{ href: '/recurring', label: 'Регулярные платежи' }]}>
        <div className='container py-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Регулярные платежи
              </h1>
              <p className='text-muted-foreground'>
                Управляйте автоматическими повторяющимися транзакциями
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Создать правило
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Создание регулярного платежа</DialogTitle>
                </DialogHeader>
                <RecurringRuleForm
                  onSuccess={() => setIsCreateDialogOpen(false)}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='space-y-3'>
                  <Skeleton className='h-40 w-full' />
                </div>
              ))}
            </div>
          ) : rules && rules.length > 0 ? (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {rules.map(rule => (
                <RecurringRuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          ) : (
            <div className='py-12 text-center'>
              <div className='bg-muted rounded-lg p-8'>
                <h3 className='mb-2 text-lg font-medium'>
                  У вас пока нет регулярных платежей
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Создайте первое правило для автоматических повторяющихся
                  транзакций
                </p>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      Создать первое правило
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>Создание регулярного платежа</DialogTitle>
                    </DialogHeader>
                    <RecurringRuleForm
                      onSuccess={() => setIsCreateDialogOpen(false)}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </SubscriptionRouteGuard>
  )
}
