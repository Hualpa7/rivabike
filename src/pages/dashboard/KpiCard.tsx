import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface KpiCardProps {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
  icon?: ReactNode;
}

/** Carta KPI del dashboard: label mono + numero Archivo + nota. */
export function KpiCard({ label, value, note, accent, icon }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border-2 border-line bg-paper p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
        {icon ? <span className="text-muted">{icon}</span> : null}
      </div>
      <span className={cn('num font-display text-[30px] font-bold leading-none tracking-[-0.03em] md:text-[40px]', accent ? 'text-pink-deep' : 'text-ink')}>
        {value}
      </span>
      {note ? <span className="text-[13px] text-muted">{note}</span> : null}
    </div>
  );
}
