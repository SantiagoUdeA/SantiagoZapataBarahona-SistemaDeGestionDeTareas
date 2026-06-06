import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ProjectsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className='h-4 w-20' /></TableCell>
            <TableCell><Skeleton className='h-4 w-32' /></TableCell>
            <TableCell><Skeleton className='h-4 w-24' /></TableCell>
            <TableCell><Skeleton className='h-4 w-28' /></TableCell>
            <TableCell><Skeleton className='h-4 w-16' /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
