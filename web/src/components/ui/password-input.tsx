import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

interface PasswordInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  className?: string
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className='relative'>
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='absolute top-0 right-0 h-9 w-9 px-2 py-0'
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className='size-4' />
        ) : (
          <Eye className='size-4' />
        )}
        <span className='sr-only'>
          {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
        </span>
      </Button>
    </div>
  )
}
