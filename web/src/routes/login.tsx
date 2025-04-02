import { LoginForm } from '@/components/login-form.tsx'
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: Component,
})

function Component() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (isAuthenticated) {
    return <Navigate to='/dashboard' />
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  )
}
