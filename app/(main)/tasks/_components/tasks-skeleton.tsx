import { Skeleton } from '@/components/ui/skeleton'

function ColumnSkeleton() {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-muted/30 px-3 py-2.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-6 rounded-full" />
      </div>
      {/* Cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 p-3 space-y-2"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TasksSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <ColumnSkeleton />
      <ColumnSkeleton />
      <ColumnSkeleton />
    </div>
  )
}
