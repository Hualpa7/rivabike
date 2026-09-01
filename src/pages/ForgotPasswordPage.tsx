import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { requestPasswordReset } from '@/features/auth/api';
import { Button, Field, Input } from '@/components/ui';

const forgotSchema = z.object({
  email: z.string().min(1, 'Ingresá tu correo electrónico.').email('Ingresá un correo válido.'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotValues) => {
    await requestPasswordReset(values.email);
    reset();
    setSent(true);
  };

  return (
    <AuthLayout
      eyebrow="Cuenta · Recuperar acceso"
      title="Recuperar contraseña"
      subtitle="Ingresá el correo de tu cuenta y te enviamos un enlace para restablecerla."
      pitchTitle="Recuperá el acceso a tu taller."
      pitchText="Te enviamos las instrucciones para restablecer tu contraseña y volver a gestionar tu bicicletería."
      backHref="/login"
      backLabel="Volver a iniciar sesión"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
        <Field label="Correo electrónico" htmlFor="f-email" error={errors.email?.message} className="mb-5">
          <Input
            id="f-email"
            type="email"
            autoComplete="email"
            placeholder="taller@rivabike.com.ar"
            invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Button type="submit" variant="primary" block loading={isSubmitting}>
          Enviar enlace
        </Button>

        {sent ? (
          <p role="status" aria-live="polite" className="mt-3.5 text-center text-sm text-ink">
            Si el correo existe, vas a recibir un enlace para restablecer tu contraseña.
          </p>
        ) : null}
      </form>
    </AuthLayout>
  );
}
