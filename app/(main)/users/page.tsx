import { Suspense } from 'react'
import { requireRole } from '@/lib/auth/guard'
import { UsersList } from './_components/users-list'
import { UsersSkeleton } from './_components/users-skeleton'
import { CreateUserDialog } from './_components/create-user-dialog'

export default async function UsersPage() {
  const session = await requireRole('ADMIN')

  return (
    <div className='container mx-auto px-6 py-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Gestión de usuarios</h2>
          <p className='text-muted-foreground'>
            Gestioná el acceso al sistema y los roles de toda la organización.
          </p>
        </div>
        <CreateUserDialog />
      </div>
      <Suspense fallback={<UsersSkeleton />}>
        <UsersList currentUserId={session.id} />
      </Suspense>
    </div>
  )
}
