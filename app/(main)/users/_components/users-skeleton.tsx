import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function UsersSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID de usuario</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Correo electrónico</TableHead>
          <TableHead>Fecha de creación</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className='h-4 w-20' /></TableCell>
            <TableCell><Skeleton className='h-4 w-32' /></TableCell>
            <TableCell><Skeleton className='h-4 w-40' /></TableCell>
            <TableCell><Skeleton className='h-4 w-24' /></TableCell>
            <TableCell><Skeleton className='h-5 w-20 rounded-full' /></TableCell>
            <TableCell><Skeleton className='h-4 w-16' /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
