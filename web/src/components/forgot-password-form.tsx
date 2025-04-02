import { useForgotPassword } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast.ts'
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const forgotPassword = useForgotPassword()
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword.mutateAsync(value)
        toast({
          title: 'Успех',
          description: 'Инструкции по сбросу пароля отправлены на ваш email',
        })
        navigate({ to: '/login' })
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Произошла ошибка при отправке инструкций',
          variant: 'destructive',
        })
      }
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Восстановить пароль</CardTitle>
          <CardDescription>
            Введите ваш email и мы отправим вам инструкции по сбросу пароля
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
                <Label htmlFor='email'>Email</Label>
                <form.Field
                  name='email'
                  validators={{
                    onSubmit: ({ value }) => {
                      if (!value) return 'Email обязателен'
                      if (
                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
                      ) {
                        return 'Неверный формат email'
                      }
                      return undefined
                    },
                  }}
                >
                  {field => (
                    <div>
                      <Input
                        id='email'
                        type='email'
                        placeholder='m@example.ru'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                        disabled={forgotPassword.isPending}
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
                      disabled={!canSubmit || forgotPassword.isPending}
                    >
                      {isSubmitting || forgotPassword.isPending
                        ? 'Отправка...'
                        : 'Отправить инструкции'}
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
