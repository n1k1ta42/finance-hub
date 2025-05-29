import type { Investment, InvestmentFormData } from '@/api/investments'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  type: z.enum(['deposit', 'security', 'realty'], {
    required_error: 'Выберите тип инвестиции',
  }),
  amount: z.coerce.number().min(1, 'Сумма должна быть больше 0'),
  capitalization: z.coerce
    .number()
    .min(0, 'Капитализация не может быть отрицательной')
    .optional(),
  startDate: z.date({
    required_error: 'Выберите дату начала',
  }),
  endDate: z.date().optional(),
  comments: z.string().optional(),
  tags: z.string().optional(),
})

interface InvestmentFormProps {
  investment?: Investment
  onSubmit: (data: InvestmentFormData) => Promise<void>
  isSubmitting: boolean
}

export function InvestmentForm({
  investment,
  onSubmit,
  isSubmitting,
}: InvestmentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'deposit',
      amount: 0,
      capitalization: 0,
      startDate: new Date(),
      endDate: undefined,
      comments: '',
      tags: '',
    },
  })

  useEffect(() => {
    if (investment) {
      form.reset({
        name: investment.name,
        type: investment.type,
        amount: investment.amount,
        capitalization: investment.capitalization,
        startDate: new Date(investment.startDate),
        endDate: investment.endDate ? new Date(investment.endDate) : undefined,
        comments: investment.comments,
        tags: investment.tags,
      })
    }
  }, [investment, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formattedData: InvestmentFormData = {
      ...values,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate?.toISOString(),
      capitalization: values.capitalization || 0,
      comments: values.comments || '',
      tags: values.tags || '',
    }

    await onSubmit(formattedData)

    if (!investment) {
      form.reset()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название инвестиции</FormLabel>
              <FormControl>
                <Input placeholder='Введите название инвестиции' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип инвестиции</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите тип инвестиции' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='deposit'>Депозит</SelectItem>
                  <SelectItem value='security'>Ценные бумаги</SelectItem>
                  <SelectItem value='realty'>Недвижимость</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Выберите тип инвестиционного инструмента
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Начальная сумма</FormLabel>
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
            name='capitalization'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Капитализация</FormLabel>
                <FormControl>
                  <MoneyInput
                    placeholder='0.00'
                    decimalScale={2}
                    onValueChange={values => {
                      field.onChange(values.floatValue)
                    }}
                    value={field.value}
                    error={!!form.formState.errors.capitalization}
                  />
                </FormControl>
                <FormDescription>
                  Накопленная прибыль или капитализация
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='startDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Дата начала</FormLabel>
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
                      disabled={date => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Теги</FormLabel>
              <FormControl>
                <Input placeholder='Введите теги через запятую' {...field} />
              </FormControl>
              <FormDescription>
                Теги помогут организовать и найти инвестиции
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='comments'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Комментарии</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Дополнительная информация об инвестиции'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting
            ? 'Обработка...'
            : investment
              ? 'Обновить инвестицию'
              : 'Создать инвестицию'}
        </Button>
      </form>
    </Form>
  )
}
