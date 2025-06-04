import type { Category } from '@/api/categories'
import type {
  RecurringFrequency,
  Transaction,
  TransactionFormData,
} from '@/api/transactions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
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
import { useSubscription } from '@/hooks/use-subscription'
import { getCategoryIndicatorClasses } from '@/lib/category-utils'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Repeat } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive('Сумма должна быть положительной'),
  description: z.string().optional(),
  date: z.date({
    required_error: 'Пожалуйста, выберите дату',
  }),
  categoryId: z.number({
    required_error: 'Пожалуйста, выберите категорию',
  }),
  createRecurring: z.boolean(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  endDate: z.date().optional(),
})

interface TransactionFormProps {
  transaction?: Transaction
  categories: Category[]
  onSubmit: (data: TransactionFormData) => void
  isSubmitting: boolean
}

export function TransactionForm({
  transaction,
  categories,
  onSubmit,
  isSubmitting,
}: TransactionFormProps) {
  const [showRecurring, setShowRecurring] = useState(false)
  const { canAccess } = useSubscription()

  // Проверяем доступ к регулярным платежам (Premium/Pro функция)
  const canUseRecurring = canAccess('premium')

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      date: transaction
        ? new Date(transaction.date)
        : new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            12,
            0,
            0,
          ),
      categoryId: transaction?.categoryId || 0,
      createRecurring: false,
      frequency: 'monthly',
      endDate: undefined,
    },
  })

  useEffect(() => {
    if (transaction) {
      const date = new Date(transaction.date)
      const correctedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12,
        0,
        0,
      )

      form.reset({
        amount: transaction.amount,
        description: transaction.description,
        date: correctedDate,
        categoryId: transaction.categoryId,
        createRecurring: false,
        frequency: 'monthly',
        endDate: undefined,
      })
    }
  }, [transaction, form])

  const handleSubmit = (values: z.infer<typeof schema>) => {
    const selectedDate = values.date
    const correctedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      12,
      0,
      0,
    )

    const data: TransactionFormData = {
      amount: values.amount,
      description: values.description || '',
      date: correctedDate.toISOString(),
      categoryId: values.categoryId,
    }

    if (values.createRecurring && values.frequency) {
      data.createRecurring = true
      data.frequency = values.frequency as RecurringFrequency
      if (values.endDate) {
        data.endDate = values.endDate.toISOString()
      }
    }

    onSubmit(data)
  }

  const frequencyOptions = [
    { value: 'daily', label: 'Ежедневно' },
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'yearly', label: 'Ежегодно' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='amount'
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
                  error={!!form.formState.errors.amount}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='categoryId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Категория</FormLabel>
              <Select
                onValueChange={value => field.onChange(Number(value))}
                defaultValue={field.value ? String(field.value) : undefined}
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Input placeholder='Описание транзакции' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {!transaction && canUseRecurring && (
          <div className='space-y-4 rounded-lg border p-4'>
            <FormField
              control={form.control}
              name='createRecurring'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={checked => {
                        field.onChange(checked)
                        setShowRecurring(!!checked)
                      }}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel className='flex items-center gap-2'>
                      <Repeat className='h-4 w-4' />
                      Сделать регулярным платежом
                    </FormLabel>
                    <FormDescription>
                      Автоматически создавать эту транзакцию через определенные
                      интервалы
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {showRecurring && (
              <>
                <FormField
                  control={form.control}
                  name='frequency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Частота повторения</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Выберите частоту' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frequencyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name='endDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Дата окончания (необязательно)</FormLabel>
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
                                <span>Бессрочно</span>
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
                            disabled={date => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Если не указано, регулярный платеж будет действовать
                        бессрочно
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        )}

        {!transaction && !canUseRecurring && (
          <Alert>
            <Repeat className='h-4 w-4' />
            <AlertDescription>
              Регулярные платежи доступны в планах Premium и Pro.
              <br />
              Обновите подписку для автоматического создания повторяющихся
              транзакций.
            </AlertDescription>
          </Alert>
        )}

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting ? 'Обработка...' : transaction ? 'Обновить' : 'Создать'}
        </Button>
      </form>
    </Form>
  )
}
