import { useUnreadCount } from '@/api/notifications'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  className?: string
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { data: count = 0, isLoading } = useUnreadCount()

  if (isLoading || count === 0) {
    return null
  }

  return (
    <Badge
      variant='destructive'
      className={cn(
        'h-5 min-w-5 rounded-full px-1.5 text-xs font-medium',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
}
