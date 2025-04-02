import { useSubscriptionPlans } from '@/api/public'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'

export function PricingSection() {
  // Используем хук для получения планов подписок
  const { data: subscriptionPlans, isLoading, error } = useSubscriptionPlans()

  // Группируем планы по периодам
  const getPlansForPeriod = (period: string) => {
    if (!subscriptionPlans) return []
    return subscriptionPlans.filter(plan => plan.period === period)
  }

  // Проверяем, является ли план популярным
  const isPopularPlan = (plan: string, period: string) => {
    if (period === 'monthly' && plan === 'premium') return true
    if (period === 'yearly' && plan === 'premium') return true
    if (period === 'lifetime' && plan === 'premium') return true
    return false
  }

  // Получаем тип кнопки в зависимости от плана
  const getButtonVariant = (plan: string): 'default' | 'outline' => {
    return plan === 'premium' ? 'default' : 'outline'
  }

  // Получаем текст кнопки в зависимости от плана
  const getButtonText = (plan: string) => {
    return plan === 'basic' ? 'Начать бесплатно' : 'Выбрать план'
  }

  // Форматируем цену для отображения
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  // Рассчитываем оригинальную цену для годовых планов (скидка 20%)
  const getOriginalPrice = (price: number) => {
    return Math.round(price / 0.8)
  }

  if (isLoading) {
    return (
      <section
        id='pricing'
        className='bg-gray-50 px-4 py-24 dark:bg-gray-900/50'
      >
        <div className='container mx-auto'>
          <div className='mx-auto mb-16 max-w-3xl text-center'>
            <h2 className='mb-4 text-4xl font-bold'>Планы подписок</h2>
            <p className='text-xl text-gray-600 dark:text-gray-300'>
              Выберите план, который подходит вашим потребностям
            </p>
          </div>
          <div className='flex justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section
        id='pricing'
        className='bg-gray-50 px-4 py-24 dark:bg-gray-900/50'
      >
        <div className='container mx-auto'>
          <div className='mx-auto mb-16 max-w-3xl text-center'>
            <h2 className='mb-4 text-4xl font-bold'>Планы подписок</h2>
            <p className='text-xl text-red-600 dark:text-red-400'>
              Не удалось загрузить информацию о подписках
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id='pricing' className='bg-gray-50 px-4 py-24 dark:bg-gray-900/50'>
      <div className='container mx-auto'>
        <div className='mx-auto mb-16 max-w-3xl text-center'>
          <h2 className='mb-4 text-4xl font-bold'>Планы подписок</h2>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Выберите план, который подходит вашим потребностям
          </p>
        </div>

        <Tabs defaultValue='monthly' className='mb-12'>
          <div className='flex justify-center'>
            <TabsList className='mb-8'>
              <TabsTrigger value='monthly'>Ежемесячно</TabsTrigger>
              <TabsTrigger value='yearly'>Ежегодно</TabsTrigger>
              <TabsTrigger value='lifetime'>Навсегда</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='monthly'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {getPlansForPeriod('monthly')
                .sort((a, b) => a.price - b.price)
                .map((plan, index) => (
                  <Card
                    key={index}
                    className={`relative flex flex-col ${
                      isPopularPlan(plan.plan, 'monthly')
                        ? 'border-blue-600 shadow-lg dark:border-blue-500'
                        : ''
                    }`}
                  >
                    {isPopularPlan(plan.plan, 'monthly') && (
                      <Badge className='absolute top-4 right-4 bg-blue-600 dark:bg-blue-500'>
                        Популярный
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>
                        {plan.plan === 'basic'
                          ? 'Базовый'
                          : plan.plan === 'premium'
                            ? 'Премиум'
                            : 'Профессиональный'}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className='flex grow flex-col'>
                      <div className='mb-6'>
                        <span className='text-4xl font-bold'>
                          {formatPrice(plan.price)}
                        </span>
                        {plan.price !== 0 && (
                          <span className='text-muted-foreground'> ₽/мес</span>
                        )}
                      </div>
                      <ul className='mb-6 grow space-y-2'>
                        {plan.features.map((feature, i) => (
                          <li key={i} className='flex items-center'>
                            <Check className='mr-2 h-4 w-4 text-green-500' />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        asChild
                        className='w-full'
                        variant={getButtonVariant(plan.plan)}
                      >
                        <Link to='/register'>{getButtonText(plan.plan)}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='yearly'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {getPlansForPeriod('yearly')
                .sort((a, b) => a.price - b.price)
                .map((plan, index) => (
                  <Card
                    key={index}
                    className={`relative flex flex-col ${
                      isPopularPlan(plan.plan, 'yearly')
                        ? 'border-blue-600 shadow-lg dark:border-blue-500'
                        : ''
                    }`}
                  >
                    {isPopularPlan(plan.plan, 'yearly') && (
                      <Badge className='absolute top-4 right-4 bg-blue-600 dark:bg-blue-500'>
                        Популярный
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>
                        {plan.plan === 'basic'
                          ? 'Базовый'
                          : plan.plan === 'premium'
                            ? 'Премиум'
                            : 'Профессиональный'}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className='flex grow flex-col'>
                      <div className='mb-6'>
                        <span className='text-4xl font-bold'>
                          {formatPrice(plan.price)}
                        </span>
                        {plan.price !== 0 && (
                          <span className='text-muted-foreground'> ₽/год</span>
                        )}
                        {plan.price !== 0 && (
                          <div className='mt-1'>
                            <span className='text-muted-foreground line-through'>
                              {formatPrice(getOriginalPrice(plan.price))} ₽
                            </span>
                            <span className='ml-2 text-sm font-medium text-green-600'>
                              Экономия 20%
                            </span>
                          </div>
                        )}
                      </div>
                      <ul className='mb-6 grow space-y-2'>
                        {plan.features.map((feature, i) => (
                          <li key={i} className='flex items-center'>
                            <Check className='mr-2 h-4 w-4 text-green-500' />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        asChild
                        className='w-full'
                        variant={getButtonVariant(plan.plan)}
                      >
                        <Link to='/register'>{getButtonText(plan.plan)}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value='lifetime'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-2 lg:px-32'>
              {getPlansForPeriod('lifetime')
                .sort((a, b) => a.price - b.price)
                .filter(plan => plan.plan !== 'basic')
                .map((plan, index) => (
                  <Card
                    key={index}
                    className={`relative flex flex-col ${
                      isPopularPlan(plan.plan, 'lifetime')
                        ? 'border-blue-600 shadow-lg dark:border-blue-500'
                        : ''
                    }`}
                  >
                    {isPopularPlan(plan.plan, 'lifetime') && (
                      <Badge className='absolute top-4 right-4 bg-blue-600 dark:bg-blue-500'>
                        Популярный
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>
                        {plan.plan === 'premium'
                          ? 'Премиум'
                          : 'Профессиональный'}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className='flex grow flex-col'>
                      <div className='mb-6'>
                        <span className='text-4xl font-bold'>
                          {formatPrice(plan.price)}
                        </span>
                        <span className='text-muted-foreground'> ₽</span>
                        <div className='mt-1'>
                          <span className='text-sm font-medium text-green-600'>
                            Единоразовый платеж
                          </span>
                        </div>
                      </div>
                      <ul className='mb-6 grow space-y-2'>
                        {plan.features.map((feature, i) => (
                          <li key={i} className='flex items-center'>
                            <Check className='mr-2 h-4 w-4 text-green-500' />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        asChild
                        className='w-full'
                        variant={getButtonVariant(plan.plan)}
                      >
                        <Link to='/register'>{getButtonText(plan.plan)}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className='mx-auto max-w-3xl rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/20'>
          <p className='text-muted-foreground'>
            <span className='font-medium text-black dark:text-white'>
              При регистрации
            </span>{' '}
            вам автоматически выдается пожизненная базовая подписка. Вы можете
            пользоваться ее возможностями без ограничений по времени.
          </p>
        </div>
      </div>
    </section>
  )
}
