// Root layout for entire application
// Configures fonts, metadata, and global styles
// All pages (auth and main) render within this layout

import type { Metadata } from 'next';
import { Geist, Geist_Mono, Public_Sans } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';

// Font imports from Google Fonts
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

// Page metadata (browser title, description)
export const metadata: Metadata = {
  title: 'Task Management',
  description: 'Sistema de Gestión de Tareas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={cn('h-full antialiased font-sans', geistSans.variable, geistMono.variable, publicSans.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
