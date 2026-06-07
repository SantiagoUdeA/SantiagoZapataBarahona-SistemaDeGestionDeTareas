'use client'

import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from 'ai'
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PlusSignIcon,
  Cancel01Icon,
  ArrowUp01Icon,
  Refresh01Icon,
  Copy01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  Tick02Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import { useRef, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { ToolUIPart, DynamicToolUIPart } from 'ai'

interface ChatSidebarProps {
  onClose: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { messages, sendMessage, regenerate, status, stop, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && status === 'ready') {
        sendMessage({ text: input.trim() })
        setInput('')
      }
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    toast.success('Copiado')
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <Sidebar
      side="right"
      variant="floating"
      collapsible="offcanvas"
      className="bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="flex h-12 shrink-0 flex-row items-center justify-between border-b px-4">
        <Tabs defaultValue="chat">
          <TabsList className="h-8">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => setMessages([])}>
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><span>Nueva conversacion</span></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><span>Cerrar</span></TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

    

      <SidebarContent className="flex-1">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="flex flex-col gap-4 p-4">
            {error && (
              <div className="flex flex-col gap-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-3.5" />
                  <span className="font-medium">Ocurrio un error</span>
                </div>
                <p>{error.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 w-fit text-xs"
                  onClick={() => regenerate()}
                >
                  <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} className="mr-1 size-3" />
                  Reintentar
                </Button>
              </div>
            )}

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                <p>Asistente TaskFlow</p>
                <p className="text-xs">Puedes pedirme que liste proyectos, cree tareas, asigne usuarios y mas.</p>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopy}
                onRetry={() => regenerate()}
              />
            ))}
            {isLoading && messages.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Spinner className="size-3" />
                <span>Consultando...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <div className="flex flex-col gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe que quieres hacer..."
            className="min-h-[60px] max-h-[120px] resize-none text-sm"
            rows={2}
          />
          <div className="flex items-end justify-between">
            <span className="text-xs text-muted-foreground">Enter envia <br></br> Shift+Enter nueva linea</span>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Button size="sm" variant="outline" onClick={() => stop()}>
                  Detener
                </Button>
              )}
              <Button
                size="sm"
                disabled={isLoading || !input.trim() || status !== 'ready'}
                onClick={() => {
                  sendMessage({ text: input.trim() })
                  setInput('')
                }}
              >
                <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="mr-1 size-4" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

interface MessageBubbleProps {
  message: UIMessage
  onCopy: (text: string) => void
  onRetry: () => void
}

// Limpia marcadores Markdown que el modelo pueda emitir, dejando texto plano.
// Conserva listas con guion y los saltos de linea.
function toPlainText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .trim()
}

function MessageBubble({ message, onCopy, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const textParts = message.parts.filter(isTextUIPart)
  const toolParts = message.parts.filter(isToolUIPart)

  const textContent = toPlainText(textParts.map(p => p.text).join(''))

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      {textContent && (
        <div
          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
            isUser
              ? 'bg-indigo-500 text-white'
              : 'bg-surface-container-low text-foreground'
          }`}
        >
          {textContent}
        </div>
      )}

      {toolParts.length > 0 && (
        <div className="flex flex-col gap-1">
          {toolParts.map((part, i) => {
            if (part.type === 'dynamic-tool') {
              return <DynamicToolChip key={i} part={part as DynamicToolUIPart} />
            }
            return <ToolChip key={i} part={part as ToolUIPart} />
          })}
        </div>
      )}

      {!isUser && textContent && (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={onRetry}>
                <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><span>Reintentar</span></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={() => onCopy(textContent)}>
                <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><span>Copiar</span></TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  )
}

type ToolPartState = 'input-streaming' | 'input-available' | 'approval-requested' | 'approval-responded' | 'output-available' | 'output-error' | 'output-denied'

function getToolState(part: ToolUIPart | DynamicToolUIPart): ToolPartState {
  return (part as { state?: ToolPartState }).state as ToolPartState
}

function DynamicToolChip({ part }: { part: DynamicToolUIPart }) {
  const label = part.toolName.replace(/([A-Z])/g, ' $1').trim()
  const state = getToolState(part)
  const isLoading = state === 'input-streaming'
  const isError = state === 'output-error' || state === 'output-denied'

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
        <Spinner className="size-3" />
        <span>{label}...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-3" />
        <span>{label}: error</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3" />
      <span>{label}</span>
    </div>
  )
}

function ToolChip({ part }: { part: ToolUIPart }) {
  const toolName = part.type.replace('tool-', '')
  const label = toolName.replace(/([A-Z])/g, ' $1').trim()
  const state = getToolState(part)
  const isLoading = state === 'input-streaming'
  const isError = state === 'output-error' || state === 'output-denied'

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
        <Spinner className="size-3" />
        <span>{label}...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-3" />
        <span>{label}: error</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-3" />
      <span>{label}</span>
    </div>
  )
}
