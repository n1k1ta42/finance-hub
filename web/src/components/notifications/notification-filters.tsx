import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'

export interface NotificationFilterOptions {
  type?: string
  isRead?: boolean
  importance?: string
}

interface NotificationFiltersProps {
  filters: NotificationFilterOptions
  onFilterChange: (filters: NotificationFilterOptions) => void
}

export function NotificationFilters({
  filters,
  onFilterChange,
}: NotificationFiltersProps) {
  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === 'all' ? undefined : value,
    })
  }

  const handleStatusChange = (value: string) => {
    let isRead: boolean | undefined

    if (value === 'read') {
      isRead = true
    } else if (value === 'unread') {
      isRead = false
    } else {
      isRead = undefined
    }

    onFilterChange({
      ...filters,
      isRead,
    })
  }

  const handleImportanceChange = (value: string) => {
    onFilterChange({
      ...filters,
      importance: value === 'all' ? undefined : value,
    })
  }

  const getStatusValue = () => {
    if (filters.isRead === true) return 'read'
    if (filters.isRead === false) return 'unread'
    return 'all'
  }

  return (
    <div className='flex items-center justify-between py-4'>
      <h2 className='text-xl font-semibold'>Уведомления</h2>
      <div className='flex space-x-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <Filter className='mr-1 h-4 w-4' />
              Фильтры
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Тип уведомления</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={filters.type || 'all'}
              onValueChange={handleTypeChange}
            >
              <DropdownMenuRadioItem value='all'>Все</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='payment'>
                Оплата
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='subscription'>
                Подписка
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='system'>
                Системные
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Статус</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={getStatusValue()}
              onValueChange={handleStatusChange}
            >
              <DropdownMenuRadioItem value='all'>Все</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='read'>
                Прочитанные
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='unread'>
                Непрочитанные
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Важность</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={filters.importance || 'all'}
              onValueChange={handleImportanceChange}
            >
              <DropdownMenuRadioItem value='all'>Все</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='high'>Важные</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='normal'>
                Обычные
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value='low'>
                Неважные
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
