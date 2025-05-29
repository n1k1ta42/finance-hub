import { useMe } from '@/api/auth.ts'
import { Layout } from '@/components/layout.tsx'
import { ReviewForm } from '@/components/reviews/review-form.tsx'
import { ReviewsList } from '@/components/reviews/reviews-list.tsx'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reviews')({
  component: Component,
})

function Component() {
  const { data: user } = useMe()

  return (
    <Layout links={[{ href: '/reviews', label: 'Отзывы' }]}>
      <div className='container mx-auto py-6'>
        <h1 className='mb-6 text-3xl font-bold'>Отзывы пользователей</h1>

        <Tabs defaultValue='reviews' className='w-full'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='reviews'>Все отзывы</TabsTrigger>
            <TabsTrigger value='add'>Добавить отзыв</TabsTrigger>
          </TabsList>

          <TabsContent value='reviews' className='mt-6'>
            <ReviewsList currentUserId={user?.data?.id} />
          </TabsContent>

          <TabsContent value='add' className='mt-6'>
            <ReviewForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
