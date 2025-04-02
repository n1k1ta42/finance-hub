import { createFileRoute, Link, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/500')({
  component: ServerErrorPage,
})

function ServerErrorPage() {
  const router = useRouter()
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <div className='flex flex-col space-y-4 text-center'>
        <h1 className='text-4xl font-bold'>500</h1>
        <p className='mt-2 text-2xl'>Внутренняя ошибка сервера</p>
        {isAuthenticated && (
          <Link to={'/dashboard'} className='font-medium underline'>
            На главную
          </Link>
        )}
        <button
          onClick={() => router.history.back()}
          className='bg-primary hover:bg-primary/90 mt-4 rounded-md px-4 py-2 text-white'
        >
          Вернуться назад
        </button>
      </div>
    </div>
  )
}
