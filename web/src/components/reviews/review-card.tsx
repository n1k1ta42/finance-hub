import { useDeleteReview, type Review } from '@/api/reviews'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { formatFullDate } from '@/lib/date-utils.ts'
import { cn } from '@/lib/utils'
import { Star, Trash } from 'lucide-react'

interface ReviewCardProps {
  review: Review
  currentUserId?: number
}

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const deleteReviewMutation = useDeleteReview()

  // Форматирование даты создания отзыва
  const formattedDate = formatFullDate(new Date(review.createdAt))

  // Создание инициалов из имени пользователя
  const initials = review.user.firstName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  // Проверка, может ли пользователь удалить отзыв
  const canDelete = currentUserId === review.user.id

  return (
    <Card>
      <CardHeader className='flex flex-row items-center gap-4'>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
          <div className='font-semibold'>{review.user.firstName}</div>
          <div className='flex items-center gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < review.rating
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'fill-none text-gray-300',
                )}
              />
            ))}
            <span className='ml-2 text-sm text-gray-500'>{formattedDate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-foreground'>{review.comment}</p>
      </CardContent>
      {canDelete && (
        <CardFooter className='flex justify-end'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => deleteReviewMutation.mutate(review.id)}
            disabled={deleteReviewMutation.isPending}
          >
            <Trash className='mr-1 h-4 w-4' />
            Удалить
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
