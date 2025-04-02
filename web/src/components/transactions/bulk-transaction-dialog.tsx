import type { Category } from '@/api/categories'
import type { BulkTransactionFormData } from '@/api/transactions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { BulkTransactionForm } from './bulk-transaction-form'

interface BulkTransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onSubmit: (data: BulkTransactionFormData) => Promise<void>
  isSubmitting: boolean
}

export function BulkTransactionDialog({
  isOpen,
  onClose,
  categories,
  onSubmit,
  isSubmitting,
}: BulkTransactionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Массовое добавление транзакций</DialogTitle>
          <DialogDescription>
            Добавьте несколько транзакций за один день
          </DialogDescription>
        </DialogHeader>
        <BulkTransactionForm
          categories={categories}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
