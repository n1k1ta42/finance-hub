import { useReviews } from '@/api/reviews'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

import { ReviewCard } from './review-card'

interface ReviewsListProps {
  currentUserId?: number
}

export function ReviewsList({ currentUserId }: ReviewsListProps) {
  const { data: reviews, isLoading, error } = useReviews()

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-10'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive' className='my-4'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>
          Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.
        </AlertDescription>
      </Alert>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Alert variant='default' className='my-4'>
        <AlertTitle>Пока нет отзывов</AlertTitle>
        <AlertDescription>Будьте первым, кто оставит отзыв!</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='my-4 space-y-6'>
      {reviews.map(review => (
        <ReviewCard
          key={review.id}
          review={review}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
