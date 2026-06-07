'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HugeiconsIcon } from '@hugeicons/react'
import { PanelLeftOpenIcon, PanelLeftCloseIcon } from '@hugeicons/core-free-icons'
import { useChat } from './chat-provider'

export function ChatTrigger() {
  const { isOpen, toggle } = useChat()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Cerrar asistente IA' : 'Abrir asistente IA'}
          className="relative"
        >
          <HugeiconsIcon
            icon={isOpen ? PanelLeftCloseIcon : PanelLeftOpenIcon}
            strokeWidth={2}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>Asistente IA</span>
        <span className="ml-1 text-muted-foreground">⌘J</span>
      </TooltipContent>
    </Tooltip>
  )
}