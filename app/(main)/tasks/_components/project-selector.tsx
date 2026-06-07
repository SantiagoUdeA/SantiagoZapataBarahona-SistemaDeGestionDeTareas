'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProjectSelectorProps {
  projects: Array<{ id: string; name: string }>
  selected?: string
}

export function ProjectSelector({ projects, selected }: ProjectSelectorProps) {
  const router = useRouter()

  function handleChange(projectId: string) {
    router.push(`/tasks?projectId=${projectId}`)
  }

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='Seleccioná un proyecto' />
      </SelectTrigger>
      <SelectContent>
        {projects.length === 0 && (
          <div className='px-2 py-1.5 text-sm text-muted-foreground'>No tenés proyectos disponibles</div>
        )}
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
