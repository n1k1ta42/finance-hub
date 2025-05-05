import type { Transaction } from '@/api/transactions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCategoryIndicatorClasses } from '@/lib/category-utils'
import { formatCurrency } from '@/lib/currency-utils'
import { formatDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

interface TransactionTableProps {
  data: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionTable({
  data,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const columnHelper = createColumnHelper<Transaction>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Дата',
        cell: info => formatDate(info.getValue()),
      }),
      columnHelper.accessor('category.name', {
        header: 'Категория',
        cell: info => (
          <div className='flex items-center gap-2'>
            <Badge
              className={cn(
                'h-2 w-2 rounded-full',
                getCategoryIndicatorClasses(info.row.original.category.color),
              )}
            />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Описание',
        cell: info => info.getValue() || '-',
      }),
      columnHelper.accessor('amount', {
        header: 'Сумма',
        cell: info => {
          const isExpense = info.row.original.category.type === 'expense'
          return (
            <span className={cn(isExpense ? 'text-red-500' : 'text-green-500')}>
              {isExpense ? '-' : '+'}
              {formatCurrency(info.getValue())}
            </span>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Действия',
        cell: info => (
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onEdit(info.row.original)}
            >
              <Edit2 className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onDelete(info.row.original)}
            >
              <Trash2 className='h-4 w-4 text-red-500' />
            </Button>
          </div>
        ),
      }),
    ],
    [columnHelper, onEdit, onDelete],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className={
                    header.column.getCanSort()
                      ? 'cursor-pointer select-none'
                      : ''
                  }
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className='flex items-center gap-1'>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getIsSorted() === 'asc' && (
                      <ArrowUp className='ml-1 h-4 w-4' />
                    )}
                    {header.column.getIsSorted() === 'desc' && (
                      <ArrowDown className='ml-1 h-4 w-4' />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                className='hover:bg-muted/50 transition-colors'
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                Нет транзакций
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
