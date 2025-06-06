import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (isAuthenticated) {
    return <Navigate to='/dashboard' />
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
