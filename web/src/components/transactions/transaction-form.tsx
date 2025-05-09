import type { Category } from '@/api/categories'
import type { Transaction, TransactionFormData } from '@/api/transactions'
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
import { CalendarIcon } from 'lucide-react'
import { useEffect } from 'react'
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
    },
  })

  useEffect(() => {
    if (transaction) {
      const date = new Date(transaction.date)
      // Корректируем дату для правильного отображения
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
      })
    }
  }, [transaction, form])

  const handleSubmit = (values: z.infer<typeof schema>) => {
    // Установка времени на 12:00 для предотвращения проблем с часовыми поясами
    const selectedDate = values.date
    const correctedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      12,
      0,
      0,
    )

    onSubmit({
      amount: values.amount,
      description: values.description || '',
      date: correctedDate.toISOString(),
      categoryId: values.categoryId,
    })
  }

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

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting ? 'Обработка...' : transaction ? 'Обновить' : 'Создать'}
        </Button>
      </form>
    </Form>
  )
}
