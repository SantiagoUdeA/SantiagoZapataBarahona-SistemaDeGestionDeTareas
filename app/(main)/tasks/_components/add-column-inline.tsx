'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createColumn } from '../actions'

interface AddColumnInlineProps {
  projectId: string
}

export function AddColumnInline({ projectId }: AddColumnInlineProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleCancel() {
    setOpen(false)
    setName('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      const result = await createColumn(projectId, name.trim())
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success('Columna creada')
        setName('')
        setOpen(false)
        router.refresh()
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex w-72 shrink-0 items-center gap-2 rounded-xl border border-dashed bg-background/60 px-4 py-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4 shrink-0" />
        Agregar otra lista
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-72 shrink-0 space-y-2 rounded-xl border bg-background p-3 shadow-sm"
    >
      <Input
        ref={inputRef}
        placeholder="Introduce el nombre de la lista..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={pending}
        onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending || !name.trim()}>
          {pending ? 'Agregando...' : 'Agregar lista'}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={handleCancel}
          disabled={pending}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
        </Button>
      </div>
    </form>
  )
}
