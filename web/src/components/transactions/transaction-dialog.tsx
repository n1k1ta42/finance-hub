import type { Category } from '@/api/categories'
import type { Transaction, TransactionFormData } from '@/api/transactions'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { TransactionForm } from './transaction-form'

interface TransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
  categories: Category[]
  onSubmit: (data: TransactionFormData) => Promise<void>
  isSubmitting: boolean
}

export function TransactionDialog({
  isOpen,
  onClose,
  transaction,
  categories,
  onSubmit,
  isSubmitting,
}: TransactionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {transaction
              ? 'Редактировать транзакцию'
              : 'Создать новую транзакцию'}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? 'Измените данные транзакции и нажмите "Обновить"'
              : 'Заполните форму и нажмите "Создать"'}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          transaction={transaction}
          categories={categories}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

interface DeleteTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export function DeleteTransactionDialog({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  isDeleting,
}: DeleteTransactionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы собираетесь удалить транзакцию
            {transaction?.description ? ` "${transaction.description}"` : ''} на
            сумму {transaction?.amount.toFixed(2)} ₽. Это действие нельзя
            отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
