import { AppSidebar } from '@/components/app-sidebar.tsx'
import { ModeToggle } from '@/components/mode-toggle.tsx'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import { Link } from '@tanstack/react-router'
import { Fragment, type PropsWithChildren } from 'react'

type Link = {
  href: string
  label: string
}

type Props = {
  links: Link[]
} & PropsWithChildren

export const Layout = ({ children, links }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center justify-between gap-2'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                {links.map((link, index) => (
                  <Fragment key={link.href}>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={link.href}>{link.label}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < links.length - 1 && (
                      <BreadcrumbSeparator className='hidden md:block' />
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className='px-4'>
            <ModeToggle />
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
