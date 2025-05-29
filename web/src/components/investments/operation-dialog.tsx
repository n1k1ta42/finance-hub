import {
  useCreateInvestmentOperation,
  type InvestmentOperationFormData,
} from '@/api/investments'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'capitalization'], {
    required_error: 'Выберите тип операции',
  }),
  amount: z.coerce.number().min(0.01, 'Сумма должна быть больше 0'),
  date: z.date({
    required_error: 'Выберите дату операции',
  }),
  comment: z.string().optional(),
})

interface OperationDialogProps {
  isOpen: boolean
  onClose: () => void
  investmentId: number
  investmentName: string
}

export function OperationDialog({
  isOpen,
  onClose,
  investmentId,
  investmentName,
}: OperationDialogProps) {
  const { toast } = useToast()
  const createOperation = useCreateInvestmentOperation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'deposit',
      amount: 0,
      date: new Date(),
      comment: '',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const operationData: InvestmentOperationFormData = {
        type: values.type,
        amount: values.amount,
        date: format(values.date, 'yyyy-MM-dd'),
        comment: values.comment || '',
      }

      await createOperation.mutateAsync({ investmentId, data: operationData })

      toast({
        title: 'Операция добавлена',
        description: `Операция "${getOperationTypeName(values.type)}" на сумму ${values.amount} руб. успешно добавлена`,
      })

      form.reset()
      onClose()
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить операцию',
        variant: 'destructive',
      })
    }
  }

  const getOperationTypeName = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Депозит'
      case 'withdrawal':
        return 'Снятие'
      case 'capitalization':
        return 'Капитализация'
      default:
        return type
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Добавить операцию</DialogTitle>
          <DialogDescription>
            Добавьте новую операцию для инвестиции "{investmentName}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип операции</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите тип операции' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='deposit'>
                        Депозит (пополнение)
                      </SelectItem>
                      <SelectItem value='withdrawal'>Снятие (вывод)</SelectItem>
                      <SelectItem value='capitalization'>
                        Капитализация (прибыль)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма операции</FormLabel>
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
              name='date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Дата операции</FormLabel>
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
                        disabled={date => date > new Date()}
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
              name='comment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Введите комментарий к операции'
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={createOperation.isPending}
              >
                Отмена
              </Button>
              <Button type='submit' disabled={createOperation.isPending}>
                {createOperation.isPending
                  ? 'Добавление...'
                  : 'Добавить операцию'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
