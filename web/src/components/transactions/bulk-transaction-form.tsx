import type { Category } from '@/api/categories'
import type { TransactionFormData } from '@/api/transactions'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
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
import { getCategoryIndicatorClasses } from '@/lib/category-utils'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.number().positive('Сумма должна быть положительной'),
  description: z.string().optional(),
  categoryId: z.number({
    required_error: 'Пожалуйста, выберите категорию',
  }),
})

const schema = z.object({
  date: z.date({
    required_error: 'Пожалуйста, выберите дату',
  }),
  transactions: z
    .array(transactionSchema)
    .min(1, 'Добавьте хотя бы одну транзакцию'),
})

interface BulkTransactionFormProps {
  categories: Category[]
  onSubmit: (data: { transactions: TransactionFormData[] }) => void
  isSubmitting: boolean
}

export function BulkTransactionForm({
  categories,
  onSubmit,
  isSubmitting,
}: BulkTransactionFormProps) {
  const amountInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date(),
      transactions: [
        {
          amount: undefined as unknown as number,
          description: '',
          categoryId: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactions',
  })

  // Обновляем массив рефов при изменении количества полей
  useEffect(() => {
    amountInputRefs.current = amountInputRefs.current.slice(0, fields.length)
  }, [fields.length])

  // При добавлении новой транзакции устанавливаем фокус на поле суммы
  useEffect(() => {
    if (fields.length > 0) {
      const lastIndex = fields.length - 1
      const inputElement = amountInputRefs.current[lastIndex]
      if (inputElement) {
        inputElement.focus()
      }
    }
  }, [fields.length])

  const handleSubmit = (values: z.infer<typeof schema>) => {
    // Преобразуем данные в формат, ожидаемый API
    const formattedTransactions = values.transactions.map(transaction => ({
      ...transaction,
      description: transaction.description || '',
      date: values.date.toISOString(),
    }))

    onSubmit({
      transactions: formattedTransactions,
    })
  }

  const addTransaction = () => {
    append({
      amount: undefined as unknown as number,
      description: '',
      categoryId: 0,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='date'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Дата</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'dd.MM.yyyy')
                      ) : (
                        <span>Выберите дату</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>Транзакции</h3>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addTransaction}
            >
              <Plus className='mr-2 h-4 w-4' />
              Добавить
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className='rounded-lg border p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <h4 className='font-medium'>Транзакция {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name={`transactions.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Сумма</FormLabel>
                      <FormControl>
                        <MoneyInput
                          placeholder='0.00'
                          decimalScale={2}
                          onValueChange={values => {
                            field.onChange(values.floatValue)
                          }}
                          value={field.value}
                          error={
                            !!form.formState.errors.transactions?.[index]
                              ?.amount
                          }
                          getInputRef={(el: HTMLInputElement | null) =>
                            (amountInputRefs.current[index] = el)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`transactions.${index}.categoryId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select
                        onValueChange={value => field.onChange(Number(value))}
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Выберите категорию' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              <div className='flex items-center'>
                                <div
                                  className={cn(
                                    'mr-2 h-2 w-2 rounded-full',
                                    getCategoryIndicatorClasses(category.color),
                                  )}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`transactions.${index}.description`}
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Input placeholder='Описание транзакции' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'></h3>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addTransaction}
            >
              <Plus className='mr-2 h-4 w-4' />
              Добавить
            </Button>
          </div>
        </div>

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting ? 'Обработка...' : 'Создать транзакции'}
        </Button>
      </form>
    </Form>
  )
}
