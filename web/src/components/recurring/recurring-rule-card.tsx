import {
  useDeleteRecurringRule,
  useToggleRecurringRule,
  type RecurringRule,
} from '@/api/recurring'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/currency-utils'
import { Edit, MoreVertical, Pause, Play, Repeat, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { RecurringRuleForm } from './recurring-rule-form'

interface RecurringRuleCardProps {
  rule: RecurringRule
}

export function RecurringRuleCard({ rule }: RecurringRuleCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const deleteMutation = useDeleteRecurringRule()
  const toggleMutation = useToggleRecurringRule()

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Ежедневно'
      case 'weekly':
        return 'Еженедельно'
      case 'monthly':
        return 'Ежемесячно'
      case 'yearly':
        return 'Ежегодно'
      default:
        return frequency
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync(rule.id)
      toast({
        title: rule.isActive
          ? 'Правило приостановлено'
          : 'Правило активировано',
        description: rule.isActive
          ? 'Автоматические транзакции больше не будут создаваться'
          : 'Автоматические транзакции возобновлены',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось изменить статус правила',
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить это правило?')) {
      return
    }

    try {
      await deleteMutation.mutateAsync(rule.id)
      toast({
        title: 'Правило удалено',
        description: 'Регулярный платеж успешно удален',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось удалить правило',
      })
    }
  }

  return (
    <Card className={`${!rule.isActive ? 'opacity-60' : ''}`}>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-base leading-none'>
              {rule.description}
            </CardTitle>
            <CardDescription className='flex items-center gap-2'>
              <span
                className='inline-block h-2 w-2 rounded-full'
                style={{ backgroundColor: rule.category.color }}
              />
              {rule.category.name}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={e => e.preventDefault()}>
                    <Edit className='mr-2 h-4 w-4' />
                    Редактировать
                  </DropdownMenuItem>
                </DialogTrigger>
              </Dialog>
              <DropdownMenuItem onClick={handleToggle}>
                {rule.isActive ? (
                  <>
                    <Pause className='mr-2 h-4 w-4' />
                    Приостановить
                  </>
                ) : (
                  <>
                    <Play className='mr-2 h-4 w-4' />
                    Активировать
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='pb-3'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Сумма:</span>
            <span className='font-medium'>{formatCurrency(rule.amount)}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Частота:</span>
            <Badge variant='outline'>
              <Repeat className='mr-1 h-3 w-3' />
              {formatFrequency(rule.frequency)}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Следующая:</span>
            <span className='text-sm'>{formatDate(rule.nextExecuteDate)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className='pt-3'>
        <div className='flex w-full items-center justify-between'>
          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
            {rule.isActive ? 'Активно' : 'Приостановлено'}
          </Badge>
          {rule.endDate && (
            <span className='text-muted-foreground text-xs'>
              До {formatDate(rule.endDate)}
            </span>
          )}
        </div>
      </CardFooter>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Редактирование регулярного платежа</DialogTitle>
          </DialogHeader>
          <RecurringRuleForm
            rule={rule}
            onSuccess={() => setIsEditDialogOpen(false)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
