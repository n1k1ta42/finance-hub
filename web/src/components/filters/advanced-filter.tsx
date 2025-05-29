import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/currency-utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, Filter, Save, Search, X } from 'lucide-react'
import { useState } from 'react'

export interface FilterOptions {
  searchQuery?: string
  amountRange?: {
    min?: number
    max?: number
  }
  dateRange?: {
    from?: Date
    to?: Date
  }
  status?: string[]
  type?: string[]
  tags?: string[]
  sortBy?: 'amount' | 'date' | 'progress' | 'name'
  sortOrder?: 'asc' | 'desc'
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  entityType: 'projects' | 'investments'
  className?: string
}

const QUICK_FILTERS = [
  { label: 'За последние 30 дней', value: '30days' },
  { label: 'Этот месяц', value: 'thisMonth' },
  { label: 'Активные', value: 'active' },
  { label: 'Просроченные', value: 'overdue' },
  { label: 'Завершенные', value: 'completed' },
]

export function AdvancedFilter({
  onFilterChange,
  entityType,
  className,
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const applyQuickFilter = (quickFilter: string) => {
    let newFilters: FilterOptions = {}

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (quickFilter) {
      case '30days':
        newFilters.dateRange = { from: thirtyDaysAgo, to: now }
        break
      case 'thisMonth':
        newFilters.dateRange = { from: startOfMonth, to: now }
        break
      case 'active':
        newFilters.status = ['open']
        break
      case 'overdue':
        newFilters.dateRange = { to: now }
        newFilters.status = ['open']
        break
      case 'completed':
        newFilters.status = ['closed', 'completed']
        break
    }

    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof FilterOptions]
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null)
        return Object.keys(value).length > 0
      return value !== undefined && value !== ''
    }).length
  }

  return (
    <div className={className}>
      <div className='mb-4 flex items-center gap-2'>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant='outline' className='gap-2'>
              <Filter className='h-4 w-4' />
              Фильтры
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-1 h-5 w-5 rounded-full p-0 text-xs'
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-96 p-0' align='start'>
            <Card className='border-0 shadow-none'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-lg'>
                  Расширенный поиск
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsOpen(false)}
                    className='h-6 w-6 p-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Поиск по тексту */}
                <div className='space-y-2'>
                  <Label>Поиск</Label>
                  <div className='relative'>
                    <Search className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
                    <Input
                      placeholder={`Название ${entityType === 'projects' ? 'проекта' : 'инвестиции'}, теги...`}
                      value={filters.searchQuery || ''}
                      onChange={e =>
                        updateFilter('searchQuery', e.target.value)
                      }
                      className='pl-10'
                    />
                  </div>
                </div>

                {/* Диапазон сумм */}
                <div className='space-y-2'>
                  <Label>Диапазон сумм</Label>
                  <div className='flex gap-2'>
                    <Input
                      type='number'
                      placeholder='От'
                      value={filters.amountRange?.min || ''}
                      onChange={e =>
                        updateFilter('amountRange', {
                          ...filters.amountRange,
                          min: Number(e.target.value) || undefined,
                        })
                      }
                    />
                    <Input
                      type='number'
                      placeholder='До'
                      value={filters.amountRange?.max || ''}
                      onChange={e =>
                        updateFilter('amountRange', {
                          ...filters.amountRange,
                          max: Number(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Диапазон дат */}
                <div className='space-y-2'>
                  <Label>Период</Label>
                  <div className='flex gap-2'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start text-left font-normal'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {filters.dateRange?.from
                            ? format(filters.dateRange.from, 'dd.MM.yyyy', {
                                locale: ru,
                              })
                            : 'От'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={filters.dateRange?.from}
                          onSelect={date =>
                            updateFilter('dateRange', {
                              ...filters.dateRange,
                              from: date,
                            })
                          }
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start text-left font-normal'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {filters.dateRange?.to
                            ? format(filters.dateRange.to, 'dd.MM.yyyy', {
                                locale: ru,
                              })
                            : 'До'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={filters.dateRange?.to}
                          onSelect={date =>
                            updateFilter('dateRange', {
                              ...filters.dateRange,
                              to: date,
                            })
                          }
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Сортировка */}
                <div className='space-y-2'>
                  <Label>Сортировка</Label>
                  <div className='flex gap-2'>
                    <Select
                      value={filters.sortBy || ''}
                      onValueChange={value => updateFilter('sortBy', value)}
                    >
                      <SelectTrigger className='flex-1'>
                        <SelectValue placeholder='Поле' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='name'>Название</SelectItem>
                        <SelectItem value='amount'>Сумма</SelectItem>
                        <SelectItem value='date'>Дата</SelectItem>
                        {entityType === 'projects' && (
                          <SelectItem value='progress'>Прогресс</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sortOrder || ''}
                      onValueChange={value => updateFilter('sortOrder', value)}
                    >
                      <SelectTrigger className='flex-1'>
                        <SelectValue placeholder='Порядок' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='asc'>По возрастанию</SelectItem>
                        <SelectItem value='desc'>По убыванию</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Действия */}
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={clearFilters}
                    className='flex-1'
                  >
                    Очистить
                  </Button>
                  <Button variant='outline' className='gap-2'>
                    <Save className='h-4 w-4' />
                    Сохранить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        {/* Быстрые фильтры */}
        <div className='flex gap-2'>
          {QUICK_FILTERS.map(filter => (
            <Button
              key={filter.value}
              variant='outline'
              size='sm'
              onClick={() => applyQuickFilter(filter.value)}
              className='text-xs'
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Активные фильтры */}
      {getActiveFiltersCount() > 0 && (
        <div className='mb-4 flex flex-wrap gap-2'>
          {filters.searchQuery && (
            <Badge variant='secondary' className='gap-1'>
              Поиск: {filters.searchQuery}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => updateFilter('searchQuery', '')}
              />
            </Badge>
          )}
          {filters.amountRange &&
            (filters.amountRange.min || filters.amountRange.max) && (
              <Badge variant='secondary' className='gap-1'>
                Сумма:{' '}
                {filters.amountRange.min
                  ? formatCurrency(filters.amountRange.min)
                  : '0'}{' '}
                -{' '}
                {filters.amountRange.max
                  ? formatCurrency(filters.amountRange.max)
                  : '∞'}
                <X
                  className='h-3 w-3 cursor-pointer'
                  onClick={() => updateFilter('amountRange', {})}
                />
              </Badge>
            )}
          {filters.dateRange &&
            (filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant='secondary' className='gap-1'>
                Период:{' '}
                {filters.dateRange.from
                  ? format(filters.dateRange.from, 'dd.MM', { locale: ru })
                  : '∞'}{' '}
                -{' '}
                {filters.dateRange.to
                  ? format(filters.dateRange.to, 'dd.MM', { locale: ru })
                  : '∞'}
                <X
                  className='h-3 w-3 cursor-pointer'
                  onClick={() => updateFilter('dateRange', {})}
                />
              </Badge>
            )}
        </div>
      )}
    </div>
  )
}
