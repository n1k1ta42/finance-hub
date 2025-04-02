import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  type NotificationFilters,
} from '@/api/notifications'
import { Layout } from '@/components/layout.tsx'
import {
  NotificationFilters as NotificationFiltersComponent,
  type NotificationFilterOptions,
} from '@/components/notifications/notification-filters'
import { NotificationList } from '@/components/notifications/notification-list'
import { useToast } from '@/components/ui/use-toast'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/notifications')({
  component: Component,
})

function Component() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<NotificationFilterOptions>({})

  const { data, isLoading } = useNotifications(filters as NotificationFilters)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()
  const deleteAllNotifications = useDeleteAllNotifications()

  const notifications = data?.notifications || []
  const isEmpty = !isLoading && notifications.length === 0

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Уведомление помечено как прочитанное',
          variant: 'default',
        })
      },
      onError: () => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось пометить уведомление как прочитанное',
          variant: 'destructive',
        })
      },
    })
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: data => {
        toast({
          title: 'Все уведомления помечены как прочитанные',
          description: `Обновлено уведомлений: ${data.data.count}`,
          variant: 'default',
        })
      },
      onError: () => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось пометить уведомления как прочитанные',
          variant: 'destructive',
        })
      },
    })
  }

  const handleDelete = (id: number) => {
    deleteNotification.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Уведомление удалено',
          variant: 'default',
        })
      },
      onError: () => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить уведомление',
          variant: 'destructive',
        })
      },
    })
  }

  const handleDeleteAll = () => {
    deleteAllNotifications.mutate(undefined, {
      onSuccess: data => {
        toast({
          title: 'Все уведомления удалены',
          description: `Удалено уведомлений: ${data.data.count}`,
          variant: 'default',
        })
      },
      onError: () => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить уведомления',
          variant: 'destructive',
        })
      },
    })
  }

  const handleFilterChange = (newFilters: NotificationFilterOptions) => {
    setFilters(newFilters)
  }

  return (
    <Layout links={[{ href: '/notifications', label: 'Уведомления' }]}>
      <div className='container mx-auto py-6'>
        <NotificationFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          isEmpty={isEmpty}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
        />
      </div>
    </Layout>
  )
}
