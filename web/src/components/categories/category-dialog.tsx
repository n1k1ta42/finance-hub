import { type Category, type CategoryFormData } from '@/api/categories'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CategoryForm } from './category-form'

interface CategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => Promise<void>
  isSubmitting: boolean
  category?: Category
}

export function CategoryDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  category,
}: CategoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {category ? 'Редактировать категорию' : 'Создать новую категорию'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Внесите изменения в категорию'
              : 'Заполните форму для создания новой категории'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

interface DeleteCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  category?: Category
}

export function DeleteCategoryDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  category,
}: DeleteCategoryDialogProps) {
  if (!category) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить категорию</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить категорию "{category.name}"? Это
            действие невозможно отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить категорию'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
