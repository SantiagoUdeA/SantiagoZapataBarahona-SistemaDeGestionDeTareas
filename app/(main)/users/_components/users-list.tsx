import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getUsers } from '../queries'
import { RoleSelect } from './role-select'
import { UserRowActions } from './user-row-actions'

function initials(name: string | null, email: string) {
  const source = name?.trim() || email
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

export async function UsersList({ currentUserId }: { currentUserId: string }) {
  const users = await getUsers(currentUserId)

  if (users.length === 0) {
    return (
      <div className='py-16 text-center text-sm text-muted-foreground'>
        Todavía no hay usuarios.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID de usuario</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Correo electrónico</TableHead>
          <TableHead>Fecha de creación</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead className='text-right'>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className='font-mono text-xs text-muted-foreground'>
              {user.id.substring(0, 8).toUpperCase()}
            </TableCell>
            <TableCell>
              <div className='flex items-center gap-3'>
                <Avatar className='h-8 w-8'>
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName ?? user.email} />}
                  <AvatarFallback className='text-xs'>
                    {initials(user.fullName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>{user.fullName || 'Usuario sin nombre'}</span>
                  {!user.enabled && (
                    <Badge variant='outline' className='w-fit text-[0.625rem]'>Deshabilitado</Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className='text-sm text-muted-foreground'>{user.email}</TableCell>
            <TableCell className='text-sm text-muted-foreground'>{formatDate(user.createdAt)}</TableCell>
            <TableCell>
              <RoleSelect userId={user.id} role={user.role} />
            </TableCell>
            <TableCell className='text-right'>
              <UserRowActions userId={user.id} email={user.email} enabled={user.enabled} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
