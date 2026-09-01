import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { signIn } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { Button, Input, Field } from '@/components/ui';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';

const loginSchema = z.object({
  email: z.string().min(1, 'Ingresá tu correo electrónico.').email('Ingresá un correo válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPwd, setShowPwd] = useState(false);
  const [formMsg, setFormMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const status = useAuthStore((s) => s.status);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const onSubmit = async (values: LoginValues) => {
    setFormMsg(null);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setFormMsg({
        kind: 'error',
        text: error.includes('Supabase no configurado')
          ? error
          : 'Correo o contraseña incorrectos. Probá de nuevo.',
      });
      return;
    }
    setFormMsg({ kind: 'ok', text: 'Sesión iniciada. Redirigiendo al panel…' });
    setTimeout(() => navigate(from, { replace: true }), 700);
  };

  return (
    <AuthLayout
      eyebrow="Panel · Acceso"
      title="Iniciar sesión"
      subtitle="Ingresá con tu cuenta del taller para continuar."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
        <Field label="Correo electrónico" htmlFor="f-email" error={errors.email?.message} className="mb-4">
          <Input
            id="f-email"
            type="email"
            autoComplete="email"
            placeholder="taller@rivabike.com.ar"
            invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field label="Contraseña" htmlFor="f-password" error={errors.password?.message} className="mb-4">
          <div className="relative">
            <Input
              id="f-password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              invalid={!!errors.password}
              className="pr-12"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[10px] text-muted transition-colors hover:bg-[var(--surface-2)] hover:text-ink"
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPwd}
              onClick={() => setShowPwd((v) => !v)}
            >
              {showPwd ? <EyeOffIcon size={19} /> : <EyeIcon size={19} />}
            </button>
          </div>
        </Field>

        <div className="mb-5 flex items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-pink-deep" />
            Recordarme
          </label>
          <Link to="/olvide-password" className="text-sm font-medium text-pink-deep hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" variant="primary" block loading={isSubmitting || status === 'loading'}>
          Ingresar
        </Button>

        {formMsg ? (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3.5 text-center text-sm ${formMsg.kind === 'error' ? 'text-pink-deep' : 'text-ink'}`}
          >
            {formMsg.text}
          </p>
        ) : null}
      </form>
    </AuthLayout>
  );
}
