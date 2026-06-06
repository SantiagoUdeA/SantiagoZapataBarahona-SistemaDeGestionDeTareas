'use client'

import { EditProjectDialog } from './edit-project-dialog'
import { DeleteProjectDialog } from './delete-project-dialog'

interface ProjectRowActionsProps {
  project: {
    id: string
    name: string
  }
}

export function ProjectRowActions({ project }: ProjectRowActionsProps) {
  return (
    <div className='flex gap-2'>
      <EditProjectDialog projectId={project.id} projectName={project.name} />
      <DeleteProjectDialog projectId={project.id} projectName={project.name} />
    </div>
  )
}
