import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils/fmt';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QtyStepper } from '@/components/ui/QtyStepper';

/** Draft compartido por los wizards de orden de trabajo y presupuesto. */
export interface WizardDraft {
  nombre: string;
  telefono: string;
  marca: string;
  color: string;
  serviceIds: string[];
  servicePrices: Record<string, number>;
  repuestos: Record<string, number>;
  repuestoPrices: Record<string, number>;
  observaciones: string;
}

export type WizardSet<D extends WizardDraft> = <K extends keyof D>(k: K, v: D[K]) => void;

/**
 * Sanea el input numérico de la seña: vacíos o inválidos → 0, con clamp
 * 0..max (el subtotal bruto). Evita NaN en estados intermedios de tipeo.
 */
function parseSeniaInput(value: string, max: number): number {
  if (value.trim() === '') return 0;
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(0, Math.floor(n)), Math.max(0, max));
}

// ---- Steps ----

export function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
      {children} {required ? <span className="text-pink-deep">*</span> : null}
    </label>
  );
}

export function ClienteStep<D extends WizardDraft>({
  draft,
  set,
}: {
  draft: D;
  set: WizardSet<D>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FieldLabel required>Nombre y apellido</FieldLabel>
        <Input value={draft.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej. Valeria Gómez" required />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>Teléfono</FieldLabel>
        <Input inputMode="tel" value={draft.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="3875 501234" />
      </div>
    </div>
  );
}

export function BiciStep<D extends WizardDraft>({
  draft,
  set,
}: {
  draft: D;
  set: WizardSet<D>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FieldLabel required>Marca</FieldLabel>
        <Input value={draft.marca} onChange={(e) => set('marca', e.target.value)} placeholder="Ej. Venzo R29" required />
        <p className="mt-1.5 text-xs text-muted">
          Marcá la marca y, si querés, el modelo (ej. "Venzo R29", "Trek Marlin 5").
        </p>
      </div>
      <div>
        <FieldLabel>Color</FieldLabel>
        <Input value={draft.color} onChange={(e) => set('color', e.target.value)} placeholder="Ej. Negro mate" />
      </div>
    </div>
  );
}

export function ServiciosStep({
  services,
  selected,
  onChange,
  servicePrices,
  onPriceChange,
}: {
  services: { id: string; titulo: string; descripcion: string; precio_base: number }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  servicePrices: Record<string, number>;
  onPriceChange: (id: string, price: number) => void;
}) {
  const toggle = (s: { id: string; precio_base: number }) => {
    if (selected.includes(s.id)) {
      onChange(selected.filter((x) => x !== s.id));
    } else {
      onChange([...selected, s.id]);
      if (!(s.id in servicePrices)) onPriceChange(s.id, s.precio_base);
    }
  };
  return (
    <div className="space-y-2">
      {services.length === 0 ? <p className="text-sm text-muted">Sin servicios cargados.</p> : null}
      {services.map((s) => {
        const on = selected.includes(s.id);
        const price = servicePrices[s.id] ?? s.precio_base;
        return (
          <div
            key={s.id}
            className={cn(
              'rounded-[10px] border px-4 py-3 transition-colors',
              on ? 'border-pink-deep bg-[var(--accent-soft)]' : 'border-line bg-paper hover:border-pink-deep',
            )}
          >
            <button
              type="button"
              onClick={() => toggle(s)}
              aria-pressed={on}
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors',
                  on ? 'border-pink-deep bg-pink-deep text-white' : 'border-line',
                )}
              >
                {on ? '✓' : ''}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">{s.titulo}</div>
                <div className="text-xs text-muted">{s.descripcion}</div>
              </div>
              {!on && (
                <span className="num shrink-0 text-sm font-semibold text-pink-deep">
                  {formatCurrency(s.precio_base)}
                </span>
              )}
            </button>
            {on && (
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-pink-deep/20 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => onPriceChange(s.id, Math.max(0, Number(e.target.value)))}
                    className="num w-28 rounded-card border border-line bg-paper px-2.5 py-1.5 text-right text-sm font-semibold text-ink focus:border-pink-deep focus:outline-none"
                  />
                </div>
                <span className="num ml-auto text-sm font-semibold text-pink-deep">
                  {formatCurrency(price)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RepuestosStep({
  inventory,
  repuestos,
  onChange,
  repuestoPrices,
  onPriceChange,
  maxQty,
  isLoading,
}: {
  inventory: { id: string; nombre: string; stock_actual: number; precio_unitario: number }[];
  repuestos: Record<string, number>;
  onChange: (r: Record<string, number>) => void;
  repuestoPrices: Record<string, number>;
  onPriceChange: (id: string, price: number) => void;
  maxQty?: (item: { id: string; stock_actual: number }) => number;
  isLoading?: boolean;
}) {
  const setQty = (id: string, qty: number) => {
    onChange({ ...repuestos, [id]: qty });
    if (qty > 0 && !(id in repuestoPrices)) {
      const item = inventory.find((i) => i.id === id);
      if (item) onPriceChange(id, item.precio_unitario);
    }
  };
  const toggle = (item: { id: string; stock_actual: number; precio_unitario: number }) => {
    const cap = maxQty ? maxQty(item) : item.stock_actual;
    if (cap <= 0) return;
    const current = repuestos[item.id] ?? 0;
    if (current > 0) {
      onChange({ ...repuestos, [item.id]: 0 });
    } else {
      onChange({ ...repuestos, [item.id]: 1 });
      if (!(item.id in repuestoPrices)) onPriceChange(item.id, item.precio_unitario);
    }
  };
  return (
    <div className="space-y-2">
      {isLoading ? <p className="text-sm text-muted">Cargando repuestos…</p> : null}
      {!isLoading && inventory.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-paper p-5 text-center">
          <p className="text-sm font-semibold text-ink">No hay repuestos cargados</p>
          <p className="mt-1 text-sm text-muted">
            Cargá items en Inventario para poder agregarlos a la orden.
          </p>
          <Link
            to="/dashboard/inventario"
            className="mt-3 inline-flex rounded-pill bg-pink-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink"
          >
            Ir a Inventario
          </Link>
        </div>
      ) : null}
      {inventory.map((it) => {
        const cap = maxQty ? maxQty(it) : it.stock_actual;
        const qty = repuestos[it.id] ?? 0;
        const price = repuestoPrices[it.id] ?? it.precio_unitario;
        const disabled = cap <= 0;
        return (
          <div
            key={it.id}
            className={cn(
              'rounded-[10px] border px-4 py-3',
              qty > 0 ? 'border-pink-deep bg-[var(--accent-soft)]' : 'border-line bg-paper',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">{it.nombre}</div>
                <div className="text-xs text-muted">
                  {maxQty ? '' : `Stock: ${it.stock_actual} u. · `}
                  {formatCurrency(it.precio_unitario)}
                </div>
              </div>
              {disabled ? (
                <span className="text-xs font-semibold text-pink-deep">Sin stock</span>
              ) : (
                <div className="flex shrink-0 items-center gap-3">
                  {qty > 0 ? (
                    <QtyStepper value={qty} onChange={(v) => setQty(it.id, v)} min={0} max={cap} />
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => toggle(it)}>
                      Agregar
                    </Button>
                  )}
                </div>
              )}
            </div>
            {qty > 0 && (
              <div className="mt-2 flex items-center gap-3 border-t border-pink-deep/20 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => onPriceChange(it.id, Math.max(0, Number(e.target.value)))}
                    className="num w-24 rounded-card border border-line bg-paper px-2.5 py-1.5 text-right text-sm font-semibold text-ink focus:border-pink-deep focus:outline-none"
                  />
                </div>
                <span className="num ml-auto text-sm font-semibold text-pink-deep">
                  {formatCurrency(price * qty)}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(it)}
                  className="text-xs text-muted underline transition-colors hover:text-pink-deep"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ObsStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Observaciones que vio el mecánico</FieldLabel>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej. La corona trasera está muy desgastada, recomendamos cambiarla…"
          className="min-h-[92px] w-full rounded-card border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-pink-deep focus:outline-none"
        />
      </div>
    </div>
  );
}

export function ResumenStep({
  services,
  inventory,
  repuestos,
  servicePrices,
  repuestoPrices,
  subtotalServices,
  subtotalRepuestos,
  total,
  senia,
  onSeniaChange,
  confirmTitle = '¿Guardar?',
  confirmText,
}: {
  services: { id: string; titulo: string; precio_base: number }[];
  inventory: { id: string; nombre: string; precio_unitario: number }[];
  repuestos: Record<string, number>;
  servicePrices: Record<string, number>;
  repuestoPrices: Record<string, number>;
  subtotalServices: number;
  subtotalRepuestos: number;
  total: number;
  senia?: number;
  onSeniaChange?: (v: number) => void;
  confirmTitle: string;
  confirmText?: string;
}) {
  const repuestoRows = Object.entries(repuestos).filter(([, q]) => q > 0);
  // `total` llega como subtotal bruto (sin seña); la única resta vive acá.
  const finalTotal = Math.max(total - (senia ?? 0), 0);
  return (
    <div className="space-y-6">
      <div className="rounded-card border-2 border-line bg-paper p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Servicios</h3>
        <div className="mt-3 divide-y divide-line">
          {services.length === 0 && <p className="text-sm text-muted">Sin servicios seleccionados.</p>}
          {services.map((s) => {
            const price = servicePrices[s.id] ?? s.precio_base;
            return <Row key={s.id} name={s.titulo} price={price} />;
          })}
        </div>
        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Repuestos</h3>
        <div className="mt-3 divide-y divide-line">
          {repuestoRows.length === 0 && <p className="text-sm text-muted">Sin repuestos.</p>}
          {repuestoRows.map(([id, qty]) => {
            const item = inventory.find((i) => i.id === id);
            const price = repuestoPrices[id] ?? item?.precio_unitario ?? 0;
            return (
              <Row key={id} name={item?.nombre ?? id} sub={`${qty} u.`} price={price * qty} />
            );
          })}
        </div>
      </div>

      {/* Tarjeta de totales: colores fijos (no invierten con el tema) para que
          el contraste sea legible tanto en claro como en oscuro. */}
      <div className="rounded-card bg-ink-fixed p-5 text-on-ink-fixed">
        <div className="flex justify-between py-1">
          <span className="text-on-ink-fixed/70">Subtotal servicios</span>
          <span className="num">{formatCurrency(subtotalServices)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-on-ink-fixed/70">Repuestos</span>
          <span className="num">{formatCurrency(subtotalRepuestos)}</span>
        </div>
        {onSeniaChange ? (
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-on-ink-fixed/70">Seña</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-on-ink-fixed/60">$</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={total}
                value={senia ?? 0}
                onChange={(e) => onSeniaChange(parseSeniaInput(e.target.value, total))}
                aria-label="Seña"
                className="num w-28 rounded-card border border-white/30 bg-white/10 px-2.5 py-1.5 text-right text-sm font-semibold text-white focus:border-pink-deep focus:outline-none"
              />
            </div>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between border-t border-white/25 pt-3">
          <span className="font-display text-lg font-bold">Total a pagar</span>
          <span className="num font-display text-2xl font-bold text-gold">{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      <div className="rounded-card border-2 border-line bg-[var(--accent-soft)] p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-deep text-white">✓</span>
          <div>
            <h3 className="font-display text-base font-semibold text-ink">{confirmTitle}</h3>
            {confirmText ? <p className="mt-1 text-sm text-muted">{confirmText}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ name, sub, price }: { name: string; sub?: string; price: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-sm text-ink">{name}</div>
        {sub ? <div className="text-xs text-muted">{sub}</div> : null}
      </div>
      <span className="num shrink-0 text-sm font-semibold text-pink-deep">{formatCurrency(price)}</span>
    </div>
  );
}