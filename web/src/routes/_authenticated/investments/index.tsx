import { InvestmentList } from '@/components/investments/investment-list'
import { Layout } from '@/components/layout.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/investments/')({
  component: Component,
})

function Component() {
  return (
    <Layout links={[{ href: '/investments', label: 'Инвестиции' }]}>
      <InvestmentList />
    </Layout>
  )
}
