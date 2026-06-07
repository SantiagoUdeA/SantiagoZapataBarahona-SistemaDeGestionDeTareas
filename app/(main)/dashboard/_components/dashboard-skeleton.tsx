import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DashboardMetricsSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className='p-6'>
          <div className='flex flex-col gap-3'>
            <Skeleton className='h-3 w-32' />
            <Skeleton className='h-9 w-16' />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function DashboardProjectsSkeleton() {
  return (
    <div className='overflow-hidden rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow className='border-b bg-card hover:bg-transparent'>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Proyecto
            </TableHead>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Progreso
            </TableHead>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Estado
            </TableHead>
            <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              Responsable
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='bg-card'>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className='h-4 w-40' /></TableCell>
              <TableCell><Skeleton className='h-2 w-32' /></TableCell>
              <TableCell><Skeleton className='h-5 w-20 rounded-full' /></TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-6 w-6 rounded-full' />
                  <Skeleton className='h-4 w-28' />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
