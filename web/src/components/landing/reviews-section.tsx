import { useLatestReviews } from '@/api/public'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { ReviewCard } from './review-card'

export function ReviewsSection() {
  const { data: reviews, isLoading } = useLatestReviews(3)

  return (
    <section
      className='bg-gray-50 px-4 py-20 dark:bg-gray-900'
      id='reviews'
      aria-label='Отзывы пользователей'
    >
      <div className='container mx-auto'>
        <header className='mb-12 text-center'>
          <h2 className='text-3xl font-bold'>Отзывы наших пользователей</h2>
          <p className='mx-auto mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400'>
            Узнайте, что говорят о нас те, кто уже использует наш сервис для
            управления финансами
          </p>
        </header>

        {isLoading ? (
          <div className='flex justify-center py-10'>
            <Loader2
              className='text-primary h-10 w-10 animate-spin'
              aria-label='Загрузка отзывов...'
            />
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className='py-10 text-center'>
            <p className='text-gray-500 dark:text-gray-400'>Пока нет отзывов</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        <div className='mt-10 text-center'>
          <Button asChild variant='outline' size='lg'>
            <Link to='/login'>Оставить отзыв</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
