import { useAllUsers, useUpdateUserRole } from '@/api/user'
import { AdminRouteGuard } from '@/components/admin-route-guard'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/components/ui/use-toast'
import { formatFullDate } from '@/lib/date-utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Shield, User as UserIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/admin/users_/$userId')({
  component: EditUserPage,
})

const formSchema = z.object({
  role: z.enum(['user', 'admin']),
})

type FormValues = z.infer<typeof formSchema>

function EditUserPage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const { data: users, isLoading: isLoadingUsers } = useAllUsers()
  const user = users?.users.find(u => u.id === Number(userId))
  const updateRoleMutation = useUpdateUserRole()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: (user?.role as 'user' | 'admin') || 'user',
    },
  })

  // Обновляем форму, когда данные пользователя загружены
  useEffect(() => {
    if (user) {
      form.reset({
        role: user.role as 'user' | 'admin',
      })
    }
  }, [form, user])

  // Обработчик отправки формы
  async function onSubmit(values: FormValues) {
    try {
      await updateRoleMutation.mutateAsync({
        userId: Number(userId),
        roleData: { role: values.role },
      })

      toast({
        title: 'Роль обновлена',
        description: 'Роль пользователя успешно обновлена',
      })

      // Возвращаемся на страницу списка пользователей
      navigate({ to: '/admin/users' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обновить роль пользователя',
      })
    }
  }

  if (isLoadingUsers) {
    return (
      <Layout links={[{ href: '/admin/users', label: 'Пользователи' }]}>
        <AdminRouteGuard>
          <div className='container py-8'>
            <div className='text-center'>Загрузка данных...</div>
          </div>
        </AdminRouteGuard>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout links={[{ href: '/admin/users', label: 'Пользователи' }]}>
        <AdminRouteGuard>
          <div className='container py-8'>
            <div className='text-destructive text-center'>
              Пользователь не найден
            </div>
          </div>
        </AdminRouteGuard>
      </Layout>
    )
  }

  return (
    <Layout
      links={[
        { href: '/admin/users', label: 'Пользователи' },
        {
          href: `/admin/users/${user.id}`,
          label: `${user.firstName} ${user.lastName}`,
        },
      ]}
    >
      <AdminRouteGuard>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-3xl font-bold tracking-tight'>
              Управление пользователем
            </h2>
            <Button variant='outline' size='sm' asChild>
              <Link to='/admin/users'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Назад к списку
              </Link>
            </Button>
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Карточка информации о пользователе */}
            <Card>
              <CardHeader>
                <div className='flex items-center space-x-4'>
                  <div className='bg-primary/10 rounded-full p-4'>
                    <UserIcon className='text-primary h-8 w-8' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>
                      Информация о пользователе
                    </CardTitle>
                    <CardDescription>
                      Основные данные пользователя
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <div className='text-muted-foreground text-sm'>ID</div>
                    <div className='font-medium'>{user.id}</div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>Email</div>
                    <div className='font-medium'>{user.email}</div>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <div className='text-muted-foreground text-sm'>Имя</div>
                    <div className='font-medium'>{user.firstName}</div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>Фамилия</div>
                    <div className='font-medium'>{user.lastName}</div>
                  </div>
                </div>
                <div className='flex items-start space-x-2'>
                  <Calendar className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      Дата регистрации
                    </div>
                    <div className='font-medium'>
                      {formatFullDate(new Date(user.createdAt))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Карточка изменения роли */}
            <Card>
              <CardHeader>
                <div className='flex items-center space-x-4'>
                  <div className='bg-primary/10 rounded-full p-4'>
                    <Shield className='text-primary h-8 w-8' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Роль пользователя</CardTitle>
                    <CardDescription>
                      Изменение прав доступа пользователя
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='flex flex-1 flex-col space-y-2'
                >
                  <CardContent className='flex-1 space-y-4'>
                    <FormField
                      control={form.control}
                      name='role'
                      render={({ field }) => (
                        <FormItem className='space-y-3'>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className='flex flex-col space-y-1'
                            >
                              <FormItem className='flex items-center space-y-0 space-x-3'>
                                <FormControl>
                                  <RadioGroupItem value='user' />
                                </FormControl>
                                <FormLabel className='font-normal'>
                                  Пользователь
                                </FormLabel>
                              </FormItem>
                              <FormItem className='flex items-center space-y-0 space-x-3'>
                                <FormControl>
                                  <RadioGroupItem value='admin' />
                                </FormControl>
                                <FormLabel className='font-normal'>
                                  Администратор
                                </FormLabel>
                                <FormDescription>
                                  Полный доступ к системе
                                </FormDescription>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type='submit'
                      disabled={
                        updateRoleMutation.isPending || !form.formState.isDirty
                      }
                      className='w-full'
                    >
                      {updateRoleMutation.isPending
                        ? 'Сохранение...'
                        : 'Сохранить изменения'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </AdminRouteGuard>
    </Layout>
  )
}
