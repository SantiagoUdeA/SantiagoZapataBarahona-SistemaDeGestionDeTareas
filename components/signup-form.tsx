'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

export function SignupForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
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
        console.error('Error creating user profile:', insertError);
      }
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Crear cuenta</h1>
          <p className='text-sm text-balance text-muted-foreground'>
            Completá tus datos para registrarte en el sistema
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor='name'>Nombre completo</FieldLabel>
          <Input
            id='name'
            type='text'
            placeholder='Juan Pérez'
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='bg-background'
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor='email'>Email</FieldLabel>
          <Input
            id='email'
            type='email'
            placeholder='tu@email.com'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='bg-background'
            disabled={isLoading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
          <Input
            id='password'
            type='password'
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='bg-background'
            disabled={isLoading}
          />
          <FieldDescription>Mínimo 6 caracteres</FieldDescription>
        </Field>

        {error && (
          <Field>
            <FieldError>{error}</FieldError>
          </Field>
        )}

        <Field>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </Field>

        <FieldDescription className='text-center'>
          ¿Ya tenés cuenta?{' '}
          <Link href='/login' className='underline underline-offset-4'>
            Iniciá sesión
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}