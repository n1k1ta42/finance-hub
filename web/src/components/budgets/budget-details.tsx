import { useBudget, useDeleteBudget } from '@/api/budgets.ts'
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast.ts'
import { formatCurrency } from '@/lib/currency-utils'
import { Link, useNavigate } from '@tanstack/react-router'
import { Edit2Icon, TrashIcon } from 'lucide-react'

interface BudgetDetailsProps {
  budgetId: number
}

export function BudgetDetails({ budgetId }: BudgetDetailsProps) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: budget, isLoading, error } = useBudget(budgetId)

  const deleteMutation = useDeleteBudget()

  const handleDelete = () => {
    deleteMutation.mutate(budgetId, {
      onSuccess: () => {
        toast({
          title: 'Успех!',
          description: 'Бюджет успешно удален',
        })
        navigate({ to: '/budgets' })
      },
      onError: error => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось удалить бюджет',
          variant: 'destructive',
        })
        console.error(error)
      },
    })
  }

  if (isLoading) {
    return <div className='flex justify-center py-8'>Загрузка бюджета...</div>
  }

  if (error || !budget) {
    return <div className='py-4 text-red-500'>Ошибка при загрузке бюджета</div>
  }

  const progress = (budget.spent / budget.amount) * 100
  const startDate = new Date(budget.startDate).toLocaleDateString()
  const endDate = new Date(budget.endDate).toLocaleDateString()

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-2xl'>{budget.name}</CardTitle>
            <CardDescription>
              {startDate} - {endDate}
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='icon' asChild>
              <Link
                from='/budgets/$budgetId'
                to='/budgets/edit/$budgetId'
                params={{ budgetId: String(budgetId) }}
              >
                <Edit2Icon className='h-4 w-4' />
              </Link>
            </Button>
            <DeleteBudgetDialog onDelete={handleDelete} />
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div>
          <div className='mb-2 flex justify-between'>
            <span className='text-muted-foreground'>Период</span>
            <Badge>{formatPeriod(budget.period)}</Badge>
          </div>
          <Separator />
        </div>

        <div>
          <div className='mb-2 flex justify-between'>
            <span className='text-muted-foreground'>Категория</span>
            {budget.category ? (
              <Badge
                variant='outline'
                style={{ backgroundColor: `${budget.category.color}20` }}
              >
                {budget.category.name}
              </Badge>
            ) : (
              <span>Не указана</span>
            )}
          </div>
          <Separator />
        </div>

        <div>
          <h3 className='mb-2 font-medium'>Прогресс</h3>
          <div className='mb-2 flex justify-between'>
            <span className='text-muted-foreground'>Потрачено</span>
            <span className='font-medium'>
              {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
            </span>
          </div>
          <Progress value={progress} className='h-3' />
          <div className='text-muted-foreground mt-2 text-right text-sm'>
            Осталось: {formatCurrency(budget.amount - budget.spent)}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant='outline' className='w-full' asChild>
          <Link to='/budgets'>Вернуться к списку</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

interface DeleteBudgetDialogProps {
  onDelete: () => void
}

function DeleteBudgetDialog({ onDelete }: DeleteBudgetDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon' className='text-destructive'>
          <TrashIcon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить бюджет</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить этот бюджет? Это действие нельзя
            отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Отмена</Button>
          </DialogClose>
          <Button variant='destructive' onClick={onDelete}>
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatPeriod(period: string) {
  switch (period) {
    case 'monthly':
      return 'Месячный'
    case 'weekly':
      return 'Недельный'
    case 'yearly':
      return 'Годовой'
    default:
      return period
  }
}
