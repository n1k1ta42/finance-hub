import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  type Category,
  type CategoryFormData,
} from '@/api/categories'
import {
  CategoryDialog,
  DeleteCategoryDialog,
} from '@/components/categories/category-dialog'
import {
  CategoryFilters,
  type CategoryFilters as Filters,
} from '@/components/categories/category-filters'
import { CategoryTable } from '@/components/categories/category-table'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { createFileRoute } from '@tanstack/react-router'
import { PlusCircle, RefreshCcw } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<Filters>({})

  // Диалоги
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >()

  // Запросы
  const { data: categoriesData, isLoading, isError, refetch } = useCategories()

  // Фильтруем категории по типу
  const categories = categoriesData
    ? filters.type
      ? categoriesData.filter(category => category.type === filters.type)
      : categoriesData
    : []

  // Мутации
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  // Обработчики
  const handleCreateCategory = async (data: CategoryFormData) => {
    createCategory.mutate(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        toast({
          title: 'Успех!',
          description: 'Категория успешно создана',
        })
      },
      onError: error => {
        console.error(error)
        toast({
          title: 'Ошибка!',
          description: 'Не удалось создать категорию',
          variant: 'destructive',
        })
      },
    })
  }

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!selectedCategory) return
    updateCategory.mutate(
      { id: selectedCategory.id, data },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedCategory(undefined)
          toast({
            title: 'Успех!',
            description: 'Категория успешно обновлена',
          })
        },
        onError: error => {
          toast({
            title: 'Ошибка!',
            description: 'Не удалось обновить категорию',
            variant: 'destructive',
          })
          console.error(error)
        },
      },
    )
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    deleteCategory.mutate(selectedCategory.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedCategory(undefined)
        toast({
          title: 'Успех!',
          description: 'Категория успешно удалена',
        })
      },
      onError: error => {
        toast({
          title: 'Ошибка!',
          description: 'Не удалось удалить категорию',
          variant: 'destructive',
        })
        console.error(error)
      },
    })
  }

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  return (
    <Layout links={[{ href: '/categories', label: 'Категории' }]}>
      <div className='container mx-auto space-y-6'>
        <div className='flex flex-col items-center justify-between gap-2 sm:flex-row'>
          <h1 className='text-3xl font-bold'>Категории</h1>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCcw className='mr-2 h-4 w-4' />
              Обновить
            </Button>
            <Button size='sm' onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className='mr-2 h-4 w-4' />
              Добавить
            </Button>
          </div>
        </div>

        <CategoryFilters filters={filters} onChangeFilters={setFilters} />

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='border-primary h-12 w-12 animate-spin rounded-full border-b-2' />
          </div>
        ) : isError ? (
          <div className='relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            <strong className='font-bold'>Ошибка!</strong>
            <span className='block sm:inline'>
              {' '}
              Не удалось загрузить категории.
            </span>
          </div>
        ) : categories && categories.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center'>
            <h3 className='text-xl font-semibold'>У вас еще нет категорий</h3>
            <p className='text-muted-foreground'>
              Создайте свою первую категорию, чтобы начать отслеживать свои
              финансы.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className='mr-2 h-4 w-4' />
              Создать первую категорию
            </Button>
          </div>
        ) : (
          <CategoryTable
            data={categories || []}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      <CategoryDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateCategory}
        isSubmitting={createCategory.isPending}
      />

      <CategoryDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedCategory(undefined)
        }}
        category={selectedCategory}
        onSubmit={handleUpdateCategory}
        isSubmitting={updateCategory.isPending}
      />

      <DeleteCategoryDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedCategory(undefined)
        }}
        category={selectedCategory}
        onConfirm={handleDeleteCategory}
        isDeleting={deleteCategory.isPending}
      />
    </Layout>
  )
}
