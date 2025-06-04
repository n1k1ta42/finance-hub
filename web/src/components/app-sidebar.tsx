import { useUser } from '@/api/user'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { useTheme } from '@/components/theme-provider.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useSubscription } from '@/hooks/use-subscription'
import { Link } from '@tanstack/react-router'
import {
  ArrowRightLeft,
  Bell,
  ChartColumn,
  ChartNoAxesCombined,
  Component,
  CreditCard,
  Github,
  History,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  Presentation,
  Repeat,
  Send,
  Users,
} from 'lucide-react'
import * as React from 'react'

const data = {
  navMain: [
    {
      title: 'Дашборд',
      url: '/dashboard',
      icon: LayoutDashboard,
      items: [],
    },
    {
      title: 'Транзакции',
      url: '/transactions',
      icon: ArrowRightLeft,
      items: [],
    },
    {
      title: 'Категории',
      url: '/categories',
      icon: Component,
      items: [],
    },
    {
      title: 'Проекты',
      url: '/projects',
      icon: Presentation,
      items: [],
    },
    {
      title: 'Инвестиции',
      url: '/investments',
      icon: ChartNoAxesCombined,
      items: [],
    },
    {
      title: 'Бюджеты',
      url: '/budgets',
      icon: Landmark,
      items: [],
    },
    {
      title: 'Регулярные платежи',
      url: '/recurring',
      icon: Repeat,
      items: [],
    },
    {
      title: 'Статистика',
      url: '/statistics',
      icon: ChartColumn,
      items: [],
    },
    {
      title: 'История',
      url: '/history',
      icon: History,
      items: [],
    },
    {
      title: 'Уведомления',
      url: '/notifications',
      icon: Bell,
      items: [],
      showBadge: true,
    },
    {
      title: 'Платежи',
      url: '/payments',
      icon: CreditCard,
      items: [],
    },
  ],
  adminNavItems: [
    {
      title: 'Пользователи',
      url: '/admin/users',
      icon: Users,
      items: [],
    },
    {
      title: 'Категории пользователей',
      url: '/admin/categories',
      icon: Component,
      items: [],
    },
  ],
  navSecondary: [
    {
      title: 'Поддержка',
      url: '/support',
      icon: LifeBuoy,
    },
    {
      title: 'Отзывы',
      url: '/reviews',
      icon: Send,
    },
    {
      title: 'GitHub',
      url: 'https://github.com/n1k1ta42/finance-hub',
      icon: Github,
      external: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme } = useTheme()
  const { canAccess, isLoading } = useSubscription()
  const { data: user } = useUser()
  const isAdmin = user?.role === 'admin'

  // Если данные о подписке еще загружаются, показываем базовые пункты меню
  const mainNavItems = React.useMemo(() => {
    if (isLoading)
      return data.navMain.filter(
        item => item.url !== '/budgets' && item.url !== '/history',
      )

    let items = data.navMain.filter(item => {
      // Бюджеты доступны только для Premium и Pro
      if (item.url === '/budgets' && !canAccess('premium')) return false

      // Регулярные платежи доступны только для Premium и Pro
      if (item.url === '/recurring' && !canAccess('premium')) return false

      // Расширенная статистика доступна только для Premium и Pro
      if (item.url === '/statistics' && !canAccess('premium')) return false

      // История изменений доступна только для Premium и Pro
      if (item.url === '/history' && !canAccess('premium')) return false

      return true
    })

    // Добавляем меню администратора, если пользователь - админ
    if (isAdmin) {
      items = [...items, ...data.adminNavItems]
    }

    return items
  }, [canAccess, isLoading, isAdmin])

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link to={'/dashboard'}>
                <img
                  src={theme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
                  alt='Логотип'
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
