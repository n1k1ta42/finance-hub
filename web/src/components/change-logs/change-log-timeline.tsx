import {
  getActionLabel,
  getEntityTypeLabel,
  type ChangeLogEntry,
} from '@/api/change-logs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Archive, Edit, Plus, Trash2 } from 'lucide-react'

interface ChangeLogTimelineProps {
  entries: ChangeLogEntry[]
  showEntityInfo?: boolean
}

export function ChangeLogTimeline({
  entries,
  showEntityInfo = false,
}: ChangeLogTimelineProps) {
  if (!entries.length) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        Нет записей в истории изменений
      </div>
    )
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className='h-4 w-4 text-green-500' />
      case 'update':
        return <Edit className='h-4 w-4 text-blue-500' />
      case 'delete':
        return <Trash2 className='h-4 w-4 text-red-500' />
      case 'archive':
        return <Archive className='h-4 w-4 text-yellow-500' />
      default:
        return null
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 border-green-200 text-green-800'
      case 'update':
        return 'bg-blue-100 border-blue-200 text-blue-800'
      case 'delete':
        return 'bg-red-100 border-red-200 text-red-800'
      case 'archive':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'не указано'
    }

    if (typeof value === 'boolean') {
      return value ? 'да' : 'нет'
    }

    if (typeof value === 'number') {
      return value.toLocaleString('ru-RU')
    }

    if (typeof value === 'string') {
      // Проверяем типы операций
      if (value === 'deposit') return 'Депозит'
      if (value === 'withdrawal') return 'Снятие'
      if (value === 'capitalization') return 'Капитализация'

      // Проверяем типы проектов
      if (value === 'saving') return 'Накопление'
      if (value === 'loan') return 'Кредит'

      // Проверяем типы инвестиций
      if (value === 'security') return 'Ценная бумага'
      if (value === 'realty') return 'Недвижимость'

      // Проверяем статусы
      if (value === 'open') return 'Открыт'
      if (value === 'closed') return 'Закрыт'
      if (value === 'archived') return 'Архивирован'

      // Проверяем, является ли строка датой
      const dateRegex = /^\d{4}-\d{2}-\d{2}/
      if (dateRegex.test(value)) {
        try {
          const date = new Date(value)
          return format(date, 'dd.MM.yyyy', { locale: ru })
        } catch {
          return value
        }
      }
    }

    return String(value)
  }

  const formatChanges = (changes: Record<string, any>) => {
    if (!changes || Object.keys(changes).length === 0) {
      return null
    }

    if (changes.action && changes.action !== 'Обновлено') {
      // Для создания показываем информацию об объекте
      if (changes.action === 'Создано' && changes.data) {
        return (
          <div className='space-y-2 text-sm'>
            <div className='text-foreground font-medium'>Детали:</div>
            <div className='bg-muted/50 rounded-md p-2'>
              {formatObjectData(changes.data)}
            </div>
          </div>
        )
      }

      return (
        <div className='text-muted-foreground text-sm'>{changes.action}</div>
      )
    }

    if (changes.fields && Object.keys(changes.fields).length > 0) {
      return (
        <div className='space-y-2 text-sm'>
          <div className='text-foreground font-medium'>Изменения:</div>
          {Object.entries(changes.fields).map(
            ([field, change]: [string, any]) => (
              <div key={field} className='bg-muted/50 rounded-md p-2'>
                <div className='text-foreground mb-1 font-medium'>{field}</div>
                <div className='text-muted-foreground flex flex-col gap-1'>
                  {typeof change === 'object' && change.old !== undefined ? (
                    <>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-xs'>
                          Было:
                        </span>
                        <span className='line-through'>
                          {formatValue(change.old)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-xs'>
                          Стало:
                        </span>
                        <span className='text-foreground font-medium'>
                          {formatValue(change.new)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span>{formatValue(change)}</span>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )
    }

    return null
  }

  const formatObjectData = (data: any) => {
    if (!data || typeof data !== 'object') {
      return null
    }

    // Используем универсальный список полей для отображения
    const fieldsToShow = [
      'amount',
      'date',
      'comment',
      'type',
      'name',
      'targetAmount',
      'currentAmount',
      'capitalization',
    ]

    return (
      <div className='space-y-2'>
        {fieldsToShow.map(field => {
          if (
            data[field] !== undefined &&
            data[field] !== null &&
            data[field] !== ''
          ) {
            return (
              <div key={field} className='flex items-center justify-between'>
                <span className='text-muted-foreground text-xs capitalize'>
                  {getFieldDisplayName(field)}:
                </span>
                <span className='font-medium'>{formatValue(data[field])}</span>
              </div>
            )
          }
          return null
        })}
      </div>
    )
  }

  const getFieldDisplayName = (field: string) => {
    const fieldNames: Record<string, string> = {
      amount: 'Сумма',
      date: 'Дата',
      comment: 'Комментарий',
      type: 'Тип',
      name: 'Название',
      targetAmount: 'Целевая сумма',
      currentAmount: 'Текущая сумма',
      capitalization: 'Капитализация',
    }

    return fieldNames[field] || field
  }

  return (
    <div className='space-y-4'>
      {entries.map((entry, index) => (
        <div key={entry.id} className='flex gap-4'>
          {/* Timeline line */}
          <div className='flex flex-col items-center'>
            <div className='border-border bg-background flex h-8 w-8 items-center justify-center rounded-full border-2'>
              {getActionIcon(entry.action)}
            </div>
            {index < entries.length - 1 && (
              <div className='bg-border mt-2 min-h-4 w-px flex-1' />
            )}
          </div>

          {/* Content */}
          <div className='flex-1 pb-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex items-start justify-between'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Badge className={getActionColor(entry.action)}>
                        {getActionLabel(entry.action)}
                      </Badge>
                      {showEntityInfo && (
                        <Badge variant='outline'>
                          {getEntityTypeLabel(entry.entityType)}
                        </Badge>
                      )}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      {format(
                        new Date(entry.createdAt),
                        'dd MMMM yyyy, HH:mm',
                        {
                          locale: ru,
                        },
                      )}
                    </div>
                    {entry.entityName && (
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-xs'>
                          {getEntityTypeLabel(entry.entityType)}:
                        </span>
                        <span className='text-foreground text-sm font-medium'>
                          {entry.entityName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <>
                    <Separator className='my-3' />
                    {formatChanges(entry.changes)}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  )
}
