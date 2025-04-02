import type { TransactionFilters } from '@/api/transactions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useSubscription } from '@/hooks/use-subscription'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { useState } from 'react'

interface TransactionExportProps {
  filters: TransactionFilters
  onExportCSV: (filters: TransactionFilters) => Promise<void>
  onExportExcel: (filters: TransactionFilters) => Promise<void>
}

export function TransactionExport({
  filters,
  onExportCSV,
  onExportExcel,
}: TransactionExportProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const { canAccess } = useSubscription()
  const canExport = canAccess('pro')

  const handleExportCSV = async () => {
    if (!canExport) {
      toast({
        title: 'Недоступно в вашем тарифе',
        description: 'Экспорт транзакций доступен только в тарифе Pro',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsExporting(true)
      await onExportCSV(filters)
      toast({
        title: 'Успешно',
        description: 'Файл CSV с транзакциями скачивается',
      })
    } catch (error) {
      toast({
        title: 'Ошибка при экспорте',
        description: 'Не удалось экспортировать транзакции в CSV',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportExcel = async () => {
    if (!canExport) {
      toast({
        title: 'Недоступно в вашем тарифе',
        description: 'Экспорт транзакций доступен только в тарифе Pro',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsExporting(true)
      await onExportExcel(filters)
      toast({
        title: 'Успешно',
        description: 'Файл Excel с транзакциями скачивается',
      })
    } catch (error) {
      toast({
        title: 'Ошибка при экспорте',
        description: 'Не удалось экспортировать транзакции в Excel',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          disabled={isExporting || !canExport}
          className={!canExport ? 'cursor-not-allowed opacity-50' : ''}
        >
          <Download className='mr-2 h-4 w-4' />
          Экспорт
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileText className='mr-2 h-4 w-4' />
          Экспорт в CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
          <FileSpreadsheet className='mr-2 h-4 w-4' />
          Экспорт в Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
