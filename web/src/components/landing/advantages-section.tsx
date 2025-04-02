import { Cloud, LineChart, Lock, Shield, Smartphone, Zap } from 'lucide-react'

export function AdvantagesSection() {
  const advantages = [
    {
      icon: <Zap className='h-8 w-8 text-amber-500' />,
      title: 'Быстрый старт',
      description:
        'Начните управлять финансами за несколько минут без сложных настроек',
    },
    {
      icon: <Lock className='h-8 w-8 text-green-500' />,
      title: 'Безопасность',
      description:
        'Ваши данные надежно защищены современными методами шифрования',
    },
    {
      icon: <Smartphone className='h-8 w-8 text-blue-500' />,
      title: 'Доступ с любого устройства',
      description:
        'Работайте с финансами на компьютере, планшете или смартфоне',
    },
    {
      icon: <Cloud className='h-8 w-8 text-purple-500' />,
      title: 'Облачное хранение',
      description:
        'Все данные синхронизируются между устройствами автоматически',
    },
    {
      icon: <Shield className='h-8 w-8 text-red-500' />,
      title: 'Конфиденциальность',
      description:
        'Мы не передаем ваши данные третьим лицам и не используем их для рекламы',
    },
    {
      icon: <LineChart className='h-8 w-8 text-indigo-500' />,
      title: 'Улучшение с каждым днем',
      description:
        'Регулярные обновления с новыми функциями на основе отзывов пользователей',
    },
  ]

  return (
    <section className='bg-white px-4 py-24 dark:bg-gray-800'>
      <div className='container mx-auto'>
        <div className='mx-auto mb-16 max-w-3xl text-center'>
          <h2 className='mb-4 text-4xl font-bold'>Почему выбирают нас</h2>
          <p className='text-xl text-gray-600 dark:text-gray-300'>
            Преимущества, которые делают наш сервис особенным
          </p>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {advantages.map((item, index) => (
            <div
              key={index}
              className='flex flex-col rounded-lg border border-gray-200 p-6 transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-800'
            >
              <div className='mb-4'>{item.icon}</div>
              <h3 className='mb-2 text-xl font-medium'>{item.title}</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
