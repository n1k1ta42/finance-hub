import type { Transaction } from '@/api/transactions'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { TransactionForm } from './transaction-form'

export interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  transaction?: Transaction
  categories: any[]
  isCreating?: boolean
  title?: string
  description?: string
}

export function TransactionDialog({
  open,
  onOpenChange,
  onSubmit,
  transaction,
  categories,
  isCreating = false,
  title = 'Создать транзакцию',
  description = 'Заполните форму ниже, чтобы создать новую транзакцию.',
}: TransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TransactionForm
          onSubmit={onSubmit}
          transaction={transaction}
          categories={categories}
          isSubmitting={isCreating}
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

interface DeleteBulkTransactionsDialogProps {
  count: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteBulkTransactionsDialog({
  count,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteBulkTransactionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Массовое удаление транзакций</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить {count}{' '}
            {count === 1
              ? 'транзакцию'
              : count > 1 && count < 5
                ? 'транзакции'
                : 'транзакций'}
            ? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
