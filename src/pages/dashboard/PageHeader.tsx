import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  sub?: string;
  action?: ReactNode;
}

/** Cabecera comun de paginas del dashboard: titulo + subtitulo + accion. */
export function PageHeader({ title, sub, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{title}</h1>
        {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
