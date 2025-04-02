import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface ReviewCardProps {
  review: {
    id: number
    user: {
      id: number
      firstName: string
      email: string
    }
    rating: number
    comment: string
    createdAt: string
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  // Создание инициалов из имени пользователя
  const initials = review.user.firstName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <Card className='h-full'>
      <CardHeader className='flex flex-row items-center gap-3 pb-2'>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
          <div className='font-semibold'>{review.user.firstName}</div>
          <div className='flex items-center'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < review.rating
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'fill-none text-gray-300',
                )}
              />
            ))}
            <span className='ml-2 text-xs text-gray-500'>
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-gray-700'>{review.comment}</p>
      </CardContent>
    </Card>
  )
}
