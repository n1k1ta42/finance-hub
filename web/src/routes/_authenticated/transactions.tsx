import { useCategories } from '@/api/categories'
import {
  useCreateBulkTransactions,
  useCreateTransaction,
  useDeleteBulkTransactions,
  useDeleteTransaction,
  useExportTransactionsToCSV,
  useExportTransactionsToExcel,
  useTransactions,
  useUpdateTransaction,
  type BulkTransactionFormData,
  type TransactionFilters as Filters,
  type Transaction,
  type TransactionFormData,
} from '@/api/transactions'
import { Layout } from '@/components/layout'
import { BulkTransactionDialog } from '@/components/transactions/bulk-transaction-dialog'
import {
  DeleteBulkTransactionsDialog,
  DeleteTransactionDialog,
  TransactionDialog,
} from '@/components/transactions/transaction-dialog'
import { TransactionExport } from '@/components/transactions/transaction-export'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, PlusCircle, RefreshCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(100)

  const [filters, setFilters] = useState<Filters>({
    page: currentPage,
    perPage,
  })

  // Диалоги
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createBulkDialogOpen, setCreateBulkDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteBulkDialogOpen, setDeleteBulkDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >()

  // Выбор транзакций
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    number[]
  >([])

  // Запросы
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useTransactions(filters)
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isSuccess: isCategoriesSuccess,
  } = useCategories()

  // Извлекаем данные из ответа
  const transactions = transactionsData?.data || []
  const paginationMeta = transactionsData?.meta

  // Мутации
  const createTransaction = useCreateTransaction()
  const createBulkTransactions = useCreateBulkTransactions()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()
  const deleteBulkTransactions = useDeleteBulkTransactions()
  const exportToCSV = useExportTransactionsToCSV()
  const exportToExcel = useExportTransactionsToExcel()

  // Обработчики выбора транзакций
  const handleSelectTransaction = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedTransactionIds(prev => [...prev, id])
    } else {
      setSelectedTransactionIds(prev =>
        prev.filter(transactionId => transactionId !== id),
      )
    }
  }

  const handleSelectAllTransactions = (selected: boolean) => {
    if (selected) {
      setSelectedTransactionIds(transactions.map(t => t.id))
    } else {
      setSelectedTransactionIds([])
    }
  }

  // Обработчики
  const handleCreateTransaction = async (data: TransactionFormData) => {
    createTransaction.mutate(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        toast({
          title: 'Успех!',
          description: 'Транзакция успешно создана',
        })
      },
      onError: error => {
        toast({
          title: 'Ошибка!',
          description: 'Не удалось создать транзакцию',
          variant: 'destructive',
        })
        console.error(error)
      },
    })
  }

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!selectedTransaction) return

    updateTransaction.mutate(
      { id: selectedTransaction.id, data },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedTransaction(undefined)
          toast({
            title: 'Успех!',
            description: 'Транзакция успешно обновлена',
          })
        },
        onError: error => {
          toast({
            title: 'Ошибка!',
            description: 'Не удалось обновить транзакцию',
            variant: 'destructive',
          })
          console.error(error)
        },
      },
    )
  }

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return

    deleteTransaction.mutate(selectedTransaction.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedTransaction(undefined)
        toast({
          title: 'Успех!',
          description: 'Транзакция успешно удалена',
        })
      },
      onError: error => {
        toast({
          title: 'Ошибка!',
          description: 'Не удалось удалить транзакцию',
          variant: 'destructive',
        })
        console.error(error)
      },
    })
  }

  const handleDeleteBulkTransactions = async () => {
    if (selectedTransactionIds.length === 0) return

    deleteBulkTransactions.mutate(selectedTransactionIds, {
      onSuccess: () => {
        setDeleteBulkDialogOpen(false)
        setSelectedTransactionIds([])
        toast({
          title: 'Успех!',
          description: `Успешно удалено ${selectedTransactionIds.length} транзакций`,
        })
      },
      onError: error => {
        toast({
          title: 'Ошибка!',
          description: 'Не удалось удалить транзакции',
          variant: 'destructive',
        })
        console.error(error)
      },
    })
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDeleteDialogOpen(true)
  }

  const handleCreateBulkTransactions = async (
    data: BulkTransactionFormData,
  ) => {
    createBulkTransactions.mutate(data, {
      onSuccess: () => {
        setCreateBulkDialogOpen(false)
        toast({
          title: 'Успех!',
          description: `${data.transactions.length} транзакций успешно созданы`,
        })
      },
      onError: error => {
        toast({
          title: 'Ошибка!',
          description: 'Не удалось создать транзакции',
          variant: 'destructive',
        })
        console.error(error)
      },
    })
  }

  const handleExportToCSV = async (filters: Filters) => {
    return exportToCSV.mutateAsync(filters)
  }

  const handleExportToExcel = async (filters: Filters) => {
    return exportToExcel.mutateAsync(filters)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setFilters(prev => ({ ...prev, page }))
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
    setFilters(prev => ({ ...prev, page: 1, perPage: newPerPage }))
  }

  const handleFiltersChange = (newFilters: Filters) => {
    setCurrentPage(1)
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      perPage,
    })
    setCurrentPage(1)
  }

  const handleResetFilter = (filterName: keyof Filters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[filterName]
      return newFilters
    })
  }

  // Создаем навигацию страниц
  const getPaginationItems = () => {
    const items = []
    const totalPages = paginationMeta?.total_pages || 1
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, просто показываем все
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i} className='cursor-pointer'>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      // Добавляем первую страницу
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Добавляем многоточие перед текущей страницей, если нужно
      if (currentPage > 3) {
        items.push(
          <PaginationItem key='ellipsis-start'>
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Добавляем страницы вокруг текущей
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }

      // Добавляем многоточие после текущей страницы, если нужно
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key='ellipsis-end'>
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Добавляем последнюю страницу
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  const isLoading = isTransactionsLoading || isCategoriesLoading

  return (
    <Layout links={[{ href: '/transactions', label: 'Транзакции' }]}>
      <div className='container mx-auto space-y-6'>
        <div className='flex flex-col items-center justify-between gap-2 sm:flex-row'>
          <h1 className='text-3xl font-bold'>Транзакции</h1>
          <div className='flex gap-2'>
            {selectedTransactionIds.length > 0 && (
              <Button
                variant='destructive'
                onClick={() => setDeleteBulkDialogOpen(true)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Удалить выбранные ({selectedTransactionIds.length})
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['transactions'] })
              }
              disabled={isLoading}
            >
              <RefreshCcw className='mr-2 h-4 w-4' />
              Обновить
            </Button>

            <TransactionExport
              filters={filters}
              onExportCSV={handleExportToCSV}
              onExportExcel={handleExportToExcel}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='sm'>
                  <PlusCircle className='mr-2 h-4 w-4' />
                  Добавить
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                  Одну транзакцию
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateBulkDialogOpen(true)}>
                  Несколько транзакций
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isCategoriesSuccess && (
          <TransactionFilters
            filters={filters}
            categories={categories}
            onChangeFilters={handleFiltersChange}
            onResetFilters={handleResetFilters}
            onResetFilter={handleResetFilter}
          />
        )}

        {isTransactionsLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='border-primary h-12 w-12 animate-spin rounded-full border-b-2' />
          </div>
        ) : isTransactionsError ? (
          <div className='relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            <strong className='font-bold'>Ошибка!</strong>
            <span className='block sm:inline'>
              {' '}
              Не удалось загрузить транзакции.
            </span>
          </div>
        ) : (
          <>
            <TransactionTable
              data={transactions}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              selectedIds={selectedTransactionIds}
              onSelect={handleSelectTransaction}
              onSelectAll={handleSelectAllTransactions}
            />
            <div className='flex items-center justify-between'>
              <div className='text-muted-foreground min-w-max text-sm'>
                Всего транзакций: {paginationMeta?.total || 0}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      className={
                        currentPage <= 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {getPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < (paginationMeta?.total_pages || 1) &&
                        handlePageChange(currentPage + 1)
                      }
                      className={
                        currentPage >= (paginationMeta?.total_pages || 1)
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className='text-muted-foreground flex min-w-max items-center gap-2 text-sm'>
                <span>Показывать по:</span>
                <select
                  className='rounded border p-1'
                  value={perPage}
                  onChange={e => handlePerPageChange(Number(e.target.value))}
                >
                  <option value='10'>10</option>
                  <option value='25'>25</option>
                  <option value='50'>50</option>
                  <option value='100'>100</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {isCategoriesSuccess && (
        <>
          <TransactionDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSubmit={handleCreateTransaction}
            categories={categories}
            isCreating={createTransaction.isPending}
          />

          <BulkTransactionDialog
            isOpen={createBulkDialogOpen}
            onClose={() => setCreateBulkDialogOpen(false)}
            categories={categories}
            onSubmit={handleCreateBulkTransactions}
            isSubmitting={createBulkTransactions.isPending}
          />

          {selectedTransaction && (
            <TransactionDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onSubmit={handleUpdateTransaction}
              transaction={selectedTransaction}
              categories={categories}
              isCreating={updateTransaction.isPending}
              title='Редактировать транзакцию'
              description='Измените данные транзакции и нажмите "Сохранить"'
            />
          )}
        </>
      )}

      {selectedTransaction && (
        <DeleteTransactionDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          transaction={selectedTransaction}
          onConfirm={handleDeleteTransaction}
          isDeleting={deleteTransaction.isPending}
        />
      )}

      <DeleteBulkTransactionsDialog
        count={selectedTransactionIds.length}
        open={deleteBulkDialogOpen}
        onOpenChange={setDeleteBulkDialogOpen}
        onConfirm={handleDeleteBulkTransactions}
        isDeleting={deleteBulkTransactions.isPending}
      />
    </Layout>
  )
}
