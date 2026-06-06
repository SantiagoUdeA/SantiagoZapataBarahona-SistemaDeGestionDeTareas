import { getSession } from '@/lib/auth/guard';
import { NavUser } from '@/components/nav-user';
import Image from 'next/image';
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

const navItems = [
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
  {
    title: 'Usuarios',
    url: '/users',
    icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
  },
];

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getSession();

  const sidebarUser = user
    ? {
        name: user.name || user.email || 'Usuario',
        email: user.email || '',
        avatar: user.image || '/avatars/default.png',
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
              <a href='/dashboard'>
                <Image src='/LogoGreen.png' alt='Logo' width={72} height={72} className='' />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSecondary items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}