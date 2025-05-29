import { useEntityHistory } from '@/api/change-logs'
import { useCompleteProject, useProject } from '@/api/projects'
import { ChangeLogTimeline } from '@/components/change-logs/change-log-timeline'
import { MetricCard } from '@/components/finance/metric-card'
import { ProgressCard } from '@/components/finance/progress-card'
import { Layout } from '@/components/layout'
import { PaymentDialog } from '@/components/projects/payment-dialog'
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
import { useToast } from '@/components/ui/use-toast'
import { useSubscription } from '@/hooks/use-subscription'
import { formatCurrency } from '@/lib/currency-utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { differenceInDays, format } from 'date-fns'
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  component: Component,
})

function Component() {
  const { projectId } = Route.useParams()
  const { data: project, isLoading } = useProject(parseInt(projectId))
  const { canAccess } = useSubscription()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const completeProjectMutation = useCompleteProject()
  const { toast } = useToast()

  const { data: history, isLoading: isHistoryLoading } = useEntityHistory(
    'project',
    parseInt(projectId),
  )

  if (isLoading) {
    return (
      <Layout
        links={[
          { href: '/projects', label: 'Проекты' },
          { href: `/projects/${projectId}`, label: 'Проект' },
        ]}
      >
        <div className='flex justify-center py-8'>Загрузка...</div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout links={[{ href: '/projects', label: 'Проекты' }]}>
        <div className='py-8 text-center text-red-500'>Проект не найден</div>
      </Layout>
    )
  }

  const progressPercentage =
    project.targetAmount > 0
      ? Math.min((project.currentAmount / project.targetAmount) * 100, 100)
      : 0

  const remainingAmount = Math.max(
    0,
    project.targetAmount - project.currentAmount,
  )

  const getDaysFromStart = () => {
    return differenceInDays(new Date(), new Date(project.startDate))
  }

  const getDaysToEnd = () => {
    if (!project.endDate) return null
    return differenceInDays(new Date(project.endDate), new Date())
  }

  const getMonthlyTarget = () => {
    if (!project.endDate) return 0
    const monthsLeft = Math.max(
      1,
      Math.ceil(
        (new Date(project.endDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24 * 30),
      ),
    )
    return remainingAmount / monthsLeft
  }

  const getProjectStatus = () => {
    if (project.status === 'closed') return 'completed'
    if (project.status === 'archived') return 'archived'
    if (progressPercentage >= 100) return 'achieved'
    if (project.endDate && getDaysToEnd()! < 0) return 'overdue'
    if (project.endDate && getDaysToEnd()! < 30) return 'urgent'
    return 'on_track'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        const projectStatus = getProjectStatus()
        switch (projectStatus) {
          case 'achieved':
            return (
              <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                <CheckCircle className='mr-1 h-3 w-3' />
                Цель достигнута
              </Badge>
            )
          case 'urgent':
            return (
              <Badge variant='destructive'>
                <AlertCircle className='mr-1 h-3 w-3' />
                Срочно
              </Badge>
            )
          case 'overdue':
            return (
              <Badge variant='destructive'>
                <Clock className='mr-1 h-3 w-3' />
                Просрочен
              </Badge>
            )
          default:
            return <Badge variant='default'>Активный</Badge>
        }
      case 'closed':
        return <Badge variant='secondary'>Завершен</Badge>
      case 'archived':
        return <Badge variant='outline'>Архив</Badge>
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'saving':
        return (
          <Badge
            variant='outline'
            className='border-green-200 bg-green-50 text-green-700'
          >
            <Target className='mr-1 h-3 w-3' />
            Накопление
          </Badge>
        )
      case 'loan':
        return (
          <Badge
            variant='outline'
            className='border-red-200 bg-red-50 text-red-700'
          >
            <TrendingUp className='mr-1 h-3 w-3' />
            Кредит
          </Badge>
        )
      default:
        return null
    }
  }

  const handleComplete = async () => {
    try {
      await completeProjectMutation.mutateAsync(parseInt(projectId))
      toast({
        title: 'Проект завершен',
        description: 'Проект успешно помечен как завершенный',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить проект',
        variant: 'destructive',
      })
    }
  }

  return (
    <Layout
      links={[
        { href: '/projects', label: 'Проекты' },
        { href: `/projects/${projectId}`, label: project.name },
      ]}
    >
      <div className='space-y-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>{project.name}</h1>
            <div className='mt-2 flex gap-2'>
              {getStatusBadge(project.status)}
              {getTypeBadge(project.type)}
            </div>
          </div>
          <div className='flex gap-2'>
            {project.status === 'open' && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsPaymentDialogOpen(true)}
              >
                <Plus className='mr-2 h-4 w-4' />
                Добавить платеж
              </Button>
            )}
            {project.status === 'open' && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleComplete}
                disabled={completeProjectMutation.isPending}
              >
                <CheckCircle className='mr-2 h-4 w-4' />
                Завершить
              </Button>
            )}
            <Button asChild>
              <Link to='/projects/edit/$projectId' params={{ projectId }}>
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
                title='Текущая сумма'
                value={formatCurrency(project.currentAmount)}
                subtitle={`из ${formatCurrency(project.targetAmount)}`}
                icon={DollarSign}
              />

              <MetricCard
                title='Прогресс'
                value={`${progressPercentage.toFixed(1)}%`}
                subtitle={
                  progressPercentage >= 100 ? 'Цель достигнута!' : 'выполнено'
                }
                icon={Target}
              />

              <MetricCard
                title='Осталось накопить'
                value={formatCurrency(remainingAmount)}
                subtitle={remainingAmount === 0 ? 'Готово!' : 'до цели'}
                icon={BarChart3}
              />

              <MetricCard
                title={project.endDate ? 'Дней до окончания' : 'Дней в проекте'}
                value={project.endDate ? getDaysToEnd() : getDaysFromStart()}
                subtitle={
                  project.endDate
                    ? getDaysToEnd()! < 0
                      ? 'Просрочен'
                      : 'осталось'
                    : 'активен'
                }
                icon={Calendar}
              />
            </div>

            <ProgressCard
              title='Прогресс достижения цели'
              description={
                project.type === 'saving'
                  ? 'Накопления для достижения цели'
                  : 'Погашение задолженности'
              }
              progress={progressPercentage}
              progressLabel={`${progressPercentage.toFixed(1)}%`}
            />

            {project.endDate && getMonthlyTarget() > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Рекомендуемые накопления</CardTitle>
                  <CardDescription>Для достижения цели в срок</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-blue-600'>
                      {formatCurrency(getMonthlyTarget())}
                    </div>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      в месяц для достижения цели к{' '}
                      {format(new Date(project.endDate), 'dd.MM.yyyy')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
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
                      {format(new Date(project.startDate), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  {project.endDate && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Дата окончания
                      </span>
                      <span>
                        {format(new Date(project.endDate), 'dd.MM.yyyy')}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground text-sm'>
                      Создан
                    </span>
                    <span>
                      {format(new Date(project.createdAt), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  <div className='border-t pt-3'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Дней активен
                      </span>
                      <span className='font-medium'>{getDaysFromStart()}</span>
                    </div>
                  </div>
                  {project.endDate && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Среднемесячные накопления
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(
                          (project.currentAmount / getDaysFromStart()) * 30,
                        )}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Финансовый анализ</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Текущая сумма</span>
                      <span className='text-sm font-medium'>
                        {formatCurrency(project.currentAmount)}
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-blue-500'
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Осталось до цели</span>
                      <span className='text-muted-foreground text-sm font-medium'>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-gray-400'
                        style={{ width: `${100 - progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {project.tags && (
              <Card>
                <CardHeader>
                  <CardTitle>Теги</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {project.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant='outline'>
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.comments && (
              <Card>
                <CardHeader>
                  <CardTitle>Комментарии</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground'>{project.comments}</p>
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
                    Все изменения проекта и связанных операций
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

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        projectId={parseInt(projectId)}
        projectName={project.name}
      />
    </Layout>
  )
}
