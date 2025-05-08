import { useUpdateUser } from '@/api/user'
import type { UpdateUserData, User } from '@/api/user'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Имя должно содержать минимум 2 символа.',
  }),
  lastName: z.string().min(2, {
    message: 'Фамилия должна содержать минимум 2 символа.',
  }),
  email: z.string().email({
    message: 'Пожалуйста, введите корректный email адрес.',
  }),
  telegramChatId: z.string().optional(),
})

interface EditProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  user: User | undefined
}

export function EditProfileDialog({
  isOpen,
  onClose,
  user,
}: EditProfileDialogProps) {
  const { mutate: updateUser, isPending } = useUpdateUser()

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      telegramChatId: '',
    },
  })

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        telegramChatId: user.telegramChatId || '',
      })
    }
  }, [user, isOpen, form])

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    const userData: UpdateUserData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      telegramChatId: values.telegramChatId || '',
    }

    updateUser(userData, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Редактирование профиля</DialogTitle>
          <DialogDescription>
            Обновите ваши личные данные. После сохранения изменения вступят в
            силу немедленно.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder='Введите имя' {...field} />
                  </FormControl>
                  <FormDescription>
                    Ваше имя, отображаемое в профиле.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Фамилия</FormLabel>
                  <FormControl>
                    <Input placeholder='Введите фамилию' {...field} />
                  </FormControl>
                  <FormDescription>
                    Ваша фамилия, отображаемая в профиле.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='example@mail.com'
                      type='email'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ваш email используется для входа в систему.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='telegramChatId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Введите ваш Chat ID из Telegram'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ваш Telegram Chat ID для использования бота. Получите его,
                    отправив команду /start боту.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Отмена
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
