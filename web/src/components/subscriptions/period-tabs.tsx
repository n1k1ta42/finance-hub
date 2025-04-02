import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PeriodTabsProps {
  value: string
  onChange: (value: string) => void
}

const periodLabels: Record<string, string> = {
  monthly: 'Месяц',
  yearly: 'Год',
  lifetime: 'Навсегда',
}

export function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <Tabs
      defaultValue={value || 'monthly'}
      value={value}
      onValueChange={onChange}
      className='mx-auto mb-6 w-full max-w-md'
    >
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='monthly'>{periodLabels.monthly}</TabsTrigger>
        <TabsTrigger value='yearly'>{periodLabels.yearly}</TabsTrigger>
        <TabsTrigger value='lifetime'>{periodLabels.lifetime}</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
