import { useRegister } from '@/api/auth'
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
import { useNavigate } from '@tanstack/react-router'

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const register = useRegister()
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const { confirmPassword, ...userData } = value
        await register.mutateAsync(userData)
        navigate({ to: '/dashboard' })
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Произошла ошибка при регистрации',
          variant: 'destructive',
        })
      }
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт, чтобы начать использовать сервис
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
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-3'>
                  <Label htmlFor='firstName'>Имя</Label>
                  <form.Field
                    name='firstName'
                    validators={{
                      onSubmit: ({ value }) => {
                        if (!value) return 'Имя обязательно'
                        return undefined
                      },
                    }}
                  >
                    {field => (
                      <div>
                        <Input
                          id='firstName'
                          type='text'
                          placeholder='Иван'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                          disabled={register.isPending}
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
                  <Label htmlFor='lastName'>Фамилия</Label>
                  <form.Field
                    name='lastName'
                    validators={{
                      onSubmit: ({ value }) => {
                        if (!value) return 'Фамилия обязательна'
                        return undefined
                      },
                    }}
                  >
                    {field => (
                      <div>
                        <Input
                          id='lastName'
                          type='text'
                          placeholder='Иванов'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                          disabled={register.isPending}
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
              </div>
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
                        disabled={register.isPending}
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
                <Label htmlFor='password'>Пароль</Label>
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
                        disabled={register.isPending}
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
                <Label htmlFor='confirmPassword'>Подтверждение пароля</Label>
                <form.Field
                  name='confirmPassword'
                  validators={{
                    onSubmit: ({ value }) => {
                      if (!value) return 'Подтверждение пароля обязательно'
                      if (value !== form.getFieldValue('password'))
                        return 'Пароли не совпадают'
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
                        disabled={register.isPending}
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
                      disabled={!canSubmit || register.isPending}
                    >
                      {isSubmitting || register.isPending
                        ? 'Загрузка...'
                        : 'Зарегистрироваться'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </div>
            <div className='mt-4 text-center text-sm'>
              Уже есть аккаунт?{' '}
              <a
                href='#'
                onClick={e => {
                  e.preventDefault()
                  navigate({ to: '/login' })
                }}
                className='underline underline-offset-4'
              >
                Войти
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
