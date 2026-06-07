import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function TasksSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Creada por</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className='h-4 w-20' /></TableCell>
            <TableCell><Skeleton className='h-4 w-40' /></TableCell>
            <TableCell><Skeleton className='h-4 w-28' /></TableCell>
            <TableCell><Skeleton className='h-4 w-28' /></TableCell>
            <TableCell><Skeleton className='h-4 w-20' /></TableCell>
            <TableCell><Skeleton className='h-4 w-24' /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
