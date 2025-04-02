import { type Notification } from '@/api/notifications'
import { NotificationCard } from '@/components/notifications/notification-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCheck, Trash2 } from 'lucide-react'

interface NotificationListProps {
  notifications: Notification[]
  isLoading: boolean
  isEmpty: boolean
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
  onDelete: (id: number) => void
  onDeleteAll: () => void
}

export function NotificationList({
  notifications,
  isLoading,
  isEmpty,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className='flex h-48 items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-t-2'></div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <Alert className='mt-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Нет уведомлений</AlertTitle>
        <AlertDescription>
          У вас пока нет уведомлений. Они появятся здесь, когда система захочет
          сообщить вам что-то важное.
        </AlertDescription>
      </Alert>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='text-sm'>
          {unreadCount > 0 && (
            <span className='text-muted-foreground'>
              У вас {unreadCount} непрочитанных уведомлений
            </span>
          )}
        </div>
        <div className='flex space-x-2'>
          {unreadCount > 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={onMarkAllAsRead}
              className='text-xs'
            >
              <CheckCheck className='mr-1 h-4 w-4' />
              Пометить все как прочитанные
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={onDeleteAll}
            className='text-destructive hover:text-destructive text-xs'
          >
            <Trash2 className='mr-1 h-4 w-4' />
            Удалить все
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        {notifications.map(notification => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
