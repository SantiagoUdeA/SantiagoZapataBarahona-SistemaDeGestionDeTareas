'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, LockIcon } from '@hugeicons/core-free-icons';

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });

    if (error) {
      setError('No se pudo actualizar la contraseña. Intentá nuevamente.');
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4'>
      <Logo href='/' showText={true} size='md' />

      <form onSubmit={handleSubmit} className='w-full max-w-sm flex flex-col gap-6'>
        <div className='flex flex-col gap-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>Actualizá tu contraseña</h1>
          <p className='text-sm text-muted-foreground'>
            Por seguridad, debés establecer una nueva contraseña antes de continuar.
          </p>
        </div>

        <FieldGroup className='gap-4'>
          <Field>
            <FieldLabel htmlFor='password' className='text-xs uppercase tracking-wider'>
              Nueva contraseña
            </FieldLabel>
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
            <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor='confirm-password' className='text-xs uppercase tracking-wider'>
              Confirmar contraseña
            </FieldLabel>
            <div className='relative'>
              <HugeiconsIcon icon={LockIcon} className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
              <Input
                id='confirm-password'
                type='password'
                placeholder='••••••••'
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <Button type='submit' disabled={isLoading} className='w-full' size='lg'>
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
