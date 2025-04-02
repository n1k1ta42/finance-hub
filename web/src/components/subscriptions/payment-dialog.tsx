import { useCreatePaymentIntent, useProcessPayment } from '@/api/payments'
import type { PlanInfo } from '@/api/user'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/currency-utils'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader,
  Lock,
} from 'lucide-react'
import { useState } from 'react'

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: PlanInfo | null
}

export function PaymentDialog({
  isOpen,
  onClose,
  selectedPlan,
}: PaymentDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<
    'details' | 'processing' | 'success' | 'error'
  >('details')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  const createPaymentIntent = useCreatePaymentIntent()
  const processPayment = useProcessPayment()

  // Проверка валидности формы
  const isFormValid =
    cardNumber.replace(/\s/g, '').length === 16 &&
    cardName.length > 2 &&
    expiryDate.length === 5 &&
    cvv.length === 3

  // Форматирование номера карты
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  // Валидация и форматирование даты
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const handlePayment = async () => {
    if (!selectedPlan) return

    setStep('processing')

    try {
      // 1. Создаем намерение платежа (мок)
      const paymentIntentResult = await createPaymentIntent.mutateAsync({
        plan: selectedPlan.plan,
        period: selectedPlan.period,
      })

      // 2. Имитация обработки платежа
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 3. Обработка платежа на сервере (включает создание подписки)
      await processPayment.mutateAsync({
        plan: selectedPlan.plan,
        period: selectedPlan.period,
        paymentMethod: 'card',
        paymentIntentId: paymentIntentResult.data.id,
      })

      setStep('success')

      toast({
        title: 'Оплата прошла успешно',
        description: `Подписка ${selectedPlan.plan} успешно оформлена`,
      })
    } catch (error) {
      console.error('Ошибка при оплате:', error)
      setStep('error')

      toast({
        title: 'Ошибка при оплате',
        description: 'Не удалось обработать платеж. Попробуйте еще раз.',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setStep('details')
    setCardNumber('')
    setCardName('')
    setExpiryDate('')
    setCvv('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && handleClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {step === 'details' && 'Оплата подписки'}
            {step === 'processing' && 'Обработка платежа'}
            {step === 'success' && 'Платеж успешен'}
            {step === 'error' && 'Ошибка платежа'}
          </DialogTitle>
          <DialogDescription>
            {step === 'details' &&
              selectedPlan &&
              `Подписка ${selectedPlan.plan} (${selectedPlan.period})`}
            {step === 'processing' &&
              'Подождите, пока мы обрабатываем ваш платеж'}
            {step === 'success' && 'Ваша подписка успешно оформлена'}
            {step === 'error' && 'Произошла ошибка при обработке платежа'}
          </DialogDescription>
        </DialogHeader>

        {step === 'details' && (
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='card-number'>Номер карты</Label>
              <div className='relative'>
                <CreditCard className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                <Input
                  id='card-number'
                  placeholder='1234 5678 9012 3456'
                  className='pl-10'
                  value={cardNumber}
                  onChange={e =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  maxLength={19}
                />
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='card-name'>Имя владельца</Label>
              <Input
                id='card-name'
                placeholder='IVAN IVANOV'
                value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='expiry'>Срок действия</Label>
                <div className='relative'>
                  <Calendar className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                  <Input
                    id='expiry'
                    placeholder='MM/YY'
                    className='pl-10'
                    value={expiryDate}
                    onChange={e =>
                      setExpiryDate(formatExpiryDate(e.target.value))
                    }
                    maxLength={5}
                  />
                </div>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='cvv'>CVV</Label>
                <div className='relative'>
                  <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                  <Input
                    id='cvv'
                    placeholder='123'
                    className='pl-10'
                    type='password'
                    value={cvv}
                    onChange={e =>
                      setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))
                    }
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            <div className='text-muted-foreground mt-2 text-sm'>
              {selectedPlan && (
                <p>
                  Итого к оплате:{' '}
                  <span className='font-medium'>
                    {formatCurrency(selectedPlan.price)}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className='flex flex-col items-center justify-center py-8'>
            <Loader className='text-primary mb-4 h-12 w-12 animate-spin' />
            <p className='text-muted-foreground text-center text-sm'>
              Обрабатываем ваш платеж. Пожалуйста, не закрывайте это окно.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className='flex flex-col items-center justify-center py-8'>
            <CheckCircle className='mb-4 h-12 w-12 text-green-500' />
            <p className='text-muted-foreground text-center text-sm'>
              Спасибо за оплату! Ваша подписка успешно активирована.
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className='flex flex-col items-center justify-center py-8'>
            <AlertCircle className='text-destructive mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-center text-sm'>
              Произошла ошибка при обработке платежа. Пожалуйста, проверьте
              данные карты и попробуйте еще раз.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'details' && (
            <>
              <Button variant='outline' onClick={handleClose}>
                Отмена
              </Button>
              <Button disabled={!isFormValid} onClick={handlePayment}>
                Оплатить
              </Button>
            </>
          )}

          {step === 'processing' && (
            <Button variant='outline' disabled>
              Обработка...
            </Button>
          )}

          {step === 'success' && <Button onClick={handleClose}>Закрыть</Button>}

          {step === 'error' && (
            <>
              <Button variant='outline' onClick={handleClose}>
                Закрыть
              </Button>
              <Button variant='default' onClick={() => setStep('details')}>
                Попробовать снова
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
