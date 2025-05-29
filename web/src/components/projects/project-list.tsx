import {
  useArchiveProject,
  useCompleteProject,
  useProjects,
  useUnarchiveProject,
  type Project,
} from '@/api/projects'
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
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/currency-utils'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  Edit,
  Eye,
  PlusIcon,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

export function ProjectList() {
  const [filter, setFilter] = useState<string>('all')
  const { data: projects = [], isLoading, error } = useProjects()
  const archiveProjectMutation = useArchiveProject()
  const unarchiveProjectMutation = useUnarchiveProject()
  const completeProjectMutation = useCompleteProject()
  const { toast } = useToast()

  if (isLoading) {
    return <div className='flex justify-center py-8'>Загрузка проектов...</div>
  }

  if (error) {
    return <div className='py-4 text-red-500'>Ошибка при загрузке проектов</div>
  }

  const filteredProjects = projects.filter((project: Project) => {
    if (filter === 'all') return true
    if (filter === 'active') return project.status === 'open'
    if (filter === 'completed') return project.status === 'closed'
    if (filter === 'archived') return project.status === 'archived'
    return project.type === filter
  })

  const handleArchive = async (id: number) => {
    try {
      await archiveProjectMutation.mutateAsync(id)
      toast({
        title: 'Проект архивирован',
        description: 'Проект успешно перемещен в архив',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось архивировать проект',
        variant: 'destructive',
      })
    }
  }

  const handleUnarchive = async (id: number) => {
    try {
      await unarchiveProjectMutation.mutateAsync(id)
      toast({
        title: 'Проект разархивирован',
        description: 'Проект успешно восстановлен из архива',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось разархивировать проект',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await completeProjectMutation.mutateAsync(id)
      toast({
        title: 'Проект завершен',
        description: 'Проект успешно помечен как завершенный',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить проект',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant='default'>Активный</Badge>
      case 'closed':
        return <Badge variant='secondary'>Завершен</Badge>
      case 'archived':
        return <Badge variant='outline'>Архив</Badge>
      default:
        return null
    }
  }

  const getTypeBadge = (type: Project['type']) => {
    switch (type) {
      case 'saving':
        return (
          <Badge
            variant='outline'
            className='border-green-200 bg-green-50 text-green-700'
          >
            <Target className='mr-1 h-3 w-3' />
            Накопление
          </Badge>
        )
      case 'loan':
        return (
          <Badge
            variant='outline'
            className='border-red-200 bg-red-50 text-red-700'
          >
            <TrendingUp className='mr-1 h-3 w-3' />
            Кредит
          </Badge>
        )
      default:
        return null
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Проекты</h1>
        <Button asChild>
          <Link to='/projects/new'>
            <PlusIcon className='mr-2 h-4 w-4' />
            Создать проект
          </Link>
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='all'>Все</TabsTrigger>
          <TabsTrigger value='active'>Активные</TabsTrigger>
          <TabsTrigger value='completed'>Завершенные</TabsTrigger>
          <TabsTrigger value='archived'>Архив</TabsTrigger>
          <TabsTrigger value='saving'>Накопления</TabsTrigger>
          <TabsTrigger value='loan'>Кредиты</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredProjects.length === 0 ? (
        <div className='py-12 text-center'>
          <div className='text-muted-foreground mb-4'>
            {filter === 'all'
              ? 'У вас пока нет проектов'
              : 'Нет проектов в данной категории'}
          </div>
          <Button asChild>
            <Link to='/projects/new'>Создать первый проект</Link>
          </Button>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredProjects.map((project: Project) => {
            const progress = calculateProgress(
              project.currentAmount,
              project.targetAmount,
            )

            return (
              <Card
                key={project.id}
                className='transition-shadow hover:shadow-md'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-lg'>{project.name}</CardTitle>
                      <CardDescription>
                        Начат{' '}
                        {format(new Date(project.startDate), 'dd.MM.yyyy')}
                        {project.endDate &&
                          ` • До ${format(new Date(project.endDate), 'dd.MM.yyyy')}`}
                      </CardDescription>
                    </div>
                    <div className='flex gap-1'>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <div className='flex gap-2'>{getTypeBadge(project.type)}</div>
                </CardHeader>

                <CardContent className='flex-1 space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Прогресс</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className='h-2' />
                    <div className='text-muted-foreground flex justify-between text-sm'>
                      <span>{formatCurrency(project.currentAmount)}</span>
                      <span>{formatCurrency(project.targetAmount)}</span>
                    </div>
                  </div>

                  {project.tags && (
                    <div className='flex flex-wrap gap-1'>
                      {project.tags.split(',').map((tag, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs'
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {project.comments && (
                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {project.comments}
                    </p>
                  )}
                </CardContent>

                <CardFooter className='flex gap-2 pt-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    asChild
                    className='flex-1'
                  >
                    <Link
                      to='/projects/$projectId'
                      params={{ projectId: project.id.toString() }}
                    >
                      <Eye className='mr-1 h-3 w-3' />
                      Просмотр
                    </Link>
                  </Button>
                  <Button variant='outline' size='sm' asChild>
                    <Link
                      to='/projects/edit/$projectId'
                      params={{ projectId: project.id.toString() }}
                    >
                      <Edit className='mr-1 h-3 w-3' />
                      Изменить
                    </Link>
                  </Button>
                  {project.status === 'open' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleComplete(project.id)}
                      disabled={completeProjectMutation.isPending}
                    >
                      <CheckCircle className='h-3 w-3' />
                    </Button>
                  )}
                  {project.status === 'open' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleArchive(project.id)}
                      disabled={archiveProjectMutation.isPending}
                    >
                      <Archive className='h-3 w-3' />
                    </Button>
                  )}
                  {project.status === 'archived' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleUnarchive(project.id)}
                      disabled={unarchiveProjectMutation.isPending}
                    >
                      <ArchiveRestore className='h-3 w-3' />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
