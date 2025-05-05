import type { Category } from '@/api/categories'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { formatDate, formatDateRange } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { CalendarIcon, X } from 'lucide-react'
import { useState } from 'react'

export interface TransactionFilters {
  categoryId?: number
  startDate?: string
  endDate?: string
  type?: 'expense' | 'income'
  page?: number
  perPage?: number
  limit?: number
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  categories: Category[]
  onChangeFilters: (filters: TransactionFilters) => void
  onResetFilters?: () => void
  onResetFilter?: (filterName: keyof TransactionFilters) => void
}

export function TransactionFilters({
  filters,
  categories,
  onChangeFilters,
  onResetFilters,
  onResetFilter,
}: TransactionFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined,
  )

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    setStartDate(start)
    setEndDate(end)
    onChangeFilters({
      ...filters,
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    })
  }

  const handleTypeChange = (value: string) => {
    if (value === 'all') {
      if (onResetFilter) {
        onResetFilter('type')
      } else {
        const { type, ...newFilters } = filters
        onChangeFilters(newFilters)
      }
    } else {
      onChangeFilters({
        ...filters,
        type: value as 'expense' | 'income',
      })
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      if (onResetFilter) {
        onResetFilter('categoryId')
      } else {
        const { categoryId, ...newFilters } = filters
        onChangeFilters(newFilters)
      }
    } else {
      onChangeFilters({
        ...filters,
        categoryId: parseInt(value, 10),
      })
    }
  }

  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)

    if (onResetFilters) {
      onResetFilters()
    } else {
      // Сохраняем только параметры пагинации
      const { page, perPage } = filters
      onChangeFilters({ page, perPage })
    }
  }

  const resetDateFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)

    if (onResetFilter) {
      onResetFilter('startDate')
      onResetFilter('endDate')
    } else {
      const { startDate, endDate, ...newFilters } = filters
      onChangeFilters(newFilters)
    }
  }

  const hasActiveFilters = Boolean(
    filters.type || filters.categoryId || filters.startDate || filters.endDate,
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row'>
        <div className='flex-1'>
          <Select
            value={filters.type || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Тип транзакции' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Все типы</SelectItem>
              <SelectItem value='expense'>Расходы</SelectItem>
              <SelectItem value='income'>Доходы</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex-1'>
          <Select
            value={filters.categoryId?.toString() || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Категория' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Все категории</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        category.type === 'expense'
                          ? 'bg-red-500'
                          : 'bg-green-500',
                      )}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex-1'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && !endDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {startDate && endDate ? (
                  <>{formatDateRange(startDate, endDate)}</>
                ) : (
                  <span>Период</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='range'
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={range => {
                  handleDateRangeChange(range?.from, range?.to)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasActiveFilters && (
        <div className='flex flex-wrap gap-2'>
          {filters.type && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              {filters.type === 'expense' ? 'Расходы' : 'Доходы'}
              <button
                onClick={() => handleTypeChange('all')}
                className='hover:bg-muted ml-1 rounded-full p-0.5'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          {filters.categoryId && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              {categories.find(c => c.id === filters.categoryId)?.name ||
                'Категория'}
              <button
                onClick={() => handleCategoryChange('all')}
                className='hover:bg-muted ml-1 rounded-full p-0.5'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          {(startDate || endDate) && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              {startDate && endDate
                ? formatDateRange(startDate, endDate)
                : startDate
                  ? `С ${formatDate(startDate)}`
                  : `По ${formatDate(endDate as Date)}`}
              <button
                onClick={resetDateFilter}
                className='hover:bg-muted ml-1 rounded-full p-0.5'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          )}

          <Button
            variant='ghost'
            size='sm'
            className='h-7 px-2 text-xs'
            onClick={clearFilters}
          >
            Очистить все
          </Button>
        </div>
      )}
    </div>
  )
}
