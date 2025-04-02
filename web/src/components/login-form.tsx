import { useLogin } from '@/api/auth'
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
import { PasswordInput } from '@/components/ui/password-input'
import { useToast } from '@/components/ui/use-toast.ts'
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const login = useLogin()
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await login.mutateAsync(value)
        navigate({ to: '/dashboard' })
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Произошла ошибка при входе в аккаунт',
          variant: 'destructive',
        })
      }
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Войти в аккаунт</CardTitle>
          <CardDescription>
            Введите ваш email и пароль, чтобы войти в свой аккаунт
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
                        disabled={login.isPending}
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
                <div className='flex items-center'>
                  <Label htmlFor='password'>Пароль</Label>
                  <Link
                    to='/forgot-password'
                    className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                  >
                    Забыли ваш пароль?
                  </Link>
                </div>
                <form.Field
                  name='password'
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
                        id='password'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => field.handleChange(e.target.value)}
                        disabled={login.isPending}
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
                      disabled={!canSubmit || login.isPending}
                    >
                      {isSubmitting || login.isPending
                        ? 'Загрузка...'
                        : 'Войти'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </div>
            <div className='mt-4 text-center text-sm'>
              У вас нет аккаунта?{' '}
              <Link to='/register' className='underline underline-offset-4'>
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
