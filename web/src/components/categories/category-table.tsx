import { type Category } from '@/api/categories'
import { Avatar } from '@/components/ui/avatar'
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
import { cn } from '@/lib/utils'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'

interface CategoryTableProps {
  data: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryTable({ data, onEdit, onDelete }: CategoryTableProps) {
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'icon',
      header: 'Иконка',
      cell: ({ row }) => {
        const category = row.original
        return (
          <Avatar className='h-10 w-10'>
            <div
              className={cn(
                'flex h-full w-full items-center justify-center',
                getCategoryIndicatorClasses(category.color),
              )}
            >
              {category.icon}
            </div>
          </Avatar>
        )
      },
    },
    {
      accessorKey: 'name',
      header: 'Название',
    },
    {
      accessorKey: 'description',
      header: 'Описание',
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <Badge variant={type === 'expense' ? 'destructive' : 'default'}>
            {type === 'expense' ? 'Расход' : 'Доход'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className='flex justify-end gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onEdit(category)}
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onDelete(category)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
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
                Нет данных
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
