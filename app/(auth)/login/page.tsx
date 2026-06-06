'use client';

import { LoginForm } from '@/components/login-form';
import { Logo } from '@/components/logo';
import { HugeiconsIcon } from '@hugeicons/react';
import { IdVerifiedIcon } from '@hugeicons/core-free-icons';

export default function LoginPage() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2 bg-background'>
      {/* Left Panel - Brand Section (Desktop Only) */}
      <div className='hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-50 to-slate-100 border-r border-border relative overflow-hidden'>
        {/* Pattern Background */}
        <div className='absolute inset-0 opacity-30'>
          <div className='absolute inset-0'
            style={{
              backgroundImage: 'radial-gradient(circle, #d3e4fe 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className='relative z-10'>
          <div className='mb-8'>
            <Logo href="/" showText={true} size="lg" />
          </div>
          <div>
            <h2 className='text-2xl font-semibold text-foreground mb-3'>
              Gestión de Precisión
            </h2>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Optimiza tu flujo de trabajo con herramientas diseñadas para el trabajo profundo y la ejecución de alta velocidad.
            </p>
          </div>
        </div>

        <div className='relative z-10 flex items-center gap-2 text-xs font-medium text-muted-foreground'>
          <HugeiconsIcon icon={IdVerifiedIcon} className='h-4 w-4 text-primary' />
          <span>Seguridad de nivel empresarial</span>
        </div>

        {/* Decorative Element */}
        <div className='absolute -bottom-20 -right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20' />
      </div>

      {/* Right Panel - Login Form */}
      <div className='flex flex-col justify-center px-4 py-8 md:px-10 lg:px-12'>
        {/* Mobile Logo */}
        <div className='flex justify-center mb-8 lg:hidden'>
          <Logo href="/" showText={true} size="md" />
        </div>

        <div className='w-full max-w-sm mx-auto'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
