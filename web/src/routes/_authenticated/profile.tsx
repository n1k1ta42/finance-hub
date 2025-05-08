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
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      Telegram ID
                    </div>
                    <div className='font-medium'>
                      {user.telegramChatId ? user.telegramChatId : 'Не указан'}
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
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center space-x-4'>
                  <div className='bg-primary/10 rounded-full p-4'>
                    <CreditCard className='text-primary h-8 w-8' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Подписка</CardTitle>
                    <CardDescription>
                      Информация о вашей подписке
                    </CardDescription>
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
                  <div className='py-4 text-center'>
                    <div className='text-muted-foreground'>
                      Информация о подписке не найдена
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Новая карточка для Telegram-бота */}
            <Card>
              <CardHeader>
                <div className='flex items-center space-x-4'>
                  <div className='bg-primary/10 rounded-full p-4'>
                    <svg
                      className='text-primary h-8 w-8'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M21.82 9.24A1.74 1.74 0 0 0 21.94 8c0-.91-.71-1.65-1.59-1.65H3.74C2.85 6.35 2.15 7.09 2.15 8c0 .44.18.85.47 1.14' />
                      <path d='M22 8v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8' />
                      <path d='m19 8-7 5-7-5' />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Telegram-бот</CardTitle>
                    <CardDescription>
                      Управление транзакциями через Telegram
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1 space-y-4'>
                <div>
                  <p className='mb-4'>
                    Вы можете создавать транзакции через наш Telegram-бот.
                    Следуйте инструкциям ниже:
                  </p>
                  <ol className='list-inside list-decimal space-y-2'>
                    <li>
                      Найдите бота{' '}
                      <span className='font-semibold'>
                        <a
                          href='https://t.me/Finance_hub_app_bot'
                          target='_blank'
                        >
                          @Finance_hub_app_bot
                        </a>
                      </span>{' '}
                      в Telegram
                    </li>
                    <li>
                      Отправьте боту команду{' '}
                      <span className='font-semibold'>/start</span>
                    </li>
                    <li>Бот сообщит вам ваш Telegram Chat ID</li>
                    <li>Введите этот ID в профиле выше</li>
                    <li>
                      После сохранения ID бот будет привязан к вашему аккаунту
                    </li>
                    <li>
                      Используйте команду{' '}
                      <span className='font-semibold'>/add</span> для создания
                      транзакций
                    </li>
                  </ol>
                </div>
                <div className='mt-4'>
                  <div className='text-muted-foreground flex items-center text-sm'>
                    <Check className='mr-2 h-4 w-4 text-green-500' />
                    <span>Быстрое добавление транзакций</span>
                  </div>
                  <div className='text-muted-foreground flex items-center text-sm'>
                    <Check className='mr-2 h-4 w-4 text-green-500' />
                    <span>Использование существующих категорий</span>
                  </div>
                  <div className='text-muted-foreground flex items-center text-sm'>
                    <Check className='mr-2 h-4 w-4 text-green-500' />
                    <span>Удобный доступ из мессенджера</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
