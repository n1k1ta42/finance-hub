import { useAppInfo } from '@/api/public'
import { ModeToggle } from '@/components/mode-toggle.tsx'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet'

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
      telegram: '@financehub_app',
    },
  }

  // Используем полученные данные или значения по умолчанию
  const displayInfo = appInfo || defaultAppInfo
  const siteUrl = window.location.origin

  // SEO-оптимизированные метаданные
  const pageTitle = `${displayInfo.name} - ${displayInfo.description}`
  const pageDescription = displayInfo.tagline
  const keywords =
    'финансы, бюджет, расходы, доходы, финансовый учет, планирование бюджета, финансовые цели'

  const isProd = import.meta.env.PROD

  useEffect(() => {
    if (!isProd) return
    // Вставка скрипта Яндекс.Метрики
    if (!document.getElementById('yandex-metrika')) {
      const script = document.createElement('script')
      script.id = 'yandex-metrika'
      script.type = 'text/javascript'
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(101723680, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:true
        });
      `
      document.head.appendChild(script)
    }
    // Вставка <noscript> для Яндекс.Метрики
    if (!document.getElementById('yandex-metrika-noscript')) {
      const noscript = document.createElement('noscript')
      noscript.id = 'yandex-metrika-noscript'
      noscript.innerHTML =
        '<div><img src="https://mc.yandex.ru/watch/101723680" style="position:absolute; left:-9999px;" alt="" /></div>'
      document.body.appendChild(noscript)
    }
  }, [isProd])

  return (
    <div className='flex min-h-screen flex-col'>
      <Helmet>
        {/* Основные мета-теги */}
        <title>{pageTitle}</title>
        <meta name='description' content={pageDescription} />
        <meta name='keywords' content={keywords} />
        <meta name='robots' content='index, follow' />
        <meta name='language' content='Russian' />
        <meta name='author' content={displayInfo.name} />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link rel='canonical' href={siteUrl} />

        {/* Open Graph теги для социальных сетей */}
        <meta property='og:type' content='website' />
        <meta property='og:title' content={pageTitle} />
        <meta property='og:description' content={pageDescription} />
        <meta property='og:url' content={siteUrl} />
        <meta property='og:image' content={`${siteUrl}/og-image.png`} />
        <meta property='og:site_name' content={displayInfo.name} />
        <meta property='og:locale' content='ru_RU' />

        {/* Twitter Card теги */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={pageTitle} />
        <meta name='twitter:description' content={pageDescription} />
        <meta name='twitter:image' content={`${siteUrl}/twitter-image.png`} />

        {/* JSON-LD структурированные данные */}
        <script type='application/ld+json'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: displayInfo.name,
            description: pageDescription,
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'RUB',
              availability: 'https://schema.org/InStock',
            },
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
          })}
        </script>
      </Helmet>

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
