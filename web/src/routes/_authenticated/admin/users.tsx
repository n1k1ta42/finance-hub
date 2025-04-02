import { useAllUsers } from '@/api/user'
import { AdminRouteGuard } from '@/components/admin-route-guard'
import { Layout } from '@/components/layout.tsx'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import { formatDate } from '@/lib/date-utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PencilIcon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: UsersPage,
})

function UsersPage() {
  return (
    <Layout links={[{ href: '/admin/users', label: 'Пользователи' }]}>
      <AdminRouteGuard>
        <div className='container py-8'>
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>Пользователи</h1>
              <p className='text-muted-foreground'>
                Управление пользователями системы
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Список пользователей</CardTitle>
              <CardDescription>
                Здесь вы можете видеть всех пользователей системы и управлять их
                ролями
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </div>
      </AdminRouteGuard>
    </Layout>
  )
}

function UsersTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebounce(searchQuery, 500)
  const itemsPerPage = 25

  const { data, isLoading, error } = useAllUsers({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
  })

  // Сбрасываем страницу при изменении поискового запроса
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  if (isLoading) {
    return <div className='py-4 text-center'>Загрузка данных...</div>
  }

  if (error) {
    return (
      <div className='text-destructive py-4 text-center'>
        Ошибка при загрузке данных
      </div>
    )
  }

  if (!data || !data.users || data.users.length === 0) {
    return <div className='py-4 text-center'>Нет данных для отображения</div>
  }

  // Функция для генерации элементов пагинации
  const getPaginationItems = () => {
    const items = []
    const totalPages = data.meta?.total_pages || 1
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, просто показываем все
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    } else {
      // Добавляем первую страницу
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      )

      // Добавляем многоточие перед текущей страницей, если нужно
      if (currentPage > 3) {
        items.push(
          <PaginationItem key='ellipsis-start'>
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Добавляем страницы вокруг текущей
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }

      // Добавляем многоточие после текущей страницы, если нужно
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key='ellipsis-end'>
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      // Добавляем последнюю страницу
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center'>
        <div className='relative w-full max-w-sm'>
          <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
          <Input
            type='search'
            placeholder='Поиск по имени или почте...'
            className='pl-8'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='text-muted-foreground ml-2 text-sm'>
          {data.meta?.total || 0} пользователей
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Фамилия</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Дата регистрации</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs ${
                    user.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant='ghost'
                  size='icon'
                  asChild
                  title='Редактировать'
                >
                  <Link
                    to='/admin/users/$userId'
                    params={{
                      userId: String(user.id),
                    }}
                  >
                    <PencilIcon className='h-4 w-4' />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(data.meta?.total_pages || 0) > 1 && (
        <Pagination className='mt-4'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  currentPage > 1 && setCurrentPage(prev => prev - 1)
                }
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {getPaginationItems()}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < (data.meta?.total_pages || 1) &&
                  setCurrentPage(prev => prev + 1)
                }
                aria-disabled={currentPage === (data.meta?.total_pages || 1)}
                className={
                  currentPage === (data.meta?.total_pages || 1)
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
