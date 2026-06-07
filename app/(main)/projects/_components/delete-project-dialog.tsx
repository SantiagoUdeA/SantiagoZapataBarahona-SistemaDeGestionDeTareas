'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteProject } from '../actions'

interface DeleteProjectDialogProps {
  projectId: string
  projectName: string
}

export function DeleteProjectDialog({
  projectId,
  projectName,
}: DeleteProjectDialogProps) {
  async function handleDelete() {
    try {
      const result = await deleteProject(projectId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Proyecto eliminado')
      }
    } catch (err) {
      toast.error('Error al eliminar el proyecto')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar "{projectName}"? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
