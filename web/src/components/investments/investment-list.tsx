import {
  useArchiveInvestment,
  useCompleteInvestment,
  useInvestments,
  useUnarchiveInvestment,
  type Investment,
} from '@/api/investments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/currency-utils'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  Archive,
  ArchiveRestore,
  Building,
  CheckCircle,
  Edit,
  Eye,
  Landmark,
  PlusIcon,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

export function InvestmentList() {
  const [filter, setFilter] = useState<string>('all')
  const { data: investments = [], isLoading, error } = useInvestments()
  const archiveInvestmentMutation = useArchiveInvestment()
  const unarchiveInvestmentMutation = useUnarchiveInvestment()
  const completeInvestmentMutation = useCompleteInvestment()
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>Загрузка инвестиций...</div>
    )
  }

  if (error) {
    return (
      <div className='py-4 text-red-500'>Ошибка при загрузке инвестиций</div>
    )
  }

  const filteredInvestments = investments.filter((investment: Investment) => {
    if (filter === 'all') return true
    if (filter === 'active') return investment.status === 'open'
    if (filter === 'completed') return investment.status === 'closed'
    if (filter === 'archived') return investment.status === 'archived'
    return investment.type === filter
  })

  const handleArchive = async (id: number) => {
    try {
      await archiveInvestmentMutation.mutateAsync(id)
      toast({
        title: 'Инвестиция архивирована',
        description: 'Инвестиция успешно перемещена в архив',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось архивировать инвестицию',
        variant: 'destructive',
      })
    }
  }

  const handleUnarchive = async (id: number) => {
    try {
      await unarchiveInvestmentMutation.mutateAsync(id)
      toast({
        title: 'Инвестиция разархивирована',
        description: 'Инвестиция успешно восстановлена из архива',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось разархивировать инвестицию',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await completeInvestmentMutation.mutateAsync(id)
      toast({
        title: 'Инвестиция завершена',
        description: 'Инвестиция успешно помечена как завершенная',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить инвестицию',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: Investment['status']) => {
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

  const getTypeBadge = (type: Investment['type']) => {
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

  const calculateCurrentValue = (amount: number, capitalization: number) => {
    return amount + capitalization
  }

  const calculateProfitLoss = (amount: number, capitalization: number) => {
    const currentValue = calculateCurrentValue(amount, capitalization)
    return ((currentValue - amount) / amount) * 100
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Инвестиции</h1>
        <Button asChild>
          <Link to='/investments/new'>
            <PlusIcon className='mr-2 h-4 w-4' />
            Создать инвестицию
          </Link>
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className='w-full'>
        <TabsList className='grid w-full grid-cols-7'>
          <TabsTrigger value='all'>Все</TabsTrigger>
          <TabsTrigger value='active'>Активные</TabsTrigger>
          <TabsTrigger value='completed'>Завершенные</TabsTrigger>
          <TabsTrigger value='archived'>Архив</TabsTrigger>
          <TabsTrigger value='deposit'>Депозиты</TabsTrigger>
          <TabsTrigger value='security'>Ценные бумаги</TabsTrigger>
          <TabsTrigger value='realty'>Недвижимость</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredInvestments.length === 0 ? (
        <div className='py-12 text-center'>
          <div className='text-muted-foreground mb-4'>
            {filter === 'all'
              ? 'У вас пока нет инвестиций'
              : 'Нет инвестиций в данной категории'}
          </div>
          <Button asChild>
            <Link to='/investments/new'>Создать первую инвестицию</Link>
          </Button>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredInvestments.map((investment: Investment) => {
            const currentValue = calculateCurrentValue(
              investment.amount,
              investment.capitalization,
            )
            const profitLoss = calculateProfitLoss(
              investment.amount,
              investment.capitalization,
            )

            return (
              <Card
                key={investment.id}
                className='transition-shadow hover:shadow-md'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-lg'>
                        {investment.name}
                      </CardTitle>
                      <CardDescription>
                        Начата{' '}
                        {format(new Date(investment.startDate), 'dd.MM.yyyy')}
                        {investment.endDate &&
                          ` • До ${format(new Date(investment.endDate), 'dd.MM.yyyy')}`}
                      </CardDescription>
                    </div>
                    <div className='flex gap-1'>
                      {getStatusBadge(investment.status)}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    {getTypeBadge(investment.type)}
                  </div>
                </CardHeader>

                <CardContent className='flex-1 space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Текущая стоимость
                      </span>
                      <span className='text-lg font-bold'>
                        {formatCurrency(currentValue)}
                      </span>
                    </div>
                    <div className='text-muted-foreground flex justify-between text-sm'>
                      <span>Начальная сумма</span>
                      <span>{formatCurrency(investment.amount)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span>Прибыль/Убыток</span>
                      <span
                        className={
                          profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {profitLoss >= 0 ? '+' : ''}
                        {profitLoss.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {investment.tags && (
                    <div className='flex flex-wrap gap-1'>
                      {investment.tags.split(',').map((tag, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs'
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {investment.comments && (
                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {investment.comments}
                    </p>
                  )}
                </CardContent>

                <CardFooter className='flex gap-2 pt-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    asChild
                    className='flex-1'
                  >
                    <Link
                      to='/investments/$investmentId'
                      params={{ investmentId: investment.id.toString() }}
                    >
                      <Eye className='mr-1 h-3 w-3' />
                      Просмотр
                    </Link>
                  </Button>
                  <Button variant='outline' size='sm' asChild>
                    <Link
                      to='/investments/edit/$investmentId'
                      params={{ investmentId: investment.id.toString() }}
                    >
                      <Edit className='mr-1 h-3 w-3' />
                      Изменить
                    </Link>
                  </Button>
                  {investment.status === 'open' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleComplete(investment.id)}
                      disabled={completeInvestmentMutation.isPending}
                    >
                      <CheckCircle className='h-3 w-3' />
                    </Button>
                  )}
                  {investment.status === 'open' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleArchive(investment.id)}
                      disabled={archiveInvestmentMutation.isPending}
                    >
                      <Archive className='h-3 w-3' />
                    </Button>
                  )}
                  {investment.status === 'archived' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleUnarchive(investment.id)}
                      disabled={unarchiveInvestmentMutation.isPending}
                    >
                      <ArchiveRestore className='h-3 w-3' />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
