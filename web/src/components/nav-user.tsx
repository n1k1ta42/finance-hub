import { useLogout, useMe } from '@/api/auth.ts'
import { useUserSubscription } from '@/api/user.ts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  UserIcon,
} from 'lucide-react'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data } = useMe()
  const { mutate: logout } = useLogout()
  const navigate = useNavigate()
  const { data: subscription } = useUserSubscription()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                {/*<AvatarImage src={data.avatar} alt={user.name} />*/}
                <AvatarFallback className='rounded-lg'>
                  {data.data?.firstName[0]}
                  {data.data?.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>
                  {data.data?.firstName} {data.data?.lastName}
                </span>
                <span className='truncate text-xs'>{data.data?.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  {/*<AvatarImage src={user.avatar} alt={user.name} />*/}
                  <AvatarFallback className='rounded-lg'>
                    {data.data?.firstName[0]}
                    {data.data?.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>
                    {data.data?.firstName} {data.data?.lastName}
                  </span>
                  <span className='truncate text-xs'>{data.data?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {subscription?.subscription.plan !== 'pro' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: '/subscriptions' })}
                  >
                    <Sparkles className='text-primary' />
                    Улучшить до Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                <UserIcon />
                Профиль
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/payments' })}>
                <CreditCard />
                Платежи
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: '/notifications' })}
              >
                <Bell />
                Уведомления
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
