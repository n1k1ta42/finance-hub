import { RegisterForm } from '@/components/register-form'
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (isAuthenticated) {
    return <Navigate to='/support' />
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <RegisterForm />
      </div>
    </div>
  )
}
