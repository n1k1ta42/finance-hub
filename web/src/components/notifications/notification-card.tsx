import { type Notification } from '@/api/notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/date-utils'
import { Bell, CheckCircle, ChevronRight, Trash2 } from 'lucide-react'

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
  onDelete: (id: number) => void
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Badge variant='destructive'>Важное</Badge>
      case 'normal':
        return <Badge variant='default'>Обычное</Badge>
      case 'low':
        return <Badge variant='secondary'>Неважное</Badge>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
            <Bell className='h-4 w-4 text-blue-600' />
          </div>
        )
      case 'subscription':
        return (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-100'>
            <Bell className='h-4 w-4 text-purple-600' />
          </div>
        )
      case 'system':
        return (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
            <Bell className='h-4 w-4 text-gray-600' />
          </div>
        )
      default:
        return (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
            <Bell className='h-4 w-4 text-gray-600' />
          </div>
        )
    }
  }

  return (
    <Card className={notification.isRead ? 'bg-muted/40' : 'bg-card'}>
      <CardHeader className='flex flex-row items-start space-y-0 p-4 pb-2'>
        <div className='flex flex-1 items-center space-x-2'>
          {getTypeIcon(notification.type)}
          <div className='flex flex-col'>
            <div className='text-sm font-semibold'>{notification.title}</div>
            <div className='text-muted-foreground text-xs'>
              {formatRelativeTime(notification.createdAt)}
            </div>
          </div>
        </div>
        <div>{getImportanceBadge(notification.importance)}</div>
      </CardHeader>
      <CardContent className='px-4 py-2 text-sm'>
        {notification.message}
      </CardContent>
      <CardFooter className='flex justify-between p-4 pt-2'>
        <div className='flex space-x-2'>
          {!notification.isRead && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onMarkAsRead(notification.id)}
              className='h-8 text-xs'
            >
              <CheckCircle className='mr-1 h-3.5 w-3.5' />
              Прочитано
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(notification.id)}
            className='text-destructive hover:text-destructive h-8 text-xs'
          >
            <Trash2 className='mr-1 h-3.5 w-3.5' />
            Удалить
          </Button>
        </div>
        <Button variant='ghost' size='sm' className='h-8 text-xs'>
          <span className='mr-1'>Подробнее</span>
          <ChevronRight className='h-3.5 w-3.5' />
        </Button>
      </CardFooter>
    </Card>
  )
}
