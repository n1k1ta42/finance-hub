import type { Project, ProjectFormData } from '@/api/projects'
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
  type: z.enum(['saving', 'loan'], {
    required_error: 'Выберите тип проекта',
  }),
  targetAmount: z.coerce.number().min(1, 'Целевая сумма должна быть больше 0'),
  currentAmount: z.coerce
    .number()
    .min(0, 'Текущая сумма не может быть отрицательной')
    .optional(),
  startDate: z.date({
    required_error: 'Выберите дату начала',
  }),
  endDate: z.date().optional(),
  comments: z.string().optional(),
  tags: z.string().optional(),
})

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: ProjectFormData) => Promise<void>
  isSubmitting: boolean
}

export function ProjectForm({
  project,
  onSubmit,
  isSubmitting,
}: ProjectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'saving',
      targetAmount: 0,
      currentAmount: 0,
      startDate: new Date(),
      endDate: undefined,
      comments: '',
      tags: '',
    },
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        type: project.type,
        targetAmount: project.targetAmount,
        currentAmount: project.currentAmount,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        comments: project.comments,
        tags: project.tags,
      })
    }
  }, [project, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formattedData: ProjectFormData = {
      ...values,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate?.toISOString(),
      currentAmount: values.currentAmount || 0,
      comments: values.comments || '',
      tags: values.tags || '',
    }

    await onSubmit(formattedData)

    if (!project) {
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
              <FormLabel>Название проекта</FormLabel>
              <FormControl>
                <Input placeholder='Введите название проекта' {...field} />
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
              <FormLabel>Тип проекта</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите тип проекта' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='saving'>Накопление</SelectItem>
                  <SelectItem value='loan'>Кредит</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Накопление - для достижения финансовой цели, Кредит - для
                погашения долга
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='targetAmount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Целевая сумма</FormLabel>
                <FormControl>
                  <MoneyInput
                    placeholder='0.00'
                    decimalScale={2}
                    onValueChange={values => {
                      field.onChange(values.floatValue)
                    }}
                    value={field.value}
                    error={!!form.formState.errors.targetAmount}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='currentAmount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Текущая сумма</FormLabel>
                <FormControl>
                  <MoneyInput
                    placeholder='0.00'
                    decimalScale={2}
                    onValueChange={values => {
                      field.onChange(values.floatValue)
                    }}
                    value={field.value}
                    error={!!form.formState.errors.currentAmount}
                  />
                </FormControl>
                <FormDescription>
                  Уже накопленная или выплаченная сумма
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
                Теги помогут организовать и найти проекты
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
                  placeholder='Дополнительная информация о проекте'
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
            : project
              ? 'Обновить проект'
              : 'Создать проект'}
        </Button>
      </form>
    </Form>
  )
}
