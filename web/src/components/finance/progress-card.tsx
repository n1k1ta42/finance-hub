import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ProgressCardProps {
  title: string
  description?: string
  progress: number
  progressLabel?: string
  showMarkers?: boolean
}

export function ProgressCard({
  title,
  description,
  progress,
  progressLabel,
  showMarkers = false,
}: ProgressCardProps) {
  const normalizedProgress = Math.max(0, Math.min(progress, 100))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>Прогресс</span>
            {progressLabel && (
              <span className='font-medium'>{progressLabel}</span>
            )}
          </div>
          <Progress value={normalizedProgress} className='h-3' />

          {showMarkers && (
            <div className='text-muted-foreground flex justify-between text-xs'>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
