import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FolderIcon,
  CheckListIcon,
  Robot01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

const FEATURES = [
  {
    icon: FolderIcon,
    title: 'Gestión de Proyectos',
    description:
      'Crea proyectos y agrega miembros del equipo. Los administradores tienen control total sobre la organización y estructura de los proyectos.',
  },
  {
    icon: CheckListIcon,
    title: 'Seguimiento de Tareas',
    description:
      'Crea, asigna y completa tareas con estado (Pendiente, En Progreso, Completado). Colaboración en tiempo real con visibilidad total del progreso.',
  },
  {
    icon: Robot01Icon,
    title: 'Asistente IA Inteligente',
    description:
      'Interactúa con un chatbot de inteligencia artificial que gestiona proyectos, miembros y tareas directamente desde el chat.',
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f8f9ff] font-sans text-[#0b1c30] antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#d3e4fe] bg-[#f8f9ff]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Logo href="/" showText size="md" />
          <Button
            asChild
            className="h-auto w-full rounded bg-[#182820] px-10 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-[#516258] active:scale-95 sm:w-auto"
            >
            <Link href="/login" className="flex items-center gap-2">
              Iniciar sesión
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
          </Button>
      </div>
      </header>

      <main className="flex flex-grow flex-col">
        {/* Hero */}
        <section
          className="relative flex w-full flex-grow items-center justify-center overflow-hidden py-24"
          style={{
            backgroundColor: '#f8f9ff',
            backgroundImage: 'radial-gradient(#d3e4fe 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30">
            <div className="absolute right-[-200px] top-[-100px] h-[600px] w-[600px] rounded-full border border-[#d3e4fe]" />
            <div className="absolute bottom-[-200px] left-[-300px] h-[800px] w-[800px] rounded-full border border-[#d3e4fe]" />
            <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-[#d3e4fe] blur-3xl mix-blend-multiply" />
            <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-[#e2dfff] blur-3xl mix-blend-multiply" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center lg:px-8">
            <h1
              className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight text-[#182820] md:text-6xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              El trabajo de tu equipo, organizado.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-[#434844]">
              TaskFlow es la capa base para equipos de alto rendimiento. Diseñado meticulosamente
              para la velocidad, la claridad y la precisión sin concesiones.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-[#f8f9ff] py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {FEATURES.map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col items-start rounded-xl border border-[#d3e4fe] bg-[#eff4ff] p-6 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded border border-[#c3c8c3] bg-[#e5eeff]">
                    <HugeiconsIcon icon={icon} size={20} color="#4b41e1" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#182820]">{title}</h3>
                  <p className="text-sm text-[#434844]">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#374151] bg-[#213145] text-center py-6">
          <p className="text-sm text-[#eaf1ff]/80">© 2026 TaskFlow</p>
      </footer>
    </div>
  );
}
