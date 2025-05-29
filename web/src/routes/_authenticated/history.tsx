import { useUserHistory } from '@/api/change-logs'
import { ChangeLogTimeline } from '@/components/change-logs/change-log-timeline'
import { Layout } from '@/components/layout'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/history')({
  component: Component,
})

function Component() {
  const [entityType, setEntityType] = useState<string>('')
  const [limit, setLimit] = useState<number>(50)

  const { data, isLoading, refetch, isFetching } = useUserHistory({
    entityType: entityType || undefined,
    limit,
  })

  const handleEntityTypeChange = (value: string) => {
    setEntityType(value === 'all' ? '' : value)
  }

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value))
  }

  return (
    <Layout links={[{ href: '/history', label: 'История изменений' }]}>
      <SubscriptionGuard requiredPlan='premium'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>История изменений</h1>
              <p className='text-muted-foreground'>
                Полная история всех изменений в ваших проектах и инвестициях
              </p>
            </div>
            <Button
              variant='outline'
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              Обновить
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
              <CardDescription>
                Настройте отображение истории изменений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <label className='text-sm font-medium'>Тип сущности</label>
                  <Select
                    value={entityType || 'all'}
                    onValueChange={handleEntityTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Выберите тип' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Все типы</SelectItem>
                      <SelectItem value='project'>Проекты</SelectItem>
                      <SelectItem value='investment'>Инвестиции</SelectItem>
                      <SelectItem value='project_payment'>
                        Платежи по проектам
                      </SelectItem>
                      <SelectItem value='investment_operation'>
                        Операции по инвестициям
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex-1'>
                  <label className='text-sm font-medium'>
                    Количество записей
                  </label>
                  <Select
                    value={limit.toString()}
                    onValueChange={handleLimitChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10'>10 записей</SelectItem>
                      <SelectItem value='25'>25 записей</SelectItem>
                      <SelectItem value='50'>50 записей</SelectItem>
                      <SelectItem value='100'>100 записей</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>История</CardTitle>
              <CardDescription>
                Хронологический список всех изменений
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-3'>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className='h-20 w-full' />
                  ))}
                </div>
              ) : data?.data && data.data.length > 0 ? (
                <ChangeLogTimeline entries={data.data} />
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  <p>История изменений пуста</p>
                  <p className='text-sm'>
                    Создайте или отредактируйте проекты и инвестиции, чтобы
                    увидеть историю
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SubscriptionGuard>
    </Layout>
  )
}
