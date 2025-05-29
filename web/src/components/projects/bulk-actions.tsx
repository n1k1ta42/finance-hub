import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  ChevronDown,
  Copy,
  Download,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

export interface BulkActionsProps<T> {
  items: T[]
  selectedItems: Set<number>
  onSelectionChange: (selectedIds: Set<number>) => void
  onBulkAction: (action: string, selectedIds: number[]) => Promise<void>
  entityType: 'projects' | 'investments'
  className?: string
}

export function BulkActions<
  T extends { id: number; name: string; status?: string },
>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkAction,
  entityType,
  className,
}: BulkActionsProps<T>) {
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isAllSelected = selectedItems.size === items.length && items.length > 0
  const isPartiallySelected =
    selectedItems.size > 0 && selectedItems.size < items.length

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(items.map(item => item.id)))
    }
  }

  const toggleSelectItem = (id: number) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    onSelectionChange(newSelection)
  }

  const handleBulkAction = async (action: string) => {
    const selectedIds = Array.from(selectedItems)
    if (selectedIds.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите элементы для выполнения действия',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await onBulkAction(action, selectedIds)
      onSelectionChange(new Set())

      let actionName = ''
      switch (action) {
        case 'archive':
          actionName = 'архивированы'
          break
        case 'unarchive':
          actionName = 'разархивированы'
          break
        case 'complete':
          actionName = 'завершены'
          break
        case 'delete':
          actionName = 'удалены'
          break
        case 'duplicate':
          actionName = 'дублированы'
          break
        case 'export':
          actionName = 'экспортированы'
          break
      }

      toast({
        title: 'Успешно',
        description: `${selectedIds.length} элементов ${actionName}`,
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить действие',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = () => {
    setShowDeleteDialog(false)
    handleBulkAction('delete')
  }

  // Определяем какие действия доступны для выбранных элементов
  const selectedItemsData = items.filter(item => selectedItems.has(item.id))
  const hasArchivedItems = selectedItemsData.some(
    item => item.status === 'archived',
  )
  const hasNonArchivedItems = selectedItemsData.some(
    item => item.status !== 'archived',
  )
  const hasOpenItems = selectedItemsData.some(item => item.status === 'open')

  return (
    <>
      <div className={`flex items-center justify-between ${className}`}>
        <div className='flex items-center gap-3'>
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={toggleSelectAll}
            aria-label='Выбрать все'
            className={isPartiallySelected ? 'opacity-50' : ''}
          />

          {selectedItems.size > 0 && (
            <Badge variant='secondary' className='gap-1'>
              Выбрано: {selectedItems.size}
            </Badge>
          )}
        </div>

        {selectedItems.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' disabled={isLoading}>
                <MoreHorizontal className='h-4 w-4' />
                Действия
                <ChevronDown className='ml-1 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleBulkAction('duplicate')}>
                <Copy className='mr-2 h-4 w-4' />
                Дублировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                <Download className='mr-2 h-4 w-4' />
                Экспортировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {hasOpenItems && entityType === 'projects' && (
                <DropdownMenuItem onClick={() => handleBulkAction('complete')}>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Завершить
                </DropdownMenuItem>
              )}
              {hasNonArchivedItems && (
                <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                  <Archive className='mr-2 h-4 w-4' />
                  Архивировать
                </DropdownMenuItem>
              )}
              {hasArchivedItems && (
                <DropdownMenuItem onClick={() => handleBulkAction('unarchive')}>
                  <ArchiveRestore className='mr-2 h-4 w-4' />
                  Разархивировать
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className='text-red-600 focus:text-red-600'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Список элементов с чекбоксами */}
      <div className='space-y-2'>
        {items.map(item => (
          <div
            key={item.id}
            className='hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2'
          >
            <Checkbox
              checked={selectedItems.has(item.id)}
              onCheckedChange={() => toggleSelectItem(item.id)}
              aria-label={`Выбрать ${item.name}`}
            />
            <span className='flex-1 text-sm'>{item.name}</span>
          </div>
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить {selectedItems.size}{' '}
              {entityType === 'projects'
                ? selectedItems.size === 1
                  ? 'проект'
                  : 'проектов'
                : selectedItems.size === 1
                  ? 'инвестицию'
                  : 'инвестиций'}
              ? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
