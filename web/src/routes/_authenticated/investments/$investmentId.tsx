import { useEntityHistory } from '@/api/change-logs'
import { useInvestment } from '@/api/investments'
import { ChangeLogTimeline } from '@/components/change-logs/change-log-timeline'
import { MetricCard } from '@/components/finance/metric-card'
import { ProgressCard } from '@/components/finance/progress-card'
import { OperationDialog } from '@/components/investments/operation-dialog'
import { Layout } from '@/components/layout.tsx'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSubscription } from '@/hooks/use-subscription'
import { formatCurrency } from '@/lib/currency-utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  BarChart3,
  Building,
  Calendar,
  DollarSign,
  Edit,
  Landmark,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
  '/_authenticated/investments/$investmentId',
)({
  component: Component,
})

function Component() {
  const { investmentId } = Route.useParams()
  const { data: investment, isLoading } = useInvestment(parseInt(investmentId))
  const { canAccess } = useSubscription()
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false)

  const { data: history, isLoading: isHistoryLoading } = useEntityHistory(
    'investment',
    parseInt(investmentId),
  )

  if (isLoading) {
    return (
      <Layout
        links={[
          { href: '/investments', label: 'Инвестиции' },
          { href: `/investments/${investmentId}`, label: 'Инвестиция' },
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

  const currentValue = investment.amount + investment.capitalization
  const profitLoss =
    ((currentValue - investment.amount) / investment.amount) * 100

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant='default'>Активная</Badge>
      case 'closed':
        return <Badge variant='secondary'>Завершена</Badge>
      case 'archived':
        return <Badge variant='outline'>Архив</Badge>
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return (
          <Badge
            variant='outline'
            className='border-blue-200 bg-blue-50 text-blue-700'
          >
            <Landmark className='mr-1 h-3 w-3' />
            Депозит
          </Badge>
        )
      case 'security':
        return (
          <Badge
            variant='outline'
            className='border-green-200 bg-green-50 text-green-700'
          >
            <TrendingUp className='mr-1 h-3 w-3' />
            Ценные бумаги
          </Badge>
        )
      case 'realty':
        return (
          <Badge
            variant='outline'
            className='border-orange-200 bg-orange-50 text-orange-700'
          >
            <Building className='mr-1 h-3 w-3' />
            Недвижимость
          </Badge>
        )
      default:
        return null
    }
  }

  const getDaysInvested = () => {
    const start = new Date(investment.startDate)
    const end = investment.endDate ? new Date(investment.endDate) : new Date()
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getAnnualizedReturn = () => {
    const days = getDaysInvested()
    if (days === 0) return 0
    const years = days / 365
    return Math.pow(currentValue / investment.amount, 1 / years) - 1
  }

  return (
    <Layout
      links={[
        { href: '/investments', label: 'Инвестиции' },
        { href: `/investments/${investmentId}`, label: investment.name },
      ]}
    >
      <div className='space-y-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{investment.name}</h1>
            <div className='mt-2 flex gap-2'>
              {getStatusBadge(investment.status)}
              {getTypeBadge(investment.type)}
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsOperationDialogOpen(true)}
            >
              <Plus className='mr-2 h-4 w-4' />
              Добавить операцию
            </Button>
            <Button asChild>
              <Link
                to='/investments/edit/$investmentId'
                params={{ investmentId }}
              >
                <Edit className='mr-2 h-4 w-4' />
                Редактировать
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='overview'>Обзор</TabsTrigger>
            <TabsTrigger value='analytics'>Аналитика</TabsTrigger>
            {canAccess('premium') ? (
              <TabsTrigger value='history'>История</TabsTrigger>
            ) : (
              <TabsTrigger value='history' disabled>
                История
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <MetricCard
                title='Текущая стоимость'
                value={formatCurrency(currentValue)}
                subtitle={`Начальная: ${formatCurrency(investment.amount)}`}
                icon={DollarSign}
              />

              <MetricCard
                title='Прибыль/Убыток'
                value={
                  <span
                    className={
                      profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {profitLoss >= 0 ? '+' : ''}
                    {profitLoss.toFixed(2)}%
                  </span>
                }
                subtitle={
                  <span
                    className={
                      profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {profitLoss >= 0 ? '+' : ''}
                    {formatCurrency(investment.capitalization)}
                  </span>
                }
                icon={profitLoss >= 0 ? TrendingUp : TrendingDown}
              />

              <MetricCard
                title='Дней в инвестиции'
                value={getDaysInvested()}
                subtitle={`С ${format(
                  new Date(investment.startDate),
                  'dd.MM.yyyy',
                )}`}
                icon={Calendar}
              />

              <MetricCard
                title='Годовая доходность'
                value={
                  <span
                    className={
                      getAnnualizedReturn() >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {getAnnualizedReturn() >= 0 ? '+' : ''}
                    {(getAnnualizedReturn() * 100).toFixed(1)}%
                  </span>
                }
                subtitle='Аннуализированная'
                icon={BarChart3}
              />
            </div>

            <ProgressCard
              title='Прогресс доходности'
              description='Отношение текущей прибыли к начальной инвестиции'
              progress={Math.max(0, Math.min(profitLoss, 100))}
              progressLabel={`${profitLoss.toFixed(2)}%`}
              showMarkers
            />
          </TabsContent>

          <TabsContent value='analytics' className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Детальная информация</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground text-sm'>
                      Дата начала
                    </span>
                    <span>
                      {format(new Date(investment.startDate), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  {investment.endDate && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Дата окончания
                      </span>
                      <span>
                        {format(new Date(investment.endDate), 'dd.MM.yyyy')}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground text-sm'>
                      Создана
                    </span>
                    <span>
                      {format(new Date(investment.createdAt), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  <div className='border-t pt-3'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Среднемесячная доходность
                      </span>
                      <span className='font-medium'>
                        {((getAnnualizedReturn() * 100) / 12).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Распределение</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Основная сумма</span>
                      <span className='text-sm font-medium'>
                        {formatCurrency(investment.amount)}
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-500'
                        style={{
                          width: `${(investment.amount / currentValue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Капитализация</span>
                      <span
                        className={`text-sm font-medium ${
                          investment.capitalization >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(investment.capitalization)}
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className={`h-2 rounded-full ${
                          investment.capitalization >= 0
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.abs(
                            (investment.capitalization / currentValue) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {investment.tags && (
              <Card>
                <CardHeader>
                  <CardTitle>Теги</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {investment.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant='outline'>
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {investment.comments && (
              <Card>
                <CardHeader>
                  <CardTitle>Комментарии</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground'>{investment.comments}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='history' className='space-y-4'>
            <SubscriptionGuard requiredPlan='premium'>
              <Card>
                <CardHeader>
                  <CardTitle>История изменений</CardTitle>
                  <CardDescription>
                    Все изменения инвестиции и связанных операций
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isHistoryLoading ? (
                    <div className='space-y-3'>
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className='h-20 w-full' />
                      ))}
                    </div>
                  ) : (
                    <ChangeLogTimeline entries={history || []} />
                  )}
                </CardContent>
              </Card>
            </SubscriptionGuard>
          </TabsContent>
        </Tabs>
      </div>

      <OperationDialog
        isOpen={isOperationDialogOpen}
        onClose={() => setIsOperationDialogOpen(false)}
        investmentId={parseInt(investmentId)}
        investmentName={investment.name}
      />
    </Layout>
  )
}
