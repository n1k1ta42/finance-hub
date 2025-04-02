import type { PlanInfo } from '@/api/user'
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
import { formatCurrency } from '@/lib/currency-utils'
import { Check } from 'lucide-react'

const planLabels: Record<string, string> = {
  basic: 'Базовый',
  premium: 'Премиум',
  pro: 'Профессиональный',
}

interface PlanCardProps {
  plan: PlanInfo
  isCurrent?: boolean
  isExpired?: boolean
  onSelect: (plan: PlanInfo) => void
  disabled?: boolean
}

export function PlanCard({
  plan,
  isCurrent,
  isExpired,
  onSelect,
  disabled,
}: PlanCardProps) {
  // Цвета для разных планов
  const planStyles: Record<string, string> = {
    basic: 'border-blue-200 dark:border-blue-900',
    premium: 'border-indigo-200 dark:border-indigo-900',
    pro: 'border-purple-200 dark:border-purple-900',
  }

  const headerBg: Record<string, string> = {
    basic: 'bg-blue-50 dark:bg-blue-900/20',
    premium: 'bg-indigo-50 dark:bg-indigo-900/20',
    pro: 'bg-purple-50 dark:bg-purple-900/20',
  }

  return (
    <Card
      className={`h-full transition-all duration-300 ${
        isCurrent
          ? `border-2 ${planStyles[plan.plan] || ''} shadow-lg`
          : 'hover:shadow-md'
      }`}
    >
      <CardHeader className={headerBg[plan.plan] || ''}>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl'>
            {planLabels[plan.plan] || plan.plan}
          </CardTitle>
          {isCurrent && (
            <Badge variant={isExpired ? 'destructive' : 'default'}>
              {isExpired ? 'Истекла' : 'Текущий план'}
            </Badge>
          )}
        </div>
        <CardDescription>
          {plan.description ||
            `Подходит для ${plan.plan === 'basic' ? 'начинающих' : plan.plan === 'premium' ? 'продвинутых' : 'профессионалов'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 space-y-4'>
        <div className='text-3xl font-bold'>
          {formatCurrency(plan.price)}
          <span className='text-muted-foreground text-sm font-normal'>
            /
            {plan.period === 'lifetime'
              ? ''
              : plan.period === 'monthly'
                ? 'мес.'
                : 'год'}
          </span>
        </div>

        <div className='space-y-2'>
          {plan.features.map((feature, index) => (
            <div key={index} className='flex items-center gap-2'>
              <Check className='h-4 w-4 text-green-500' />
              <span className='text-sm'>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className='w-full'
          disabled={disabled || (isCurrent && !isExpired)}
          onClick={() => onSelect(plan)}
          variant={isCurrent && !isExpired ? 'outline' : 'default'}
        >
          {isCurrent && !isExpired ? 'Текущий план' : 'Выбрать план'}
        </Button>
      </CardFooter>
    </Card>
  )
}
