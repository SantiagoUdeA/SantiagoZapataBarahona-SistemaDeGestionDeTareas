'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ChatSidebar } from './chat-panel'

interface ChatContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return (
    <ChatContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <SidebarProvider
        open={isOpen}
        onOpenChange={setIsOpen}
        style={{ '--sidebar-width': '28rem' } as CSSProperties}
      >
        <ChatSidebar onClose={close} />
      </SidebarProvider>
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used inside ChatProvider')
  return ctx
}