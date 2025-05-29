import {
  useCreateProjectPayment,
  type ProjectPaymentFormData,
} from '@/api/projects'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Сумма должна быть больше 0'),
  date: z.date({
    required_error: 'Выберите дату платежа',
  }),
  comment: z.string().optional(),
})

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  projectName: string
}

export function PaymentDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
}: PaymentDialogProps) {
  const { toast } = useToast()
  const createPayment = useCreateProjectPayment()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      comment: '',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const paymentData: ProjectPaymentFormData = {
        amount: values.amount,
        date: format(values.date, 'yyyy-MM-dd'),
        comment: values.comment || '',
      }

      await createPayment.mutateAsync({ projectId, data: paymentData })

      toast({
        title: 'Платеж добавлен',
        description: `Платеж на сумму ${values.amount} руб. успешно добавлен`,
      })

      form.reset()
      onClose()
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить платеж',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Добавить платеж</DialogTitle>
          <DialogDescription>
            Добавьте новый платеж для проекта "{projectName}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сумма платежа</FormLabel>
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
                  <FormLabel>Дата платежа</FormLabel>
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
                      placeholder='Введите комментарий к платежу'
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
                disabled={createPayment.isPending}
              >
                Отмена
              </Button>
              <Button type='submit' disabled={createPayment.isPending}>
                {createPayment.isPending ? 'Добавление...' : 'Добавить платеж'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
