import { useProject, useUpdateProject } from '@/api/projects'
import { Layout } from '@/components/layout.tsx'
import { ProjectForm } from '@/components/projects/project-form'
import { useToast } from '@/components/ui/use-toast'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/projects/edit/$projectId',
)({
  component: Component,
})

function Component() {
  const { projectId } = Route.useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: project, isLoading } = useProject(parseInt(projectId))
  const updateProjectMutation = useUpdateProject()

  const handleSubmit = async (data: any) => {
    try {
      await updateProjectMutation.mutateAsync({
        id: parseInt(projectId),
        data,
      })
      toast({
        title: 'Проект обновлен',
        description: 'Проект успешно обновлен',
      })
      navigate({ to: '/projects/$projectId', params: { projectId } })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить проект',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Layout
        links={[
          { href: '/projects', label: 'Проекты' },
          { href: `/projects/${projectId}`, label: 'Проект' },
          { href: `/projects/edit/${projectId}`, label: 'Редактирование' },
        ]}
      >
        <div className='flex justify-center py-8'>Загрузка...</div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout links={[{ href: '/projects', label: 'Проекты' }]}>
        <div className='py-8 text-center text-red-500'>Проект не найден</div>
      </Layout>
    )
  }

  return (
    <Layout
      links={[
        { href: '/projects', label: 'Проекты' },
        { href: `/projects/${projectId}`, label: project.name },
        { href: `/projects/edit/${projectId}`, label: 'Редактирование' },
      ]}
    >
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-6 text-3xl font-bold'>Редактировать проект</h1>
        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          isSubmitting={updateProjectMutation.isPending}
        />
      </div>
    </Layout>
  )
}
