import { Layout } from '@/components/layout.tsx'
import { ProjectList } from '@/components/projects/project-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/projects/')({
  component: Component,
})

function Component() {
  return (
    <Layout links={[{ href: '/projects', label: 'Проекты' }]}>
      <ProjectList />
    </Layout>
  )
}
