import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServicesAdmin } from '@/features/services/api';
import { useInventoryItems } from '@/features/inventory/api';
import { useCreateWorkOrder } from '@/features/work-orders/api';
import type { CreateWorkOrderInput } from '@/types';
import { formatCurrency } from '@/lib/utils/fmt';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepWizard } from '@/components/ui/StepWizard';
import { QtyStepper } from '@/components/ui/QtyStepper';
import { PageHeader } from './PageHeader';

const STEPS = ['Cliente', 'Bici', 'Servicios', 'Repuestos', 'Obs.', 'Resumen'];

interface Draft {
  nombre: string;
  telefono: string;
  marcas: string;
  modelo: string;
  rodado: string;
  color: string;
  serviceIds: string[];
  repuestos: Record<string, number>;
  observaciones: string;
  fechaEntrega: string;
}

const initialDraft: Draft = {
  nombre: '',
  telefono: '',
  marcas: '',
  modelo: '',
  rodado: '',
  color: '',
  serviceIds: [],
  repuestos: {},
  observaciones: '',
  fechaEntrega: '',
};

/** Wizard de nueva orden de trabajo en 6 pasos. */
export function NuevaOrdenPage() {
  const navigate = useNavigate();
  const { data: services = [] } = useServicesAdmin();
  const { data: inventory = [] } = useInventoryItems({ onlyActive: true });
  const create = useCreateWorkOrder();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const selectedServices = services.filter((s) => draft.serviceIds.includes(s.id));
  const selectedRepuestos = Object.entries(draft.repuestos).filter(([, qty]) => qty > 0);

  const subtotalServices = selectedServices.reduce((a, s) => a + s.precio_base, 0);
  const subtotalRepuestos = selectedRepuestos.reduce((a, [id, qty]) => {
    const item = inventory.find((i) => i.id === id);
    return a + (item ? item.precio_unitario * qty : 0);
  }, 0);
  const total = subtotalServices + subtotalRepuestos;

  // Validacion por paso
  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return draft.nombre.trim().length > 0;
      case 1:
        return draft.marcas.trim().length > 0 && draft.modelo.trim().length > 0;
      default:
        return true;
    }
  }, [step, draft]);

  const guardar = () => {
    const [nombreRaw, ...rest] = draft.nombre.trim().split(/\s+/);
    const nombre = nombreRaw ?? '';
    const apellido = rest.join(' ');
    const input: CreateWorkOrderInput = {
      customer: { nombre, apellido, telefono: draft.telefono },
      bicycle: { marca: draft.marcas, modelo: draft.modelo, color: draft.color || null },
      fecha_estimada_entrega: draft.fechaEntrega || null,
      observaciones: draft.observaciones || null,
      services: selectedServices.map((s) => ({
        service_id: s.id,
        title_snapshot: s.titulo,
        description_snapshot: s.descripcion,
        unit_price: s.precio_base,
        quantity: 1,
      })),
      inventory_items: selectedRepuestos.map(([id, qty]) => {
        const item = inventory.find((i) => i.id === id);
        return {
          inventory_item_id: id,
          name_snapshot: item?.nombre ?? id,
          unit_price: item?.precio_unitario ?? 0,
          quantity: qty,
        };
      }),
    };
    create.mutateAsync(input).then(() => navigate('/dashboard/ordenes'));
  };

  const onNext = () => {
    if (step === STEPS.length - 1) {
      guardar();
      return;
    }
    setStep((s) => s + 1);
  };
  const onBack = () => setStep((s) => s - 1);

  const isLast = step === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Nueva orden" sub="Presupuesto / orden de trabajo" />

      <StepWizard
        steps={STEPS}
        current={step}
        onNext={canNext ? onNext : undefined}
        onBack={onBack}
        nextLabel={isLast ? 'Guardar orden' : 'Siguiente'}
        canNext={canNext}
        loadingNext={create.isPending}
      >
        <div>
          {step === 0 && (
            <ClienteStep draft={draft} set={set} />
          )}
          {step === 1 && (
            <BiciStep draft={draft} set={set} />
          )}
          {step === 2 && (
            <ServiciosStep services={services} selected={draft.serviceIds} onChange={(ids) => set('serviceIds', ids)} />
          )}
          {step === 3 && (
            <RepuestosStep inventory={inventory} repuestos={draft.repuestos} onChange={(r) => set('repuestos', r)} />
          )}
          {step === 4 && (
            <ObsStep draft={draft} set={set} />
          )}
          {step === 5 && (
            <ResumenStep
              services={selectedServices}
              inventory={inventory}
              repuestos={draft.repuestos}
              subtotalServices={subtotalServices}
              subtotalRepuestos={subtotalRepuestos}
              total={total}
            />
          )}
        </div>
      </StepWizard>
    </div>
  );
}

// ---- Steps ----

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
      {children} {required ? <span className="text-pink-deep">*</span> : null}
    </label>
  );
}

function ClienteStep({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
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

function BiciStep({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <FieldLabel required>Marca</FieldLabel>
        <Input value={draft.marcas} onChange={(e) => set('marcas', e.target.value)} placeholder="Ej. Venzo, Trek, Raleigh" required />
      </div>
      <div>
        <FieldLabel required>Modelo</FieldLabel>
        <Input value={draft.modelo} onChange={(e) => set('modelo', e.target.value)} placeholder="Ej. R29" required />
      </div>
      <div>
        <FieldLabel>Rodado</FieldLabel>
        <Input value={draft.rodado} onChange={(e) => set('rodado', e.target.value)} placeholder="Ej. 29, 27.5, 26" />
      </div>
      <div>
        <FieldLabel>Color</FieldLabel>
        <Input value={draft.color} onChange={(e) => set('color', e.target.value)} placeholder="Ej. Negro mate" />
      </div>
    </div>
  );
}

function ServiciosStep({
  services,
  selected,
  onChange,
}: {
  services: { id: string; titulo: string; descripcion: string; precio_base: number }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="space-y-2">
      {services.length === 0 ? <p className="text-sm text-muted">Sin servicios cargados.</p> : null}
      {services.map((s) => {
        const on = selected.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            aria-pressed={on}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-[10px] border px-4 py-3 text-left transition-colors',
              on ? 'border-pink-deep bg-[var(--accent-soft)]' : 'border-line bg-paper hover:border-pink-deep',
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-colors',
                  on ? 'border-pink-deep bg-pink-deep text-white' : 'border-line',
                )}
              >
                {on ? '✓' : ''}
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">{s.titulo}</div>
                <div className="text-xs text-muted">{s.descripcion}</div>
              </div>
            </div>
            <span className="num shrink-0 text-sm font-semibold text-pink-deep">
              {formatCurrency(s.precio_base)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RepuestosStep({
  inventory,
  repuestos,
  onChange,
}: {
  inventory: { id: string; nombre: string; stock_actual: number; precio_unitario: number }[];
  repuestos: Record<string, number>;
  onChange: (r: Record<string, number>) => void;
}) {
  const setQty = (id: string, qty: number) => onChange({ ...repuestos, [id]: qty });
  const toggle = (item: { id: string; stock_actual: number }) => {
    if (item.stock_actual <= 0) return;
    const current = repuestos[item.id] ?? 0;
    setQty(item.id, current > 0 ? 0 : 1);
  };
  return (
    <div className="space-y-2">
      {inventory.map((it) => {
        const qty = repuestos[it.id] ?? 0;
        const disabled = it.stock_actual <= 0;
        return (
          <div
            key={it.id}
            className={cn(
              'flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3',
              qty > 0 ? 'border-pink-deep bg-[var(--accent-soft)]' : 'border-line bg-paper',
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">{it.nombre}</div>
              <div className="text-xs text-muted">
                Stock: {it.stock_actual} u. · {formatCurrency(it.precio_unitario)}
              </div>
            </div>
            {disabled ? (
              <span className="text-xs font-semibold text-pink-deep">Sin stock</span>
            ) : (
              <div className="flex shrink-0 items-center gap-3">
                {qty > 0 ? (
                  <>
                    <QtyStepper value={qty} onChange={(v) => setQty(it.id, v)} min={0} max={it.stock_actual} />
                    <span className="num w-20 text-right text-sm font-semibold text-pink-deep">
                      {formatCurrency(it.precio_unitario * qty)}
                    </span>
                  </>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => toggle(it)}>
                    Agregar
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ObsStep({
  draft,
  set,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Observaciones que vio el mecánico</FieldLabel>
        <textarea
          value={draft.observaciones}
          onChange={(e) => set('observaciones', e.target.value)}
          placeholder="Ej. La corona trasera está muy desgastada, recomendamos cambiarla…"
          className="min-h-[92px] w-full rounded-card border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-pink-deep focus:outline-none"
        />
      </div>
      <div>
        <FieldLabel>Fecha estimada de entrega</FieldLabel>
        <Input type="date" value={draft.fechaEntrega} onChange={(e) => set('fechaEntrega', e.target.value)} />
      </div>
    </div>
  );
}

function ResumenStep({
  services,
  inventory,
  repuestos,
  subtotalServices,
  subtotalRepuestos,
  total,
}: {
  services: { id: string; titulo: string; precio_base: number }[];
  inventory: { id: string; nombre: string; precio_unitario: number }[];
  repuestos: Record<string, number>;
  subtotalServices: number;
  subtotalRepuestos: number;
  total: number;
}) {
  const repuestoRows = Object.entries(repuestos).filter(([, q]) => q > 0);
  return (
    <div className="space-y-6">
      <div className="rounded-card border border-line bg-paper p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Servicios</h3>
        <div className="mt-3 divide-y divide-line">
          {services.length === 0 && <p className="text-sm text-muted">Sin servicios seleccionados.</p>}
          {services.map((s) => (
            <Row name={s.titulo} price={s.precio_base} key={s.id} />
          ))}
        </div>
        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Repuestos</h3>
        <div className="mt-3 divide-y divide-line">
          {repuestoRows.length === 0 && <p className="text-sm text-muted">Sin repuestos.</p>}
          {repuestoRows.map(([id, qty]) => {
            const item = inventory.find((i) => i.id === id);
            return (
              <Row key={id} name={item?.nombre ?? id} sub={`${qty} u.`} price={(item?.precio_unitario ?? 0) * qty} />
            );
          })}
        </div>
      </div>

      <div className="rounded-card bg-ink p-5 text-paper">
        <div className="flex justify-between py-1">
          <span className="text-paper/70">Subtotal servicios</span>
          <span className="num">{formatCurrency(subtotalServices)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-paper/70">Repuestos</span>
          <span className="num">{formatCurrency(subtotalRepuestos)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-paper/25 pt-3">
          <span className="font-display text-lg font-bold">Total</span>
          <span className="num font-display text-2xl font-bold text-pink">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="rounded-card border border-line bg-[var(--accent-soft)] p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-deep text-white">✓</span>
          <div>
            <h3 className="font-display text-base font-semibold text-ink">¿Guardar la orden?</h3>
            <p className="mt-1 text-sm text-muted">
              Al confirmar se crea la orden de trabajo y, al ejecutarla, se descuentan los repuestos del inventario.
            </p>
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
