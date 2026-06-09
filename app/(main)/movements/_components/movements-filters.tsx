'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  CREATED: 'Creación',
  UPDATED: 'Edición',
  COLUMN_CHANGED: 'Cambio de columna',
  REORDERED: 'Reordenamiento',
  DELETED: 'Eliminación',
}

interface MovementsFiltersProps {
  projects: { id: string; name: string }[]
}

export function MovementsFilters({ projects }: MovementsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentProject = searchParams.get('projectId') ?? ''
  const currentType = searchParams.get('type') ?? ''

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/movements?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={currentProject}
        onValueChange={(val) => update('projectId', val === '__all__' ? '' : val)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los proyectos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los proyectos</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentType}
        onValueChange={(val) => update('type', val === '__all__' ? '' : val)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los tipos</SelectItem>
          {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
