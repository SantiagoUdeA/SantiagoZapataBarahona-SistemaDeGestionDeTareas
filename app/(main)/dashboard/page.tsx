'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FolderOpenIcon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  PlusSignIcon,
  SlidersHorizontalIcon,
  MoreVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@hugeicons/core-free-icons';

const METRICS = [
  { label: 'Active Projects', value: 24, icon: FolderOpenIcon, color: 'text-primary' },
  { label: 'Pending Review', value: 7, icon: Clock01Icon, color: 'text-accent' },
  { label: 'Completed (30d)', value: 12, icon: CheckmarkCircle01Icon, color: 'text-muted-foreground' },
] as const;

const PROJECTS = [
  {
    id: 'PRJ-1042',
    name: 'Website Redesign',
    progress: 75,
    status: 'In Progress' as const,
    owner: 'Sarah J.',
    ownerInitials: 'SJ',
  },
  {
    id: 'PRJ-1043',
    name: 'Q3 Marketing Campaign',
    progress: 100,
    status: 'Completed' as const,
    owner: 'David M.',
    ownerInitials: 'DM',
  },
  {
    id: 'PRJ-1044',
    name: 'Database Migration Phase 2',
    progress: 15,
    status: 'Pending' as const,
    owner: 'Alex A.',
    ownerInitials: 'AA',
  },
];

function getStatusColor(status: 'In Progress' | 'Completed' | 'Pending') {
  switch (status) {
    case 'In Progress':
      return 'bg-accent/10 text-accent';
    case 'Completed':
      return 'bg-primary/10 text-primary';
    case 'Pending':
      return 'bg-muted text-muted-foreground';
  }
}

function getProgressColor(status: 'In Progress' | 'Completed' | 'Pending') {
  switch (status) {
    case 'In Progress':
      return 'bg-accent';
    case 'Completed':
      return 'bg-primary';
    case 'Pending':
      return 'bg-muted-foreground/40';
  }
}

export default function DashboardPage() {
  return (
    <div className='flex flex-col gap-6 p-4 md:p-6 lg:p-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl'>Projects</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Manage and track all active initiatives.</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' className='gap-2'>
            <HugeiconsIcon icon={SlidersHorizontalIcon} size={16} />
            Filter
          </Button>
          <Button size='sm' className='gap-2'>
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            New Project
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        {METRICS.map((metric) => {
          return (
            <Card key={metric.label} className='p-6'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  <HugeiconsIcon icon={metric.icon} size={16} />
                  {metric.label}
                </div>
                <div className={`text-4xl font-bold ${metric.color}`}>{metric.value}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border border-border'>
        <Table className='w-full'>
          <TableHeader>
            <TableRow className='border-b hover:bg-transparent bg-card'>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Project ID</TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Name</TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Progress</TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Status</TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Owner</TableHead>
              <TableHead className='text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='bg-card'>
            {PROJECTS.map((project) => (
              <TableRow key={project.id} className='group hover:bg-muted/50'>
                <TableCell className='font-mono text-sm text-foreground'>{project.id}</TableCell>
                <TableCell className='font-semibold text-foreground'>{project.name}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-24 overflow-hidden rounded-full bg-muted'>
                      <div className={`h-full ${getProgressColor(project.status)}`} style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className='text-xs text-muted-foreground'>{project.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary' className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-6 w-6'>
                      <AvatarFallback className='text-xs'>{project.ownerInitials}</AvatarFallback>
                    </Avatar>
                    <span className='text-sm text-foreground'>{project.owner}</span>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='sm' className='opacity-0 transition-opacity group-hover:opacity-100'>
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className='border-t border-border bg-muted/30 px-6 py-3 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>Showing 1-3 of 24</span>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='sm' disabled>
              <HugeiconsIcon icon={ChevronLeftIcon} size={16} />
            </Button>
            <Button variant='default' size='sm' className='h-6 w-6 p-0'>
              1
            </Button>
            <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
              2
            </Button>
            <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
              3
            </Button>
            <Button variant='ghost' size='sm'>
              <HugeiconsIcon icon={ChevronRightIcon} size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
