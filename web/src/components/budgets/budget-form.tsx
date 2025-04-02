import {
  useCreateBudget,
  useUpdateBudget,
  type Budget,
  type BudgetFormData,
  type BudgetPeriod,
} from '@/api/budgets.ts'
import { useCategories } from '@/api/categories.ts'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { useToast } from '@/components/ui/use-toast.ts'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { CalendarIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Название должно содержать минимум 2 символа' }),
  amount: z.coerce.number().min(1, { message: 'Сумма должна быть больше 0' }),
  period: z.enum(['monthly', 'weekly', 'yearly'] as const),
  startDate: z.date(),
  endDate: z.date(),
  categoryId: z.number().optional(),
})

interface BudgetFormProps {
  budget?: Budget
  isEdit?: boolean
}

export function BudgetForm({ budget, isEdit = false }: BudgetFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: categories } = useCategories()
  const createBudgetMutation = useCreateBudget()
  const updateBudgetMutation = useUpdateBudget()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: 0,
      period: 'monthly' as BudgetPeriod,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      categoryId: undefined,
    },
  })

  useEffect(() => {
    if (budget && isEdit) {
      form.reset({
        name: budget.name,
        amount: budget.amount,
        period: budget.period,
        startDate: new Date(budget.startDate),
        endDate: new Date(budget.endDate),
        categoryId: budget.categoryId,
      })
    }
  }, [budget, form, isEdit])

  function onSubmit(data: z.infer<typeof formSchema>) {
    const budgetData: BudgetFormData = {
      name: data.name,
      amount: data.amount,
      period: data.period,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      categoryId: data.categoryId,
    }

    if (isEdit && budget) {
      updateBudgetMutation.mutate(
        { id: budget.id, data: budgetData },
        {
          onSuccess: () => {
            toast({
              title: 'Успех!',
              description: 'Бюджет успешно обновлен',
            })
            navigate({ to: '/budgets' })
          },
          onError: error => {
            toast({
              title: 'Ошибка',
              description: 'Произошла ошибка при обновлении бюджета',
              variant: 'destructive',
            })
            console.error(error)
          },
        },
      )
    } else {
      createBudgetMutation.mutate(budgetData, {
        onSuccess: () => {
          toast({
            title: 'Успех!',
            description: 'Бюджет успешно создан',
          })
          navigate({ to: '/budgets' })
        },
        onError: error => {
          toast({
            title: 'Ошибка',
            description: 'Произошла ошибка при создании бюджета',
            variant: 'destructive',
          })
          console.error(error)
        },
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Редактирование бюджета' : 'Создание нового бюджета'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder='Введите название бюджета' {...field} />
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
                      placeholder='Введите сумму'
                      decimalScale={2}
                      onValueChange={values => {
                        field.onChange(values.floatValue)
                      }}
                      value={field.value}
                      error={!!form.formState.errors.amount}
                    />
                  </FormControl>
                  <FormDescription>
                    Максимальная сумма для бюджета
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='period'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Период</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите период' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='monthly'>Месячный</SelectItem>
                      <SelectItem value='weekly'>Недельный</SelectItem>
                      <SelectItem value='yearly'>Годовой</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                              field.value.toLocaleDateString()
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
                    <FormLabel>Дата окончания</FormLabel>
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
                              field.value.toLocaleDateString()
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
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select
                    onValueChange={value =>
                      field.onChange(value ? parseInt(value) : undefined)
                    }
                    defaultValue={field.value?.toString()}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите категорию (необязательно)' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Привязать бюджет к определенной категории расходов
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className='px-0 pt-4'>
              <Button
                type='submit'
                disabled={
                  createBudgetMutation.isPending ||
                  updateBudgetMutation.isPending
                }
              >
                {isEdit ? 'Сохранить изменения' : 'Создать бюджет'}
              </Button>
              <Button variant='outline' className='ml-2' asChild>
                <Link to='/budgets'>Отмена</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
