import { useCreateProject } from '@/api/projects'
import { Layout } from '@/components/layout.tsx'
import { ProjectForm } from '@/components/projects/project-form'
import { useToast } from '@/components/ui/use-toast'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/projects/new')({
  component: Component,
})

function Component() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createProjectMutation = useCreateProject()

  const handleSubmit = async (data: any) => {
    try {
      await createProjectMutation.mutateAsync(data)
      toast({
        title: 'Проект создан',
        description: 'Проект успешно создан',
      })
      navigate({ to: '/projects' })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать проект',
        variant: 'destructive',
      })
    }
  }

  return (
    <Layout
      links={[
        { href: '/projects', label: 'Проекты' },
        { href: '/projects/new', label: 'Создать проект' },
      ]}
    >
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-6 text-3xl font-bold'>Создать проект</h1>
        <ProjectForm
          onSubmit={handleSubmit}
          isSubmitting={createProjectMutation.isPending}
        />
      </div>
    </Layout>
  )
}
