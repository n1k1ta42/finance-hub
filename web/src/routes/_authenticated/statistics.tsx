import { useCategories } from '@/api/categories'
import {
  exportStatsToPDF,
  useBalanceDynamics,
  useBalanceSummary,
  useCategorySummary,
  type CategoryStat,
} from '@/api/stats'
import { Layout } from '@/components/layout'
import { SubscriptionRouteGuard } from '@/components/subscription-route-guard.tsx'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSubscription } from '@/hooks/use-subscription'
import { getCategoryIndicatorClasses } from '@/lib/category-utils'
import { formatCurrency } from '@/lib/currency-utils'
import { createFileRoute } from '@tanstack/react-router'
import {
  addDays,
  differenceInDays,
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
import { CalendarIcon, Download, RefreshCw } from 'lucide-react'
import React, { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Периоды выбора дат
interface DateRange {
  from: Date
  to: Date
}

// Тип для данных диаграммы
interface PieChartData {
  name: string
  value: number
  percentage: number
  categoryId: number
  color?: string
}

export const Route = createFileRoute('/_authenticated/statistics')({
  component: Component,
})

function Component() {
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

  // Запрос на получение данных о балансе
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useBalanceSummary({
    startDate: format(dateRange.from, 'yyyy-MM-dd'),
    endDate: format(dateRange.to, 'yyyy-MM-dd'),
  })

  // Запрос на получение данных о динамике баланса
  const { data: dynamicsData, isLoading: isDynamicsLoading } =
    useBalanceDynamics({
      startDate: format(dateRange.from, 'yyyy-MM-dd'),
      endDate: format(dateRange.to, 'yyyy-MM-dd'),
    })

  // Запрос на получение данных о расходах по категориям
  const {
    data: expenseCategoryData,
    isLoading: isExpenseCategoryStatsLoading,
  } = useCategorySummary({
    type: 'expense',
    startDate: format(dateRange.from, 'yyyy-MM-dd'),
    endDate: format(dateRange.to, 'yyyy-MM-dd'),
  })

  // Запрос на получение данных о доходах по категориям
  const { data: incomeCategoryData, isLoading: isIncomeCategoryStatsLoading } =
    useCategorySummary({
      type: 'income',
      startDate: format(dateRange.from, 'yyyy-MM-dd'),
      endDate: format(dateRange.to, 'yyyy-MM-dd'),
    })

  const handleRefresh = () => {
    refetchBalance()
  }

  // Цвета для графиков
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
  ]

  // Получение категорий для определения цветов
  const { data: categories } = useCategories()

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

  // Преобразование данных категорий для графика расходов
  const expensePieChartData =
    expenseCategoryData?.categories && categories
      ? expenseCategoryData.categories.map((category: CategoryStat) => {
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

  // Преобразование данных категорий для графика доходов
  const incomePieChartData =
    incomeCategoryData?.categories && categories
      ? incomeCategoryData.categories.map((category: CategoryStat) => {
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

  // Переменная состояния для переключения между типами графиков
  const [chartType, setChartType] = useState<'bar' | 'pie'>('pie')

  // Используем хук подписки для проверки доступа к экспорту PDF
  const { canAccess } = useSubscription()

  // Преобразование данных динамики для графика
  const dynamicsChartData = React.useMemo(() => {
    return dynamicsData?.dynamics || []
  }, [dynamicsData])

  // Функция для форматирования даты на оси X
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr)

    // Получаем разницу в днях между начальной и конечной датой
    const daysDifference = differenceInDays(dateRange.to, dateRange.from)

    // Если период меньше дня (часы), отображаем часы
    if (daysDifference < 1) {
      return format(date, 'HH:mm')
    }
    // Если период меньше недели, отображаем день и месяц
    else if (daysDifference < 7) {
      return format(date, 'dd.MM')
    }
    // Если период меньше месяца, отображаем день месяца
    else if (daysDifference < 31) {
      return format(date, 'dd')
    }
    // Для более длительных периодов показываем месяц и год
    else {
      return format(date, 'MM.yy')
    }
  }

  // Функция для экспорта статистики в PDF
  const handleExportPDF = async () => {
    try {
      const pdfBlob = await exportStatsToPDF({
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      })

      // Создаем URL для скачивания
      const url = URL.createObjectURL(pdfBlob)

      // Создаем временную ссылку для скачивания файла
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `Финансовая-статистика-${format(dateRange.from, 'dd-MM-yyyy')}-${format(dateRange.to, 'dd-MM-yyyy')}.pdf`,
      )

      // Добавляем ссылку в DOM, кликаем по ней и удаляем
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Освобождаем URL
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Ошибка при экспорте PDF:', error)
      // Здесь можно добавить уведомление пользователю об ошибке
    }
  }

  return (
    <SubscriptionRouteGuard requiredPlan='premium'>
      <Layout links={[{ href: '/statistics', label: 'Статистика' }]}>
        <div className='mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <h1 className='text-3xl font-bold tracking-tight'>Статистика</h1>

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
                  locale={ru}
                />
              </PopoverContent>
            </Popover>

            <Button
              size='sm'
              variant='outline'
              onClick={handleRefresh}
              title='Обновить'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>

            {/* Кнопка экспорта в PDF (только для Pro) */}
            {canAccess('pro') && (
              <Button
                size='sm'
                variant='outline'
                onClick={handleExportPDF}
                title='Экспорт в PDF'
                className='gap-2'
              >
                <Download className='h-4 w-4' />
                <span className='hidden md:inline'>Экспорт в PDF</span>
              </Button>
            )}
          </div>
        </div>

        {/* Графики доходов и расходов */}
        <div className='grid gap-4 md:grid-cols-2'>
          {/* График доходов и расходов */}
          <Card className='transition-all duration-300 hover:shadow-md'>
            <CardHeader>
              <CardTitle>Доходы и расходы</CardTitle>
              <CardDescription>
                За период {formatDateRange(dateRange)}
              </CardDescription>
            </CardHeader>
            <CardContent className='h-[350px]'>
              {isBalanceLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Skeleton className='h-[300px] w-full rounded' />
                </div>
              ) : (
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={[
                      {
                        name: 'Доходы',
                        value: balanceData?.stats?.totalIncome || 0,
                      },
                      {
                        name: 'Расходы',
                        value: balanceData?.stats?.totalExpense || 0,
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        'Сумма',
                      ]}
                    />
                    <Bar dataKey='value' fill='#8884d8'>
                      <Cell fill='#82ca9d' />
                      <Cell fill='#ff7675' />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Баланс по месяцам */}
          <Card className='transition-all duration-300 hover:shadow-md'>
            <CardHeader>
              <CardTitle>Итоговый баланс</CardTitle>
              <CardDescription>
                За период {formatDateRange(dateRange)}
              </CardDescription>
            </CardHeader>
            <CardContent className='h-[350px]'>
              {isBalanceLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Skeleton className='h-[300px] w-full rounded' />
                </div>
              ) : (
                <div className='flex h-full flex-col items-center justify-center'>
                  <div className='animate-in fade-in-20 slide-in-from-bottom-5 mb-4 text-5xl font-bold duration-1000'>
                    {formatCurrency(balanceData?.stats?.balance || 0)}
                  </div>
                  <div className='text-muted-foreground text-lg'>
                    Итоговый баланс
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Динамика баланса по дням */}
        <div className='mt-4'>
          <Card className='transition-all duration-300 hover:shadow-md'>
            <CardHeader>
              <CardTitle>Динамика баланса</CardTitle>
              <CardDescription>
                Показатели баланса за период {formatDateRange(dateRange)}
              </CardDescription>
            </CardHeader>
            <CardContent className='h-[350px]'>
              {isBalanceLoading || isDynamicsLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Skeleton className='h-[300px] w-full rounded' />
                </div>
              ) : dynamicsChartData.length === 0 ? (
                <div className='flex h-full flex-col items-center justify-center text-center'>
                  <p className='text-muted-foreground'>
                    Нет данных за выбранный период
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={dynamicsChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' tickFormatter={formatXAxis} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={label =>
                        `Дата: ${format(new Date(label), 'dd.MM.yyyy HH:mm')}`
                      }
                      formatter={(value: number) => [
                        formatCurrency(value),
                        'Сумма',
                      ]}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='income'
                      stroke='#82ca9d'
                      activeDot={{ r: 8 }}
                      name='Доходы'
                    />
                    <Line
                      type='monotone'
                      dataKey='expense'
                      stroke='#ff7675'
                      activeDot={{ r: 8 }}
                      name='Расходы'
                    />
                    <Line
                      type='monotone'
                      dataKey='balance'
                      stroke='#0088FE'
                      activeDot={{ r: 8 }}
                      name='Баланс'
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Графики распределения по категориям */}
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {/* Расходы по категориям */}
          <Card className='transition-all duration-300 hover:shadow-md'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Расходы по категориям</CardTitle>
                  <CardDescription>
                    За период {formatDateRange(dateRange)}
                  </CardDescription>
                </div>
                <Tabs
                  defaultValue='pie'
                  onValueChange={value => setChartType(value as 'bar' | 'pie')}
                >
                  <TabsList>
                    <TabsTrigger value='pie'>Круговая</TabsTrigger>
                    <TabsTrigger value='bar'>Столбчатая</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className='h-[350px]'>
              {isExpenseCategoryStatsLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Skeleton className='h-[300px] w-full rounded' />
                </div>
              ) : expensePieChartData.length === 0 ? (
                <div className='flex h-full flex-col items-center justify-center text-center'>
                  <p className='text-muted-foreground'>
                    Нет данных за выбранный период
                  </p>
                </div>
              ) : chartType === 'pie' ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={expensePieChartData}
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
                      {expensePieChartData.map(
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
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={expensePieChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='name'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, _name: string, props: any) => [
                        `${formatCurrency(value)} (${props.payload.percentage?.toFixed(1)}%)`,
                        props.payload.name,
                      ]}
                    />
                    <Bar dataKey='value' fill='#ff7675'>
                      {expensePieChartData.map(
                        (entry: PieChartData, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Доходы по категориям */}
          <Card className='transition-all duration-300 hover:shadow-md'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Доходы по категориям</CardTitle>
                  <CardDescription>
                    За период {formatDateRange(dateRange)}
                  </CardDescription>
                </div>
                <Tabs
                  defaultValue='pie'
                  onValueChange={value => setChartType(value as 'bar' | 'pie')}
                >
                  <TabsList>
                    <TabsTrigger value='pie'>Круговая</TabsTrigger>
                    <TabsTrigger value='bar'>Столбчатая</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className='h-[350px]'>
              {isIncomeCategoryStatsLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Skeleton className='h-[300px] w-full rounded' />
                </div>
              ) : incomePieChartData.length === 0 ? (
                <div className='flex h-full flex-col items-center justify-center text-center'>
                  <p className='text-muted-foreground'>
                    Нет данных за выбранный период
                  </p>
                </div>
              ) : chartType === 'pie' ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={incomePieChartData}
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
                      {incomePieChartData.map(
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
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={incomePieChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='name'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, _name: string, props: any) => [
                        `${formatCurrency(value)} (${props.payload.percentage?.toFixed(1)}%)`,
                        props.payload.name,
                      ]}
                    />
                    <Bar dataKey='value' fill='#82ca9d'>
                      {incomePieChartData.map(
                        (entry: PieChartData, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </SubscriptionRouteGuard>
  )
}
