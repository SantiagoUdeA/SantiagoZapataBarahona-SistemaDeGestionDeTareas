import { Card } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FolderOpenIcon,
  Clock01Icon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons'
import { getDashboardMetrics } from '../queries'

export async function DashboardMetrics({
  userId,
  isAdmin,
}: {
  userId: string
  isAdmin: boolean
}) {
  const { activeProjects, inProgressTasks, completedLast30d } =
    await getDashboardMetrics(userId, isAdmin)

  const metrics = [
    {
      label: 'Proyectos activos',
      value: activeProjects,
      icon: FolderOpenIcon,
      color: 'text-primary',
    },
    {
      label: 'Tareas en curso',
      value: inProgressTasks,
      icon: Clock01Icon,
      color: 'text-accent',
    },
    {
      label: 'Completadas (30d)',
      value: completedLast30d,
      icon: CheckmarkCircle01Icon,
      color: 'text-muted-foreground',
    },
  ] as const

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {metrics.map((metric) => (
        <Card key={metric.label} className='p-6'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              <HugeiconsIcon icon={metric.icon} size={16} />
              {metric.label}
            </div>
            <div className={`text-4xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
