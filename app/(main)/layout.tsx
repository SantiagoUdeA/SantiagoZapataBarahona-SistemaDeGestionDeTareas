import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TopBar } from '@/components/top-bar';
import { ChatProvider } from '@/components/chat/chat-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <ChatProvider>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties
          }
        >
          <AppSidebar variant='inset' />
          <SidebarInset>
            <TopBar />
            {children}
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </ChatProvider>
    </TooltipProvider>
  );
}
