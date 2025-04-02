import { useUserPayments, type Payment } from '@/api/payments'
import { Layout } from '@/components/layout.tsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatAmount } from '@/lib/currency-utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  CreditCard,
  Download,
  Eye,
  Loader,
  ReceiptText,
  RefreshCcw,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/payments')({
  component: Component,
})

// Расширенный тип платежа для UI
interface PaymentWithDescription extends Payment {
  description?: string
}

// Типы статусов платежей
const paymentStatuses: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'В обработке',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  },
  completed: {
    label: 'Выполнен',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  },
  failed: {
    label: 'Не удался',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  },
  refunded: {
    label: 'Возвращен',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  },
}

// Метод оплаты
const paymentMethods: Record<
  string,
  { label: string; icon: typeof CreditCard }
> = {
  card: { label: 'Банковская карта', icon: CreditCard },
  credit_card: { label: 'Банковская карта', icon: CreditCard },
}

function Component() {
  const { data: paymentsData, isLoading, refetch } = useUserPayments()
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null,
  )
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const navigate = useNavigate()

  // Добавляем описание к каждому платежу
  const payments: PaymentWithDescription[] =
    paymentsData?.map(payment => ({
      ...payment,
      description: `Оплата подписки ${payment.subscriptionId}`,
    })) || []

  const selectedPayment = payments.find(
    payment => payment.id === selectedPaymentId,
  )

  const handleViewDetails = (id: number) => {
    setSelectedPaymentId(id)
    setIsDetailsDialogOpen(true)
  }

  const handleDownloadReceipt = (id: number) => {
    // Здесь будет логика скачивания чека
    alert(`Скачивание чека для платежа #${id}`)
  }

  return (
    <Layout links={[{ href: '/payments', label: 'Платежи' }]}>
      <div className='container py-6'>
        <div className='flex flex-col gap-6 lg:flex-row'>
          <div className='w-full lg:w-2/3'>
            <div className='mb-4 flex items-center justify-between'>
              <h1 className='text-3xl font-bold tracking-tight'>
                История платежей
              </h1>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className='h-5 w-5 animate-spin' />
                ) : (
                  <RefreshCcw className='h-5 w-5' />
                )}
              </Button>
            </div>

            {isLoading ? (
              <div className='space-y-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex rounded-md border p-4'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div className='ml-4 flex-1 space-y-2'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-full' />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className='p-0'>
                  {payments && payments.length > 0 ? (
                    <Table>
                      <TableCaption>История ваших платежей</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Дата</TableHead>
                          <TableHead>Описание</TableHead>
                          <TableHead>Сумма</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead className='text-right'>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map(payment => (
                          <TableRow key={payment.id}>
                            <TableCell className='whitespace-nowrap'>
                              {format(
                                new Date(payment.createdAt),
                                'dd.MM.yyyy',
                                { locale: ru },
                              )}
                            </TableCell>
                            <TableCell className='max-w-[200px] truncate'>
                              {payment.description || 'Платеж за подписку'}
                            </TableCell>
                            <TableCell className='font-medium whitespace-nowrap'>
                              {formatAmount(
                                payment.amount,
                                payment.currency || 'RUB',
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant='outline'
                                className={`${paymentStatuses[payment.status]?.color || ''}`}
                              >
                                {paymentStatuses[payment.status]?.label ||
                                  payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleViewDetails(payment.id)}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                {payment.status === 'completed' && (
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() =>
                                      handleDownloadReceipt(payment.id)
                                    }
                                  >
                                    <Download className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-12'>
                      <ReceiptText className='text-muted-foreground mb-4 h-12 w-12' />
                      <p className='text-muted-foreground'>
                        У вас пока нет платежей
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className='w-full lg:w-1/3'>
            <Card>
              <CardHeader>
                <CardTitle>Способы оплаты</CardTitle>
                <CardDescription>Управление платежными данными</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center gap-4 rounded-md border p-4'>
                    <div className='bg-primary/10 rounded-full p-2'>
                      <CreditCard className='text-primary h-6 w-6' />
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium'>Visa •••• 4242</p>
                      <p className='text-muted-foreground text-sm'>
                        Срок действия: 12/24
                      </p>
                    </div>
                    <Badge variant='outline' className='ml-auto'>
                      Основная
                    </Badge>
                  </div>

                  <Button variant='outline' className='w-full'>
                    <CreditCard className='mr-2 h-4 w-4' />
                    Добавить способ оплаты
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className='mt-4'>
              <CardHeader>
                <CardTitle>Подписка</CardTitle>
                <CardDescription>Детали текущей подписки</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>План:</span>
                      <span className='font-medium'>Премиум</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Период:</span>
                      <span className='font-medium'>Ежемесячно</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Следующий платеж:
                      </span>
                      <span className='font-medium'>15.05.2023</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Сумма:</span>
                      <span className='font-medium'>₽599</span>
                    </div>
                  </div>

                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() =>
                      navigate({
                        to: '/subscriptions',
                      })
                    }
                  >
                    Управление подпиской
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Диалог с деталями платежа */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Детали платежа</DialogTitle>
              <DialogDescription>
                Информация о платеже #{selectedPayment?.id}
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className='space-y-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      ID транзакции
                    </p>
                    <p className='font-medium'>
                      {selectedPayment.transactionId || 'Не указан'}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Дата</p>
                    <p className='font-medium'>
                      {format(
                        new Date(selectedPayment.createdAt),
                        'dd MMMM yyyy, HH:mm',
                        { locale: ru },
                      )}
                    </p>
                  </div>
                </div>

                <div className='space-y-1'>
                  <p className='text-muted-foreground text-sm'>Описание</p>
                  <p className='font-medium'>{selectedPayment.description}</p>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Способ оплаты
                    </p>
                    <div className='mt-1 flex items-center gap-2'>
                      <CreditCard className='h-4 w-4' />
                      <span>
                        {paymentMethods[selectedPayment.paymentMethod]?.label ||
                          selectedPayment.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Статус</p>
                    <Badge
                      variant='outline'
                      className={`mt-1 ${paymentStatuses[selectedPayment.status]?.color || ''}`}
                    >
                      {paymentStatuses[selectedPayment.status]?.label ||
                        selectedPayment.status}
                    </Badge>
                  </div>
                </div>

                <div className='border-t pt-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Итого:</span>
                    <span className='text-xl font-bold'>
                      {formatAmount(
                        selectedPayment.amount,
                        selectedPayment.currency || 'RUB',
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              {selectedPayment?.status === 'completed' && (
                <Button
                  variant='outline'
                  onClick={() => handleDownloadReceipt(selectedPayment.id)}
                >
                  <Download className='mr-2 h-4 w-4' />
                  Скачать чек
                </Button>
              )}
              <Button onClick={() => setIsDetailsDialogOpen(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
