'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, LockIcon, UserAccountIcon, AlertCircleIcon, CircleCheckIcon } from '@hugeicons/core-free-icons';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function SignupForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(password)) {
      setError('Contraseña debe contener: mayúscula, minúscula, número y carácter especial (mín. 8 caracteres)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError(null);
    setIsLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (signUpData.user) {
      const { error: insertError } = await supabase.from('User').insert({
        id: signUpData.user.id,
        name,
        email,
        role: 'USER',
      });

      if (insertError) {
        console.error('Profile error:', insertError);
      }
    }

    setSubmitted(true);
    setIsLoading(false);
  }

  if (submitted) {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <Card className='p-8 border border-[#c3c8c3] bg-white flex flex-col items-center text-center gap-6'>
          <div className='w-16 h-16 bg-[#2D3E35]/10 rounded-full flex items-center justify-center'>
            <HugeiconsIcon icon={CircleCheckIcon} className='h-8 w-8 text-[#2D3E35]' />
          </div>
          <div className='flex flex-col gap-2'>
            <h2 className='text-2xl font-semibold text-[#2D3E35]'>Verificá tu correo</h2>
            <p className='text-sm text-[#434844]'>
              Te enviamos un enlace de verificación a <strong>{email}</strong>. Revisá tu bandeja de entrada (y también tu carpeta de spam).
            </p>
          </div>
          <Button asChild variant='outline' className='mt-4'>
            <Link href='/login'>Volver al inicio de sesión</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col gap-2 text-center lg:text-left'>
        <h1 className='text-3xl font-semibold tracking-tight'>Crear cuenta</h1>
        <p className='text-sm text-muted-foreground'>
          Unete a TaskFlow para gestionar tus proyectos con precisión.
        </p>
      </div>

      <div className='space-y-5'>
            {/* Name */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-xs font-semibold uppercase tracking-wider text-[#434844]'>
                Nombre completo
              </Label>
              <div className='relative'>
                <HugeiconsIcon
                  icon={UserAccountIcon}
                  className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#434844]'
                />
                <Input
                  id='name'
                  type='text'
                  placeholder='Jane Doe'
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className='pl-10 pr-3 py-2 bg-white border border-[#c3c8c3] focus:border-accent focus:ring-1 focus:ring-accent'
                />
              </div>
            </div>

            {/* Email */}
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-xs font-semibold uppercase tracking-wider text-[#434844]'>
                Email
              </Label>
              <div className='relative'>
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#434844]'
                />
                <Input
                  id='email'
                  type='email'
                  placeholder='jane@example.com'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className='pl-10 pr-3 py-2 bg-white border border-[#c3c8c3] focus:border-accent focus:ring-1 focus:ring-accent'
                />
              </div>
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <Label htmlFor='password' className='text-xs font-semibold uppercase tracking-wider text-[#434844]'>
                Contraseña
              </Label>
              <div className='relative'>
                <HugeiconsIcon
                  icon={LockIcon}
                  className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#434844]'
                />
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className='pl-10 pr-3 py-2 bg-white border border-[#c3c8c3] focus:border-accent focus:ring-1 focus:ring-accent'
                />
              </div>
              <p className='text-xs text-[#434844]'>Mayúscula, minúscula, número y carácter especial</p>
            </div>

            {/* Confirm Password */}
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword' className='text-xs font-semibold uppercase tracking-wider text-[#434844]'>
                Confirmar contraseña
              </Label>
              <div className='relative'>
                <HugeiconsIcon
                  icon={LockIcon}
                  className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#434844]'
                />
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='••••••••'
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className='pl-10 pr-3 py-2 bg-white border border-[#c3c8c3] focus:border-accent focus:ring-1 focus:ring-accent'
                />
              </div>
            </div>

        {error && (
          <div className='flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive'>
            <HugeiconsIcon icon={AlertCircleIcon} className='h-5 w-5 flex-shrink-0 mt-0.5' />
            <span>{error}</span>
          </div>
        )}

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full'
          size='lg'
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>

        <p className='text-center text-sm text-muted-foreground'>
          ¿Ya tienes cuenta?{' '}
          <Link href='/login' className='text-primary hover:underline font-medium'>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </form>
  );
}