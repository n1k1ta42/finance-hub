import type { Budget } from '@/api/budgets'
import { useBudgets } from '@/api/budgets'
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
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/currency-utils'
import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

export function BudgetList() {
  const [filter, setFilter] = useState<string>('all')
  const { data: budgets = [], isLoading, error } = useBudgets()

  if (isLoading) {
    return <div className='flex justify-center py-8'>Загрузка бюджетов...</div>
  }

  if (error) {
    return <div className='py-4 text-red-500'>Ошибка при загрузке бюджетов</div>
  }

  const filteredBudgets = budgets.filter((budget: Budget) => {
    if (filter === 'all') return true
    return budget.period === filter
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Бюджеты</h2>
        <Button asChild>
          <Link to='/budgets/new'>
            <PlusIcon className='mr-2 h-4 w-4' />
            Новый бюджет
          </Link>
        </Button>
      </div>

      <Tabs defaultValue='all' onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value='all'>Все</TabsTrigger>
          <TabsTrigger value='monthly'>Месячные</TabsTrigger>
          <TabsTrigger value='weekly'>Недельные</TabsTrigger>
          <TabsTrigger value='yearly'>Годовые</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredBudgets.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground mb-4'>Бюджеты не найдены</p>
          <Button asChild>
            <Link to='/budgets/new'>Создать бюджет</Link>
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredBudgets.map((budget: Budget) => (
            <Link
              key={budget.id}
              from='/budgets'
              to='/budgets/$budgetId'
              params={{ budgetId: String(budget.id) }}
              preload='intent'
            >
              <Card className='hover:bg-muted/50 h-full transition-colors'>
                <CardHeader className='pb-2'>
                  <div className='flex items-start justify-between'>
                    <CardTitle className='truncate'>{budget.name}</CardTitle>
                    <Badge variant={getBudgetPeriodVariant(budget.period)}>
                      {formatPeriod(budget.period)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(budget.startDate).toLocaleDateString()} -{' '}
                    {new Date(budget.endDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='mb-2 flex justify-between'>
                    <span>Потрачено</span>
                    <span className='font-medium'>
                      {formatCurrency(budget.spent)} /{' '}
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <Progress value={(budget.spent / budget.amount) * 100} />
                </CardContent>
                <CardFooter>
                  {budget.category && (
                    <Badge
                      variant='outline'
                      style={{ backgroundColor: `${budget.category.color}20` }}
                    >
                      {budget.category.name}
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function getBudgetPeriodVariant(period: string) {
  switch (period) {
    case 'monthly':
      return 'default'
    case 'weekly':
      return 'secondary'
    case 'yearly':
      return 'outline'
    default:
      return 'default'
  }
}

function formatPeriod(period: string) {
  switch (period) {
    case 'monthly':
      return 'Месячный'
    case 'weekly':
      return 'Недельный'
    case 'yearly':
      return 'Годовой'
    default:
      return period
  }
}
