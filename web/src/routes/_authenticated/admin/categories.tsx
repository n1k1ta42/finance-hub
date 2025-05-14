import {
  useAllUsersCategories,
  type AdminCategory,
  type CategoryType,
} from '@/api/categories'
import { useAllUsers } from '@/api/user'
import { AdminRouteGuard } from '@/components/admin-route-guard'
import { Layout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { RefreshCcw } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/admin/categories')({
  component: AdminCategoriesPage,
})

function AdminCategoriesPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>()
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    refetch,
  } = useAllUsersCategories(selectedUserId)
  const { data: usersData, isLoading: isLoadingUsers } = useAllUsers()

  const getCategoryTypeBadge = (type: CategoryType) => {
    return type === 'expense' ? (
      <Badge variant='destructive'>Расход</Badge>
    ) : (
      <Badge variant='success'>Доход</Badge>
    )
  }

  return (
    <Layout
      links={[{ href: '/admin/categories', label: 'Категории пользователей' }]}
    >
      <AdminRouteGuard>
        <div className='container py-8'>
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>Категории пользователей</h1>
              <p className='text-muted-foreground'>
                Просмотр всех категорий, созданных пользователями системы
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetch()}
                disabled={isLoadingCategories}
              >
                <RefreshCcw className='mr-2 h-4 w-4' />
                Обновить
              </Button>
            </div>
          </div>

          <div className='mb-6'>
            <Card>
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
                <CardDescription>
                  Фильтрация категорий по пользователям
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex gap-4'>
                  <div className='w-64'>
                    <Select
                      value={selectedUserId?.toString() || 'all'}
                      onValueChange={value =>
                        setSelectedUserId(
                          value !== 'all' ? parseInt(value) : undefined,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Выберите пользователя' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Все пользователи</SelectItem>
                        {usersData?.users.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Список категорий</CardTitle>
              <CardDescription>
                {selectedUserId
                  ? 'Категории выбранного пользователя'
                  : 'Категории всех пользователей системы'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCategories || isLoadingUsers ? (
                <div className='flex h-64 items-center justify-center'>
                  <div className='border-primary h-12 w-12 animate-spin rounded-full border-b-2' />
                </div>
              ) : categories.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center'>
                  Категорий не найдено
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Создана</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category: AdminCategory) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>
                          {category.userFirstName} {category.userLastName}{' '}
                          <br />
                          <span className='text-muted-foreground text-xs'>
                            {category.userEmail}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {category.icon && (
                              <span style={{ color: category.color || '#000' }}>
                                {category.icon}
                              </span>
                            )}
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          {getCategoryTypeBadge(category.type)}
                        </TableCell>
                        <TableCell>{formatDate(category.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminRouteGuard>
    </Layout>
  )
}
