'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, LockIcon, UserAccountIcon, AlertCircleIcon } from '@hugeicons/core-free-icons';

export function SignupForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!terms) {
      setError('Debés aceptar términos y política de privacidad');
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

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col gap-2 text-center lg:text-left'>
        <h1 className='text-3xl font-semibold tracking-tight'>Crear cuenta</h1>
        <p className='text-sm text-muted-foreground'>
          Uníte a TaskFlow para gestionar tus proyectos con precisión.
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className='pl-10 pr-3 py-2 bg-white border border-[#c3c8c3] focus:border-accent focus:ring-1 focus:ring-accent'
                />
              </div>
              <p className='text-xs text-[#434844]'>Mínimo 6 caracteres</p>
            </div>

            {/* Terms */}
            <div className='flex justify-center items-start gap-3'>
              <Checkbox
                id='terms'
                checked={terms}
                onCheckedChange={(checked) => setTerms(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor='terms' className='text-xs cursor-pointer'>
                Acepto los{' '}
                <Link href='#' className='text-accent hover:underline font-medium'>
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link href='#' className='text-accent hover:underline font-medium'>
                  Política de Privacidad
                </Link>
              </Label>
            </div>

        {error && (
          <div className='flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive'>
            <HugeiconsIcon icon={AlertCircleIcon} className='h-5 w-5 flex-shrink-0 mt-0.5' />
            <span>{error}</span>
          </div>
        )}

        <Button
          type='submit'
          disabled={isLoading || !terms}
          className='w-full'
          size='lg'
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>

        <p className='text-center text-sm text-muted-foreground'>
          ¿Ya tenés cuenta?{' '}
          <Link href='/login' className='text-primary hover:underline font-medium'>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </form>
  );
}