import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function MovementsSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha y hora</TableHead>
          <TableHead>Quién</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Tarea</TableHead>
          <TableHead>Detalle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
