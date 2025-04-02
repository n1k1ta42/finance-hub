import { useCreateReview } from '@/api/reviews'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Рейтинг обязателен').max(5),
  comment: z
    .string()
    .min(10, 'Комментарий должен содержать минимум 10 символов')
    .max(1000, 'Комментарий не может быть длиннее 1000 символов'),
})

export function ReviewForm() {
  const createReviewMutation = useCreateReview()
  const [hoveredRating, setHoveredRating] = useState(0)

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  })

  const onSubmit = (data: z.infer<typeof reviewSchema>) => {
    createReviewMutation.mutate(data, {
      onSuccess: () => {
        form.reset()
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оставить отзыв</CardTitle>
        <CardDescription>
          Поделитесь своим опытом использования нашего сервиса
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='rating'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Оценка</FormLabel>
                  <FormControl>
                    <div className='flex items-center space-x-1'>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <Star
                          key={rating}
                          className={cn(
                            'h-8 w-8 cursor-pointer transition-colors',
                            rating <= field.value || rating <= hoveredRating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'fill-none text-gray-300 hover:text-yellow-500',
                          )}
                          onClick={() => form.setValue('rating', rating)}
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(0)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='comment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Расскажите о вашем опыте...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Не менее 10 и не более 1000 символов
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={createReviewMutation.isPending}>
              {createReviewMutation.isPending
                ? 'Отправка...'
                : 'Отправить отзыв'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
