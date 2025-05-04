import { useResetPassword } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useToast } from '@/components/ui/use-toast.ts'
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const resetPassword = useResetPassword()
  const { toast } = useToast()
  // Получаем токен из URL
  const token = new URLSearchParams(window.location.search).get('token')
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  // Реф для отслеживания был ли выполнен запрос проверки токена
  const verificationDoneRef = useRef(false)

  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (value.newPassword !== value.confirmPassword) {
        toast({
          title: 'Ошибка',
          description: 'Пароли не совпадают',
          variant: 'destructive',
        })
        return
      }

      try {
        await resetPassword.mutateAsync({
          token: token || '',
          newPassword: value.newPassword,
        })
        toast({
          title: 'Успех',
          description: 'Ваш пароль успешно изменен',
        })
        navigate({ to: '/login' })
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Произошла ошибка при сбросе пароля',
          variant: 'destructive',
        })
      }
    },
  })

  useEffect(() => {
    // Проверяем, был ли уже выполнен запрос верификации
    if (verificationDoneRef.current) {
      return
    }

    const verifyUserToken = async () => {
      if (!token) {
        setIsVerifying(false)
        setIsTokenValid(false)
        toast({
          title: 'Ошибка',
          description: 'Отсутствует токен для сброса пароля',
          variant: 'destructive',
        })
        // Редирект на страницу логина при отсутствии токена
        navigate({ to: '/login' })
        return
      }

      // Простая проверка на валидность токена - токен должен быть непустой строкой
      // и иметь минимальную длину для токена
      if (token.length < 10) {
        setIsTokenValid(false)
        toast({
          title: 'Ошибка',
          description: 'Недействительный токен для сброса пароля',
          variant: 'destructive',
        })
        navigate({ to: '/login' })
      } else {
        // Токен прошел базовую проверку - реальная проверка произойдет при отправке
        setIsTokenValid(true)
      }

      setIsVerifying(false)
      // Отмечаем, что проверка была выполнена
      verificationDoneRef.current = true
    }

    verifyUserToken()
  }, [token, navigate, toast])

  // Отображаем состояние загрузки
  if (isVerifying) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Сброс пароля</CardTitle>
            <CardDescription>
              Проверяем ваш токен для сброса пароля...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center p-4'>
              <div className='h-6 w-6 animate-spin rounded-full border-t-2 border-b-2 border-green-500'></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Если токен не валидный, то форму не показываем
  if (!isTokenValid) {
    return null
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Установите новый пароль</CardTitle>
          <CardDescription>
            Придумайте новый надежный пароль для вашего аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <div className='flex flex-col gap-6'>
              <div className='grid gap-3'>
                <Label htmlFor='newPassword'>Новый пароль</Label>
                <form.Field
                  name='newPassword'
                  validators={{
                    onSubmit: ({ value }) => {
                      if (!value) return 'Пароль обязателен'
                      if (value.length < 6)
                        return 'Пароль должен быть не менее 6 символов'
                      return undefined
                    },
                  }}
                >
                  {field => (
                    <div>
                      <PasswordInput
                        id='newPassword'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                        disabled={resetPassword.isPending}
                      />
                      {field.state.meta.errors.map(error => (
                        <p key={error} className='mt-1 text-sm text-red-500'>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>
              </div>
              <div className='grid gap-3'>
                <Label htmlFor='confirmPassword'>Подтвердите пароль</Label>
                <form.Field
                  name='confirmPassword'
                  validators={{
                    onSubmit: ({ value }) => {
                      if (!value) return 'Подтверждение пароля обязательно'
                      return undefined
                    },
                  }}
                >
                  {field => (
                    <div>
                      <PasswordInput
                        id='confirmPassword'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                        disabled={resetPassword.isPending}
                      />
                      {field.state.meta.errors.map(error => (
                        <p key={error} className='mt-1 text-sm text-red-500'>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>
              </div>
              <div className='flex flex-col gap-3'>
                <form.Subscribe
                  selector={state => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type='submit'
                      className='w-full'
                      disabled={!canSubmit || resetPassword.isPending}
                    >
                      {isSubmitting || resetPassword.isPending
                        ? 'Сохранение...'
                        : 'Сохранить новый пароль'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </div>
            <div className='mt-4 text-center text-sm'>
              <Link to='/login' className='underline underline-offset-4'>
                Вернуться к входу
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
