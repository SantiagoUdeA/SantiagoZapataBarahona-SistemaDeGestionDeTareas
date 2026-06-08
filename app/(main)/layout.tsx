// Layout for protected routes (main app)
// Wraps authenticated pages with:
// - Sidebar navigation
// - Top bar (header with logout, settings)
// - Toast notifications (sonner)
// - Chat provider for AI assistant
// - Tooltip provider for UI hints

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
              // CSS custom properties for responsive sidebar sizing
              // Sidebar: 72 spacing units (18rem / 288px at base)
              // Header: 12 spacing units (3rem / 48px)
              '--sidebar-width': 'calc(var(--spacing) * 72)',
              '--header-height': 'calc(var(--spacing) * 12)',
            } as React.CSSProperties
          }
        >
          {/* Left sidebar with navigation */}
          <AppSidebar variant='inset' />
          
          {/* Main content area */}
          <SidebarInset>
            {/* Top header bar */}
            <TopBar />
            
            {/* Page content */}
            {children}
            
            {/* Toast notifications */}
            <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </ChatProvider>
    </TooltipProvider>
  );
}
