import { useMe } from '@/api/auth'
import { useCategories } from '@/api/categories'
import { useInvestmentsStats } from '@/api/investments'
import { useProjectsStats } from '@/api/projects'
import {
  useBalanceSummary,
  useCategorySummary,
  type CategoryStat,
} from '@/api/stats'
import {
  useCreateTransaction,
  useTransactions,
  type Transaction,
  type TransactionFormData,
} from '@/api/transactions'
import { Layout } from '@/components/layout'
import { TransactionDialog } from '@/components/transactions/transaction-dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useSubscription } from '@/hooks/use-subscription'
import { getCategoryIndicatorClasses } from '@/lib/category-utils'
import { formatCurrency } from '@/lib/currency-utils'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  addDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronDown,
  FolderOpen,
  List,
  ListOrdered,
  Plus,
  RefreshCcw,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

// Тип для данных диаграммы
interface PieChartData {
  name: string
  value: number
  percentage: number
  categoryId: number
  color?: string
}

// Периоды выбора дат
interface DateRange {
  from: Date
  to: Date
}

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: user } = useMe()
  const { canAccess } = useSubscription()
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('list')
  const navigate = useNavigate()

  // Используем текущий месяц как период по умолчанию
  const today = new Date()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  })

  // Функция для форматирования диапазона дат для отображения
  const formatDateRange = (range: DateRange) => {
    return `${format(range.from, 'dd.MM.yyyy')} - ${format(range.to, 'dd.MM.yyyy')}`
  }

  // Функции для быстрого выбора периода
  const selectThisWeek = () => {
    setDateRange({
      from: startOfWeek(today, { locale: ru }),
      to: endOfWeek(today, { locale: ru }),
    })
  }

  const selectThisMonth = () => {
    setDateRange({
      from: startOfMonth(today),
      to: endOfMonth(today),
    })
  }

  const selectThisYear = () => {
    setDateRange({
      from: startOfYear(today),
      to: endOfYear(today),
    })
  }

  const selectLastMonth = () => {
    const lastMonth = subMonths(today, 1)
    setDateRange({
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
    })
  }

  const selectLast30Days = () => {
    setDateRange({
      from: addDays(today, -30),
      to: today,
    })
  }

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalanceSummary({
    startDate: format(dateRange.from, 'yyyy-MM-dd'),
    endDate: format(dateRange.to, 'yyyy-MM-dd'),
  })

  const { data: categories } = useCategories()

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions({
    limit: 5,
    startDate: format(dateRange.from, 'yyyy-MM-dd'),
    endDate: format(dateRange.to, 'yyyy-MM-dd'),
  })

  // Извлекаем данные транзакций из ответа
  const transactions = transactionsData?.data || []

  const { data: categoryStatsData, isLoading: isCategoryStatsLoading } =
    useCategorySummary(
      {
        type: 'expense',
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      },
      {
        enabled: canAccess('premium'),
      },
    )

  const { data: projectsStats, isLoading: isProjectsStatsLoading } =
    useProjectsStats()
  const { data: investmentsStats, isLoading: isInvestmentsStatsLoading } =
    useInvestmentsStats()

  const createTransaction = useCreateTransaction()

  const handleAddTransaction = async (data: TransactionFormData) => {
    return new Promise<void>((resolve, reject) => {
      createTransaction.mutate(data, {
        onSuccess: () => {
          toast({
            title: 'Транзакция создана',
            description: 'Новая транзакция успешно добавлена',
          })
          setIsAddingTransaction(false)
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
          queryClient.invalidateQueries({ queryKey: ['stats'] })
          resolve()
        },
        onError: error => {
          toast({
            title: 'Ошибка',
            description: 'Не удалось создать транзакцию',
            variant: 'destructive',
          })
          reject(error)
        },
      })
    })
  }

  const handleRefresh = () => {
    refetchBalance()
    refetchTransactions()
  }

  // Получение цвета из класса категории
  const extractColorFromClass = (colorClass: string) => {
    const bgColorPattern = /bg-([a-z]+)-(\d+)/
    const match = colorClass.match(bgColorPattern)

    if (match) {
      const colorName = match[1]
      const colorShade = match[2]

      // Таблица соответствия цветов tailwind с hex-кодами
      const tailwindColors: Record<string, Record<string, string>> = {
        blue: {
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
        },
        red: {
          '400': '#f87171',
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c',
        },
        green: {
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
        },
        yellow: {
          '500': '#eab308',
          '600': '#ca8a04',
          '700': '#a16207',
        },
        indigo: {
          '500': '#6366f1',
          '600': '#4f46e5',
          '700': '#4338ca',
        },
        pink: {
          '500': '#ec4899',
          '600': '#db2777',
          '700': '#be185d',
        },
        purple: {
          '400': '#c084fc',
          '500': '#a855f7',
          '600': '#9333ea',
          '700': '#7e22ce',
          '800': '#6b21a8',
          '900': '#581c87',
        },
        violet: {
          '300': '#c4b5fd',
          '400': '#a78bfa',
          '500': '#8b5cf6',
        },
        zinc: {
          '500': '#71717a',
          '600': '#52525b',
          '700': '#3f3f46',
        },
        slate: {
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        },
        gray: {
          '500': '#6b7280',
          '600': '#4b5563',
          '700': '#374151',
        },
        stone: {
          '500': '#78716c',
          '600': '#57534e',
          '700': '#44403c',
        },
        orange: {
          '500': '#f97316',
          '600': '#ea580c',
          '700': '#c2410c',
        },
        amber: {
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
        },
        lime: {
          '500': '#84cc16',
          '600': '#65a30d',
          '700': '#4d7c0f',
        },
        emerald: {
          '300': '#6ee7b7',
          '400': '#34d399',
          '500': '#10b981',
        },
        teal: {
          '400': '#2dd4bf',
          '500': '#14b8a6',
          '600': '#0d9488',
        },
        sky: {
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
        },
        cyan: {
          '500': '#06b6d4',
          '600': '#0891b2',
          '700': '#0e7490',
        },
        fuchsia: {
          '500': '#d946ef',
          '600': '#c026d3',
          '700': '#a21caf',
        },
        rose: {
          '300': '#fda4af',
          '400': '#fb7185',
          '500': '#f43f5e',
        },
      }

      if (tailwindColors[colorName] && tailwindColors[colorName][colorShade]) {
        return tailwindColors[colorName][colorShade]
      }
    }

    // Запасные цвета по умолчанию
    const defaultColors = [
      '#3b82f6',
      '#ef4444',
      '#22c55e',
      '#eab308',
      '#6366f1',
      '#ec4899',
      '#a855f7',
      '#71717a',
      '#f97316',
      '#14b8a6',
    ]

    // Хеш строки для получения стабильного цвета
    const hash = colorClass.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    return defaultColors[Math.abs(hash) % defaultColors.length]
  }

  // Преобразование данных категорий для графика с добавлением цветов
  const pieChartData: PieChartData[] =
    canAccess('premium') && categoryStatsData?.categories && categories
      ? categoryStatsData.categories.map((category: CategoryStat) => {
          // Находим соответствующую категорию, чтобы получить её цвет
          const foundCategory = categories.find(
            c => c.id === category.categoryId,
          )
          const colorClass = foundCategory
            ? getCategoryIndicatorClasses(foundCategory.color)
            : ''
          const color = extractColorFromClass(colorClass)

          return {
            name: category.categoryName,
            value: category.amount,
            percentage: category.percentage,
            categoryId: category.categoryId,
            color: color,
          }
        })
      : []

  // Удаляем сортировку ограничением топ-5 и оставляем только сортировку
  const sortedCategoriesData = pieChartData.sort((a, b) => b.value - a.value)

  // Цвета для графиков
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
  ]

  return (
    <Layout links={[{ href: '/dashboard', label: 'Дашборд' }]}>
      <div className='mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <h1 className='animate-in fade-in-5 text-3xl font-bold tracking-tight transition-all duration-300'>
          Привет, {user?.data?.firstName || 'Пользователь'}!
        </h1>

        <div className='flex flex-wrap items-center gap-2'>
          {/* Кнопки быстрого выбора периода */}
          <div className='mr-2 flex flex-wrap gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={selectLast30Days}
              className='text-xs'
            >
              30 дней
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={selectThisWeek}
              className='text-xs'
            >
              Неделя
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={selectThisMonth}
              className='text-xs'
            >
              Месяц
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={selectLastMonth}
              className='text-xs'
            >
              Прошлый месяц
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={selectThisYear}
              className='text-xs'
            >
              Год
            </Button>
          </div>

          {/* Выбор произвольного периода */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-full justify-start text-left font-normal md:w-auto'
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {formatDateRange(dateRange)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='end'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={selected => {
                  if (selected?.from && selected?.to) {
                    setDateRange({
                      from: selected.from,
                      to: selected.to,
                    })
                  }
                }}
                numberOfMonths={2}
                locale={ru}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant='ghost'
            size='icon'
            onClick={handleRefresh}
            className='transition-all duration-300 hover:rotate-180'
          >
            <RefreshCcw className='h-5 w-5' />
          </Button>
        </div>
      </div>

      {/* Карточки с основной информацией */}
      <div className='animate-in fade-in-10 slide-in-from-bottom-5 grid gap-4 duration-500 md:grid-cols-2 lg:grid-cols-5'>
        <Card className='transition-all duration-200 hover:scale-[1.01] hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Баланс</CardTitle>
            <Wallet className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            {isBalanceLoading ? (
              <Skeleton className='h-8 w-full' />
            ) : (
              <div className='text-2xl font-bold'>
                {formatCurrency(balanceData?.stats?.balance || 0)}
              </div>
            )}
            <p className='text-muted-foreground mt-1 text-xs'>
              За период {formatDateRange(dateRange)}
            </p>
          </CardContent>
        </Card>

        <Card className='transition-all duration-200 hover:scale-[1.01] hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Доходы</CardTitle>
            <ArrowDownCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            {isBalanceLoading ? (
              <Skeleton className='h-8 w-full' />
            ) : (
              <div className='text-2xl font-bold text-green-500'>
                {`+${formatCurrency(balanceData?.stats?.totalIncome || 0)}`}
              </div>
            )}
            <p className='text-muted-foreground mt-1 text-xs'>
              За период {formatDateRange(dateRange)}
            </p>
          </CardContent>
        </Card>

        <Card className='transition-all duration-200 hover:scale-[1.01] hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Расходы</CardTitle>
            <ArrowUpCircle className='h-4 w-4 text-rose-500' />
          </CardHeader>
          <CardContent>
            {isBalanceLoading ? (
              <Skeleton className='h-8 w-full' />
            ) : (
              <div className='text-2xl font-bold text-rose-500'>
                {`-${formatCurrency(balanceData?.stats?.totalExpense || 0)}`}
              </div>
            )}
            <p className='text-muted-foreground mt-1 text-xs'>
              За период {formatDateRange(dateRange)}
            </p>
          </CardContent>
        </Card>

        <Card className='transition-all duration-200 hover:scale-[1.01] hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Проекты</CardTitle>
            <FolderOpen className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            {isProjectsStatsLoading ? (
              <Skeleton className='h-8 w-full' />
            ) : (
              <div className='text-2xl font-bold text-blue-500'>
                {projectsStats?.data?.totalProjects || 0}
              </div>
            )}
            <p className='text-muted-foreground mt-1 text-xs'>
              Активных: {projectsStats?.data?.activeProjects || 0}
            </p>
          </CardContent>
        </Card>

        <Card className='transition-all duration-200 hover:scale-[1.01] hover:shadow-md'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Инвестиции</CardTitle>
            <TrendingUp className='h-4 w-4 text-purple-500' />
          </CardHeader>
          <CardContent>
            {isInvestmentsStatsLoading ? (
              <Skeleton className='h-8 w-full' />
            ) : (
              <div className='text-2xl font-bold text-purple-500'>
                {formatCurrency(investmentsStats?.data?.totalAmount || 0)}
              </div>
            )}
            <p className='text-muted-foreground mt-1 text-xs'>
              Активных: {investmentsStats?.data?.activeInvestments || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрое добавление транзакции и график */}
      <div className='animate-in fade-in-15 slide-in-from-bottom-5 mt-4 grid gap-4 duration-700 md:grid-cols-7'>
        <div className='md:col-span-2'>
          <Card className='h-[350px] transition-all duration-300 hover:shadow-md'>
            <CardHeader>
              <CardTitle>Быстрая транзакция</CardTitle>
              <CardDescription>Добавьте новую транзакцию здесь</CardDescription>
            </CardHeader>
            <CardContent className='flex h-[220px] flex-col items-center justify-center'>
              <Button
                onClick={() => setIsAddingTransaction(true)}
                size='lg'
                className='h-16 w-16 animate-pulse rounded-full transition-all duration-5000 hover:animate-none'
              >
                <Plus className='h-8 w-8' />
              </Button>
              <p className='text-muted-foreground mt-4 text-center text-sm'>
                Нажмите для добавления новой транзакции
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='md:col-span-5'>
          <Card className='h-[350px] transition-all duration-300 hover:shadow-md'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Расходы по категориям</CardTitle>
                  <CardDescription>
                    Распределение расходов за период{' '}
                    {formatDateRange(dateRange)}
                  </CardDescription>
                </div>
                {canAccess('premium') && pieChartData.length > 0 && (
                  <div className='flex space-x-1'>
                    <Button
                      variant={viewMode === 'chart' ? 'default' : 'outline'}
                      size='icon'
                      onClick={() => setViewMode('chart')}
                      className='h-8 w-8'
                      title='Показать диаграмму'
                    >
                      <BarChart3 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size='icon'
                      onClick={() => setViewMode('list')}
                      className='h-8 w-8'
                      title='Показать список'
                    >
                      <List className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className='h-[250px]'>
              {!canAccess('premium') ? (
                <div className='flex h-full flex-col items-center justify-center text-center'>
                  <p className='text-muted-foreground mb-2'>
                    Статистика по категориям доступна только на Premium и Pro
                    тарифах
                  </p>
                  <Button
                    variant='outline'
                    onClick={() =>
                      navigate({
                        to: '/subscriptions',
                      })
                    }
                  >
                    Улучшить подписку
                  </Button>
                </div>
              ) : isCategoryStatsLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Skeleton className='h-[200px] w-[200px] rounded-full' />
                </div>
              ) : pieChartData.length === 0 ? (
                <div className='flex h-full flex-col items-center justify-center text-center'>
                  <p className='text-muted-foreground'>
                    Нет данных за выбранный период
                  </p>
                </div>
              ) : viewMode === 'chart' ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      fill='#8884d8'
                      paddingAngle={1}
                      dataKey='value'
                      animationDuration={1000}
                      animationBegin={100}
                    >
                      {pieChartData.map(
                        (entry: PieChartData, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _name: string, props: any) => [
                        `${formatCurrency(value)} (${props.payload.percentage?.toFixed(1)}%)`,
                        props.payload.name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='h-full overflow-y-auto pr-2'>
                  <h3 className='mb-3 text-sm font-medium'>
                    Все категории расходов
                  </h3>
                  <div className='space-y-3'>
                    {sortedCategoriesData.map((category, index) => (
                      <div
                        key={category.categoryId}
                        className='flex items-center justify-between rounded-md border p-3 transition-all duration-200'
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className='flex h-8 w-8 items-center justify-center rounded-full'
                            style={{
                              backgroundColor:
                                category.color || COLORS[index % COLORS.length],
                            }}
                          >
                            <span className='text-xs font-bold text-white'>
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className='font-medium'>{category.name}</p>
                            <p className='text-muted-foreground text-xs'>
                              {category.percentage.toFixed(1)}% от всех расходов
                            </p>
                          </div>
                        </div>
                        <div className='font-medium text-rose-500'>
                          -{formatCurrency(category.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Последние транзакции */}
      <div className='animate-in fade-in-20 slide-in-from-bottom-5 mt-4 duration-1000'>
        <Card className='transition-all duration-300 hover:shadow-md'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Последние транзакции</CardTitle>
                <CardDescription>
                  За период {formatDateRange(dateRange)}
                </CardDescription>
              </div>
              <Button
                variant='outline'
                className='group'
                onClick={() =>
                  navigate({
                    to: '/transactions',
                  })
                }
              >
                Все транзакции
                <ChevronDown className='ml-2 h-4 w-4 transition-transform group-hover:rotate-180' />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <div className='space-y-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center space-x-4 rounded-md border p-3'
                  >
                    <Skeleton className='h-12 w-12 rounded-full' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-3 w-2/3' />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-center'>
                <ListOrdered className='text-muted-foreground mb-2 h-10 w-10' />
                <p className='text-muted-foreground text-sm'>
                  Нет транзакций за выбранный период
                </p>
                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={() => setIsAddingTransaction(true)}
                >
                  Добавить транзакцию
                </Button>
              </div>
            ) : (
              <div className='space-y-2'>
                {transactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className='hover:bg-accent flex cursor-pointer items-center space-x-4 rounded-md border p-3 transition-all duration-200'
                  >
                    <div
                      className={`rounded-full p-2 ${
                        transaction.category.type === 'income'
                          ? 'bg-green-100'
                          : 'bg-rose-100'
                      }`}
                    >
                      {transaction.category.type === 'income' ? (
                        <ArrowDownCircle className='h-6 w-6 text-green-500' />
                      ) : (
                        <ArrowUpCircle className='h-6 w-6 text-rose-500' />
                      )}
                    </div>
                    <div className='flex-1 space-y-1'>
                      <p className='leading-none font-medium'>
                        {transaction.category.name}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {transaction.description || 'Без описания'} •{' '}
                        {format(new Date(transaction.date), 'dd.MM.yyyy')}
                      </p>
                    </div>
                    <div
                      className={`font-medium ${
                        transaction.category.type === 'income'
                          ? 'text-green-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {transaction.category.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог добавления транзакции */}
      <TransactionDialog
        open={isAddingTransaction}
        onOpenChange={open => setIsAddingTransaction(open)}
        categories={categories || []}
        onSubmit={handleAddTransaction}
        isCreating={createTransaction.isPending}
      />
    </Layout>
  )
}
