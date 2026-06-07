'use client'

import { EditProjectDialog } from './edit-project-dialog'
import { DeleteProjectDialog } from './delete-project-dialog'
import { ManageMembersDialog } from './manage-members-dialog'

interface ProjectRowActionsProps {
  project: {
    id: string
    name: string
  }
  isAdmin: boolean
}

export function ProjectRowActions({ project, isAdmin }: ProjectRowActionsProps) {
  return (
    <div className='flex gap-2'>
      {isAdmin && <ManageMembersDialog projectId={project.id} projectName={project.name} />}
      <EditProjectDialog projectId={project.id} projectName={project.name} />
      <DeleteProjectDialog projectId={project.id} projectName={project.name} />
    </div>
  )
}
