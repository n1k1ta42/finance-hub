import { useCategories } from '@/api/categories'
import {
  useCreateRecurringRule,
  useUpdateRecurringRule,
  type RecurringFrequency,
  type RecurringRule,
  type RecurringRuleFormData,
} from '@/api/recurring'
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
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z
  .object({
    amount: z.coerce.number().min(0.01, 'Сумма должна быть больше 0'),
    description: z
      .string()
      .min(2, 'Описание должно содержать минимум 2 символа'),
    categoryId: z.coerce.number().min(1, 'Выберите категорию'),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'] as const),
    startDate: z.date(),
    endDate: z.date().optional(),
  })
  .refine(
    data => {
      if (data.endDate && data.startDate) {
        return data.endDate > data.startDate
      }
      return true
    },
    {
      message: 'Дата окончания должна быть позже даты начала',
      path: ['endDate'],
    },
  )

interface RecurringRuleFormProps {
  rule?: RecurringRule
  onSuccess?: () => void
  onCancel?: () => void
}

export function RecurringRuleForm({
  rule,
  onSuccess,
  onCancel,
}: RecurringRuleFormProps) {
  const { toast } = useToast()
  const { data: categories = [] } = useCategories()

  const createMutation = useCreateRecurringRule()
  const updateMutation = useUpdateRecurringRule()

  const isEdit = !!rule
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: rule?.amount || 0,
      description: rule?.description || '',
      categoryId: rule?.categoryId || 0,
      frequency: (rule?.frequency as RecurringFrequency) || 'monthly',
      startDate: rule ? new Date(rule.startDate) : new Date(),
      endDate: rule?.endDate ? new Date(rule.endDate) : undefined,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData: RecurringRuleFormData = {
        amount: values.amount,
        description: values.description,
        categoryId: values.categoryId,
        frequency: values.frequency,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString(),
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ id: rule.id, data: formData })
        toast({
          title: 'Правило обновлено',
          description: 'Регулярный платеж успешно обновлен',
        })
      } else {
        await createMutation.mutateAsync(formData)
        toast({
          title: 'Правило создано',
          description: 'Регулярный платеж успешно создан',
        })
      }

      onSuccess?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: isEdit
          ? 'Не удалось обновить правило'
          : 'Не удалось создать правило',
      })
    }
  }

  const frequencyOptions = [
    { value: 'daily', label: 'Ежедневно' },
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'yearly', label: 'Ежегодно' },
  ]

  // Фильтруем только категории расходов
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Input placeholder='Например: Аренда квартиры' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Сумма</FormLabel>
              <FormControl>
                <MoneyInput
                  placeholder='0'
                  decimalScale={2}
                  onValueChange={values => {
                    field.onChange(values.floatValue)
                  }}
                  value={field.value}
                  error={!!form.formState.errors.amount}
                />
              </FormControl>
              <FormDescription>Сумма регулярного платежа</FormDescription>
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
                onValueChange={value => field.onChange(parseInt(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите категорию' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map(category => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      <div className='flex items-center gap-2'>
                        <span
                          className='inline-block h-3 w-3 rounded-full'
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Категория для автоматически создаваемых транзакций
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='frequency'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Частота</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
              <FormDescription>Как часто создавать транзакции</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
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
                          field.value.toLocaleDateString('ru-RU')
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
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Когда начать создавать транзакции
                </FormDescription>
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
                          field.value.toLocaleDateString('ru-RU')
                        ) : (
                          <span>Без ограничений</span>
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
                      disabled={date => {
                        const startDate = form.getValues('startDate')
                        return startDate ? date <= startDate : false
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Оставьте пустым для бессрочного правила
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end gap-2'>
          {onCancel && (
            <Button type='button' variant='outline' onClick={onCancel}>
              Отмена
            </Button>
          )}
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? 'Обновление...'
                : 'Создание...'
              : isEdit
                ? 'Обновить'
                : 'Создать'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
