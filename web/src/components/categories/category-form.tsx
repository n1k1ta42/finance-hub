import { type Category, type CategoryFormData } from '@/api/categories'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  getCategoryButtonClasses,
  getCategoryColorLabel,
  getCategoryColors,
} from '@/lib/category-utils'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Валидация формы
const formSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа'),
  description: z.string().optional(),
  type: z.enum(['expense', 'income'], {
    required_error: 'Выберите тип категории',
  }),
  color: z.string().min(1, 'Выберите цвет'),
  icon: z.string().min(1, 'Выберите иконку'),
})

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: CategoryFormData) => Promise<void>
  isSubmitting: boolean
}

export function CategoryForm({
  category,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      type: category?.type || 'expense',
      color: category?.color || 'indigo',
      icon: category?.icon || '💰',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values as CategoryFormData)
    if (!category) {
      form.reset()
    }
  }

  // Организованные по категориям иконки
  const iconCategories = [
    {
      name: 'Деньги/Финансы',
      icons: ['💰', '💵', '💸', '💳', '🪙', '💹', '📈', '📉', '🏦', '💼'],
    },
    {
      name: 'Еда и напитки',
      icons: [
        '🍔',
        '🍕',
        '🍣',
        '🍜',
        '🍗',
        '🍲',
        '🥗',
        '🥪',
        '🍰',
        '🍦',
        '🍺',
        '🍷',
        '🥂',
        '🍹',
        '☕',
      ],
    },
    {
      name: 'Покупки',
      icons: ['🛒', '🛍️', '👕', '👖', '👟', '👠', '👜', '🧢', '🎁', '💄', '⌚'],
    },
    {
      name: 'Транспорт',
      icons: ['🚗', '🚕', '🚌', '🚆', '🚂', '✈️', '🚢', '🛵', '🚲', '⛽'],
    },
    {
      name: 'Дом и быт',
      icons: ['🏠', '🏢', '🪑', '🛋️', '🛏️', '🚿', '🧹', '🧼', '🧺', '🔧'],
    },
    {
      name: 'Развлечения',
      icons: ['🎬', '🎮', '🎯', '🎨', '🎭', '🎪', '🎟️', '🎫', '🎵', '🎤'],
    },
    {
      name: 'Здоровье',
      icons: ['🏥', '💊', '🩺', '🦷', '👨‍⚕️', '👩‍⚕️', '🧘‍♀️', '🏋️‍♂️', '🚴‍♀️', '🍎'],
    },
    {
      name: 'Образование',
      icons: ['📚', '🎓', '✏️', '📝', '💻', '🖥️', '🔬', '📊', '🧮', '🗣️'],
    },
    {
      name: 'Общение и связь',
      icons: ['📱', '📞', '💌', '📧', '📨', '📲', '📡', '🖨️', '📺', '📻'],
    },
    {
      name: 'Семья и дети',
      icons: ['👶', '👪', '🧸', '🍼', '👨‍👩‍👧', '🧒', '🐶', '🐱', '🧠', '🧩'],
    },
  ]

  // Получаем цвета из утилиты
  const colors = getCategoryColors()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input placeholder='Введите название категории' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Введите описание категории (необязательно)'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите тип категории' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='expense'>Расход</SelectItem>
                  <SelectItem value='income'>Доход</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цвет</FormLabel>
              <div className='max-h-[220px] overflow-y-auto'>
                <div className='grid grid-cols-5 gap-2'>
                  {colors.map(color => (
                    <Button
                      key={color.value}
                      type='button'
                      className={cn(
                        getCategoryButtonClasses(color.value),
                        field.value === color.value
                          ? 'ring-offset-background ring-ring ring-2 ring-offset-2'
                          : '',
                      )}
                      variant={
                        field.value === color.value ? 'default' : 'outline'
                      }
                      onClick={() => form.setValue('color', color.value)}
                    >
                      {field.value === color.value && (
                        <span className='ml-2'>✓</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <div className='text-muted-foreground mt-2 text-xs'>
                Выбран: {getCategoryColorLabel(field.value)}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='icon'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Иконка</FormLabel>
              <div className='max-h-[300px] overflow-y-auto rounded-md border p-2'>
                {iconCategories.map(category => (
                  <div key={category.name} className='mb-3'>
                    <div className='mb-1 border-b pb-1 text-sm font-medium'>
                      {category.name}
                    </div>
                    <div className='grid grid-cols-10 gap-2'>
                      {category.icons.map(icon => (
                        <Button
                          key={icon}
                          type='button'
                          className={`h-10 text-xl ${
                            field.value === icon
                              ? 'border-primary bg-primary/10'
                              : 'border'
                          }`}
                          variant='outline'
                          onClick={() => form.setValue('icon', icon)}
                        >
                          {icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-2 flex items-center'>
                <span className='mr-2'>Выбрана:</span>
                <span className='text-2xl'>{field.value}</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting
            ? 'Сохранение...'
            : category
              ? 'Сохранить изменения'
              : 'Создать категорию'}
        </Button>
      </form>
    </Form>
  )
}
