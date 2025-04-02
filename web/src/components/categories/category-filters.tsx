import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

export interface CategoryFilters {
  type?: 'expense' | 'income'
}

interface CategoryFiltersProps {
  filters: CategoryFilters
  onChangeFilters: (filters: CategoryFilters) => void
}

export function CategoryFilters({
  filters,
  onChangeFilters,
}: CategoryFiltersProps) {
  const [open, setOpen] = useState(false)

  const handleTypeChange = (value: string) => {
    if (value === 'all') {
      const { type, ...restFilters } = filters
      onChangeFilters(restFilters)
    } else {
      onChangeFilters({ ...filters, type: value as 'expense' | 'income' })
    }
    setOpen(false)
  }

  const clearFilters = () => {
    onChangeFilters({})
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-end justify-between gap-2'>
        <div className='grid gap-4 md:grid-cols-1'>
          <div className='flex flex-col space-y-1.5'>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={open}
                  className='w-full justify-between md:w-[200px]'
                >
                  {filters.type
                    ? filters.type === 'expense'
                      ? 'Расходы'
                      : 'Доходы'
                    : 'Все типы'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0 md:w-[200px]'>
                <Command>
                  <CommandGroup>
                    <CommandItem
                      value='all'
                      onSelect={() => handleTypeChange('all')}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !filters.type ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      Все типы
                    </CommandItem>
                    <CommandItem
                      value='expense'
                      onSelect={() => handleTypeChange('expense')}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          filters.type === 'expense'
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      Расходы
                    </CommandItem>
                    <CommandItem
                      value='income'
                      onSelect={() => handleTypeChange('income')}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          filters.type === 'income'
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      Доходы
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className='flex'>
          <Button variant='outline' onClick={clearFilters}>
            Сбросить фильтры
          </Button>
        </div>
      </div>
    </div>
  )
}
