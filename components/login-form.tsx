'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, AlertCircleIcon, LockIcon } from '@hugeicons/core-free-icons';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col gap-2 text-center lg:text-left'>
        <h1 className='text-3xl font-semibold tracking-tight'>Bienvenido</h1>
        <p className='text-sm text-muted-foreground'>
          Ingresa tus credenciales para acceder a la aplicación
        </p>
      </div>

      <FieldGroup className='gap-4'>
        <Field>
          <FieldLabel htmlFor='email' className='text-xs uppercase tracking-wider'>
            Email
          </FieldLabel>
          <div className='relative'>
            <HugeiconsIcon icon={Mail01Icon} className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
            <Input
              id='email'
              type='email'
              placeholder='nombre@empresa.com'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='pl-10'
              disabled={isLoading}
            />
          </div>
        </Field>

        <Field>
          <div className='flex items-center justify-between'>
            <FieldLabel htmlFor='password' className='text-xs uppercase tracking-wider'>
              Contraseña
            </FieldLabel>
            <a
              href='#'
              className='text-xs text-primary hover:underline'
            >
              ¿Olvidaste la contraseña?
            </a>
          </div>
          <div className='relative'>
            <HugeiconsIcon icon={LockIcon} className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='pl-10'
              disabled={isLoading}
            />
          </div>
        </Field>

        {error && (
          <div className='flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive'>
            <HugeiconsIcon icon={AlertCircleIcon} className='h-5 w-5 flex-shrink-0 mt-0.5' />
            <span>{error}</span>
          </div>
        )}

        <div className='flex items-center gap-2'>
          <Checkbox
            id='remember-me'
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={isLoading}
          />
          <Label
            htmlFor='remember-me'
            className='text-sm font-normal text-muted-foreground cursor-pointer'
          >
            Recuérdame por 30 días
          </Label>
        </div>

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full'
          size='lg'
        >
          {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>

        <p className='text-center text-sm text-muted-foreground'>
          ¿No tienes cuenta?{' '}
          <a href='/signup' className='text-primary hover:underline font-medium'>
            Solicitar acceso
          </a>
        </p>
      </FieldGroup>
    </form>
  );
}