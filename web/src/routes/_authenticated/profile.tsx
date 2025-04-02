import { useUser, useUserSubscription } from '@/api/user'
import { Layout } from '@/components/layout.tsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EditProfileDialog } from '@/components/user/edit-profile-dialog'
import { formatFullDate } from '@/lib/date-utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  CalendarRange,
  Check,
  Clock,
  CreditCard,
  Edit,
  User,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: user } = useUser()
  const { data: subscriptionData } = useUserSubscription()
  const navigate = useNavigate()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const planLabels: Record<string, string> = {
    basic: 'Базовый',
    premium: 'Премиум',
    pro: 'Профессиональный',
  }

  const periodLabels: Record<string, string> = {
    monthly: 'Месячный',
    yearly: 'Годовой',
    lifetime: 'Бессрочный',
  }

  return (
    <Layout links={[{ href: '/profile', label: 'Профиль' }]}>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-3xl font-bold tracking-tight'>
            Профиль пользователя
          </h2>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate({ to: '/subscriptions' })}
          >
            <CreditCard className='mr-2 h-4 w-4' />
            Управление подпиской
          </Button>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Карточка пользователя */}
          <Card>
            <CardHeader>
              <div className='flex items-center space-x-4'>
                <div className='bg-primary/10 rounded-full p-4'>
                  <User className='text-primary h-8 w-8' />
                </div>
                <div>
                  <CardTitle className='text-xl'>Личные данные</CardTitle>
                  <CardDescription>Информация о вашем профиле</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='flex-1 space-y-4'>
              {user && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <div className='text-muted-foreground text-sm'>Имя</div>
                      <div className='font-medium'>{user.firstName}</div>
                    </div>
                    <div>
                      <div className='text-muted-foreground text-sm'>
                        Фамилия
                      </div>
                      <div className='font-medium'>{user.lastName}</div>
                    </div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>Email</div>
                    <div className='font-medium'>{user.email}</div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      Дата регистрации
                    </div>
                    <div className='font-medium'>
                      {formatFullDate(new Date(user.createdAt))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className='mr-2 h-4 w-4' />
                Редактировать профиль
              </Button>
            </CardFooter>
          </Card>

          {/* Карточка подписки */}
          <Card>
            <CardHeader>
              <div className='flex items-center space-x-4'>
                <div className='bg-primary/10 rounded-full p-4'>
                  <CreditCard className='text-primary h-8 w-8' />
                </div>
                <div>
                  <CardTitle className='text-xl'>Подписка</CardTitle>
                  <CardDescription>Информация о вашей подписке</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='flex-1 space-y-4'>
              {subscriptionData?.subscription ? (
                <>
                  <div className='flex items-center justify-between'>
                    <div className='text-muted-foreground text-sm'>
                      Текущий план
                    </div>
                    <Badge
                      variant={
                        subscriptionData.subscription.active
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {subscriptionData.subscription.active
                        ? 'Активна'
                        : 'Неактивна'}
                    </Badge>
                  </div>
                  <div className='bg-muted rounded-lg p-4'>
                    <div className='text-xl font-semibold'>
                      {planLabels[subscriptionData.subscription.plan] ||
                        subscriptionData.subscription.plan}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      {periodLabels[subscriptionData.subscription.period] ||
                        subscriptionData.subscription.period}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-start space-x-2'>
                      <CalendarRange className='text-muted-foreground h-5 w-5' />
                      <div>
                        <div className='text-muted-foreground text-sm'>
                          Начало
                        </div>
                        <div className='font-medium'>
                          {formatFullDate(
                            new Date(subscriptionData.subscription.startDate),
                          )}
                        </div>
                      </div>
                    </div>
                    {subscriptionData.subscription.endDate && (
                      <div className='flex items-start space-x-2'>
                        <Clock className='text-muted-foreground h-5 w-5' />
                        <div>
                          <div className='text-muted-foreground text-sm'>
                            Окончание
                          </div>
                          <div className='font-medium'>
                            {formatFullDate(
                              new Date(subscriptionData.subscription.endDate),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <div className='mb-2 font-medium'>Доступные функции:</div>
                    <div className='space-y-2'>
                      {subscriptionData.features.map((feature, index) => (
                        <div
                          key={index}
                          className='flex items-center space-x-2'
                        >
                          <Check className='text-primary h-4 w-4' />
                          <span className='text-sm'>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className='py-6 text-center'>
                  <div className='text-muted-foreground mb-2'>
                    У вас нет активной подписки
                  </div>
                  <Button onClick={() => navigate({ to: '/subscriptions' })}>
                    Оформить подписку
                  </Button>
                </div>
              )}
            </CardContent>
            {subscriptionData?.subscription && (
              <CardFooter>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => navigate({ to: '/subscriptions' })}
                >
                  Изменить тариф
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={user}
      />
    </Layout>
  )
}
