// App sidebar component
// Displays navigation menu with role-based item visibility
// ADMIN users see additional "Usuarios" menu item
// Uses shadcn sidebar primitives with Hugeicons for icons

import { getSession } from '@/lib/auth/guard';
import { NavUser } from '@/components/nav-user';
import { Logo } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import { DashboardSquare01Icon, CommandIcon, Folder01Icon, UserGroupIcon, Settings05Icon, HelpCircleIcon, SearchIcon } from '@hugeicons/core-free-icons';
import { NavSecondary } from '@/components/nav-secondary';

// Base navigation items visible to all authenticated users
const baseNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
  },
  {
    title: 'Proyectos',
    url: '/projects',
    icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
  },
  {
    title: 'Tareas',
    url: '/tasks',
    icon: <HugeiconsIcon icon={CommandIcon} strokeWidth={2} />,
  },
];

// Admin-only navigation items
// Only visible to users with ADMIN role
const adminNavItems = [
  {
    title: 'Usuarios',
    url: '/users',
    icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
  },
];

// Main sidebar component (Server Component)
// Fetches current session to determine which nav items to display
// Dynamically builds user info for the sidebar footer
export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getSession();

  // Role-based menu construction: ADMIN gets admin items, USER gets base items only
  const navItems = user?.role === 'ADMIN' ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  // Build user info for sidebar footer
  // Falls back to guest if no session exists
  const sidebarUser = user
    ? {
        name: user.fullName || user.email || 'Usuario',
        email: user.email || '',
        avatar: user.avatarUrl || '/avatars/default.png',
      }
    : {
        name: 'Invitado',
        email: '',
        avatar: '/avatars/default.png',
      };

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <Logo href='/dashboard' size='md' />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Render navigation items */}
        <NavSecondary items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {/* User info + logout button */}
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}