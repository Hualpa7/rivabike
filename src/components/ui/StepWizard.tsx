import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

interface StepWizardProps {
  steps: string[];
  current: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  canNext?: boolean;
  loadingNext?: boolean;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Asistente de pasos (wizard). Muestra un indicador numerado de progreso,
 * el contenido del paso actual y la navegacion para atras / siguiente.
 * La validacion del paso actual la hace el padre (RHF + Zod por paso).
 */
export function StepWizard({
  steps,
  current,
  onNext,
  onBack,
  nextLabel = 'Continuar',
  backLabel = 'Volver',
  canNext = true,
  loadingNext = false,
  footer,
  className,
  children,
}: StepWizardProps) {
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <ol className="flex items-center gap-2" aria-label="Progreso del asistente">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step} className="flex flex-1 items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  done && 'bg-pink-deep text-paper',
                  active && 'bg-ink text-paper',
                  !done && !active && 'border border-line bg-paper text-muted',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className="hidden text-sm font-medium text-ink sm:block">{step}</span>
            </li>
          );
        })}
      </ol>

      <div>{children}</div>

      {footer ?? (
        <div className="mt-2 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isFirst}
            aria-disabled={isFirst}
          >
            {backLabel}
          </Button>
          {onNext ? (
            <Button
              type="button"
              variant="primary"
              onClick={onNext}
              disabled={!canNext}
              loading={loadingNext}
            >
              {isLast ? nextLabel : nextLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
