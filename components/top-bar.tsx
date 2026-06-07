'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ChatTrigger } from './chat/chat-trigger'

export function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background pr-4">
      <div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ChatTrigger />
      </div>
    </header>
  )
}