import { useFeatures } from '@/api/public'
import {
  BarChart3,
  CreditCard,
  ListTodo,
  PieChart,
  Receipt,
  Wallet,
} from 'lucide-react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className='dark:hover:bg-gray-750 flex flex-col items-start rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800'>
      <div
        className='mb-4 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        aria-hidden='true'
      >
        {icon}
      </div>
      <h3 className='mb-2 text-xl font-semibold'>{title}</h3>
      <p className='text-gray-600 dark:text-gray-300'>{description}</p>
    </article>
  )
}

export function FeaturesSection() {
  // Используем хук для получения функций приложения
  const { data: features, isLoading, error } = useFeatures()

  // Резервные данные на случай ошибки
  const fallbackFeatures = [
    {
      title: 'Дашборд',
      description:
        'Общий обзор финансового состояния с графиками и быстрым доступом к основным функциям',
    },
    {
      title: 'Транзакции',
      description:
        'Удобное добавление, отслеживание и фильтрация всех финансовых операций',
    },
    {
      title: 'Категории',
      description:
        'Организация финансов с помощью персонализированных категорий с иконками и цветами',
    },
    {
      title: 'Статистика',
      description:
        'Детальный анализ доходов и расходов в виде наглядных графиков и отчетов',
    },
    {
      title: 'Бюджеты',
      description:
        'Планирование и отслеживание бюджетов по категориям с уведомлениями о превышении',
    },
    {
      title: 'Платежи',
      description:
        'Управление регулярными платежами и подписками с напоминаниями о предстоящих платежах',
    },
  ]

  // Если ошибка загрузки, используем резервные данные
  const displayFeatures = error || !features ? fallbackFeatures : features

  // Функция для получения соответствующей иконки по названию
  const getIconByTitle = (title: string) => {
    switch (title) {
      case 'Дашборд':
        return <BarChart3 size={24} />
      case 'Транзакции':
        return <Receipt size={24} />
      case 'Категории':
        return <ListTodo size={24} />
      case 'Статистика':
        return <PieChart size={24} />
      case 'Бюджеты':
        return <Wallet size={24} />
      case 'Платежи':
        return <CreditCard size={24} />
      default:
        return <BarChart3 size={24} />
    }
  }

  return (
    <section
      id='features'
      className='bg-gray-50 px-4 py-24 dark:bg-gray-900/50'
      aria-label='Основные функции'
    >
      <div className='container mx-auto'>
        <header className='mx-auto mb-16 max-w-3xl text-center'>
          <h2 className='mb-4 text-4xl font-bold'>Основные функции</h2>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Все необходимые инструменты для эффективного управления личными
            финансами
          </p>
        </header>
        {isLoading ? (
          <div className='flex justify-center py-12'>
            <div
              className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'
              aria-label='Загрузка...'
            ></div>
          </div>
        ) : (
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {displayFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={getIconByTitle(feature.title)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
