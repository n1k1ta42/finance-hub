import { useAppInfo } from '@/api/public'
import { ModeToggle } from '@/components/mode-toggle.tsx'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

import { AdvantagesSection } from './advantages-section'
import { FeaturesSection } from './features-section'
import { Footer } from './footer'
import { PricingSection } from './pricing-section'
import { ReviewsSection } from './reviews-section'

export function LandingPage() {
  // Используем хук для получения общей информации о приложении
  const { data: appInfo } = useAppInfo()

  // Стандартные данные на случай, если загрузка не удалась
  const defaultAppInfo = {
    name: 'Finance Hub',
    description: 'Управляйте финансами просто и эффективно',
    tagline:
      'Наш сервис помогает контролировать расходы, планировать бюджет и достигать ваших финансовых целей',
    contacts: {
      telegram: '@n1k1ta42',
    },
  }

  // Используем полученные данные или значения по умолчанию
  const displayInfo = appInfo || defaultAppInfo

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Герой-секция */}
      <section className='relative bg-gradient-to-b from-blue-50 to-white px-4 py-32 dark:from-gray-900 dark:to-gray-800'>
        <div className='absolute top-4 right-4'>
          <ModeToggle />
        </div>

        <div className='container mx-auto text-center'>
          <h1 className='mb-6 text-5xl leading-tight font-bold tracking-tight md:text-6xl'>
            {displayInfo.description} <br />
            <span className='text-blue-600 dark:text-blue-400'>
              {displayInfo.name}
            </span>
          </h1>
          <p className='mx-auto mb-10 max-w-2xl text-xl text-gray-600 dark:text-gray-300'>
            {displayInfo.tagline}
          </p>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Button asChild size='lg' className='px-8 py-6 text-lg'>
              <Link to='/register'>Зарегистрироваться</Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='px-8 py-6 text-lg'
            >
              <Link to='/login'>Войти</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Секция с основными функциями */}
      <FeaturesSection />

      {/* Секция с преимуществами */}
      <AdvantagesSection />

      {/* Секция с отзывами */}
      <ReviewsSection />

      {/* Секция с тарифами */}
      <PricingSection />

      {/* Футер */}
      <Footer />
    </div>
  )
}
