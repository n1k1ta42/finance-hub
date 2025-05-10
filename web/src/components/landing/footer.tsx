import { useAppInfo } from '@/api/public'
import { MessageCircle } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { data: appInfo } = useAppInfo()

  // Используем telegram из данных API или значение по умолчанию
  const telegram = appInfo?.contacts?.telegram || '@n1k1ta42'

  const footerLinks = [
    {
      title: 'Продукт',
      links: [
        { label: 'Возможности', href: '#features' },
        { label: 'Цены', href: '#pricing' },
        // { label: 'Поддержка', href: '/support' },
      ],
    },
    // {
    //   title: 'Ресурсы',
    //   links: [
    //     { label: 'FAQ', href: '/support#faq' },
    //     { label: 'Руководства', href: '/support#getting-started' },
    //     { label: 'Планы подписок', href: '/support#subscriptions' },
    //   ],
    // },
    // {
    //   title: 'Компания',
    //   links: [
    //     { label: 'О нас', href: '#' },
    //     { label: 'Контакты', href: '#contact' },
    //     { label: 'Правовая информация', href: '#' },
    //   ],
    // },
  ]

  return (
    <footer
      className='bg-gray-100 py-12 dark:bg-gray-900'
      aria-label='Нижняя часть сайта'
    >
      <div className='container mx-auto px-4'>
        <div className='mb-10 grid gap-10 md:grid-cols-2 lg:grid-cols-5'>
          <div className='lg:col-span-2'>
            <div className='mb-4 text-2xl font-bold'>Finance Hub</div>
            <p className='mb-4 max-w-md text-gray-600 dark:text-gray-300'>
              Управляйте своими финансами эффективно с нашим удобным и мощным
              инструментом для учета и анализа доходов и расходов.
            </p>
            <div className='mb-4'>
              <h3 className='mb-2 font-semibold'>Связаться с нами:</h3>
              <div className='space-y-2 text-gray-600 dark:text-gray-300'>
                <div className='flex items-center'>
                  <MessageCircle className='mr-2 h-4 w-4' aria-hidden='true' />
                  <a
                    href={`https://t.me/${telegram.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-blue-600 dark:hover:text-blue-400'
                    aria-label='Связаться через Telegram'
                  >
                    Telegram: {telegram}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {footerLinks.map((group, i) => (
            <div key={i}>
              <h3 className='mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-gray-100'>
                {group.title}
              </h3>
              <nav aria-label={group.title}>
                <ul className='space-y-2'>
                  {group.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href={link.href}
                        className='text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        <div className='flex flex-col items-center justify-between border-t border-gray-200 pt-8 md:flex-row dark:border-gray-700'>
          <p className='text-sm text-gray-600 dark:text-gray-300'>
            &copy; {currentYear} Finance Hub. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
