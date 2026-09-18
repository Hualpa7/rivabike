import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServicesAdmin } from '@/features/services/api';
import { useInventoryItems } from '@/features/inventory/api';
import { useCreatePresupuesto, usePresupuesto } from '@/features/presupuestos/api';
import type { CreatePresupuestoInput } from '@/types';
import { StepWizard } from '@/components/ui/StepWizard';
import { PageHeader } from './PageHeader';
import {
  BiciStep,
  ClienteStep,
  ObsStep,
  RepuestosStep,
  ResumenStep,
  ServiciosStep,
  type WizardDraft,
  type WizardSet,
} from '@/features/work-orders/components/steps';

type Draft = WizardDraft;

const STEPS = ['Cliente', 'Bici', 'Servicios', 'Repuestos', 'Obs.', 'Resumen'];

const initialDraft: Draft = {
  nombre: '',
  telefono: '',
  marca: '',
  color: '',
  serviceIds: [],
  servicePrices: {},
  repuestos: {},
  repuestoPrices: {},
  observaciones: '',
};

/** Wizard de nuevo presupuesto en 6 pasos (reutiliza los pasos de ordenes). */
export function NuevaPresupuestoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: services = [] } = useServicesAdmin();
  const { data: inventory = [], isLoading: inventoryLoading } = useInventoryItems({ onlyActive: true });
  const create = useCreatePresupuesto();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  // Flag solo de control (no se muestra): useRef evita re-renders inútiles.
  const prefilledRef = useRef(false);

  const presupuestoId = searchParams.get('presupuesto') ?? undefined;
  const { data: presupuesto } = usePresupuesto(presupuestoId ?? '');

  useEffect(() => {
    if (!presupuesto || prefilledRef.current) return;
    const serviceIds: string[] = [];
    const servicePrices: Record<string, number> = {};
    for (const s of presupuesto.services) {
      if (s.service_id) {
        serviceIds.push(s.service_id);
        servicePrices[s.service_id] = s.unit_price;
      }
    }
    const repuestos: Record<string, number> = {};
    const repuestoPrices: Record<string, number> = {};
    for (const it of presupuesto.inventoryItems) {
      if (it.inventory_item_id) {
        repuestos[it.inventory_item_id] = it.quantity;
        repuestoPrices[it.inventory_item_id] = it.unit_price;
      }
    }
    setDraft((d) => ({
      ...d,
      nombre: `${presupuesto.customer.nombre} ${presupuesto.customer.apellido}`.trim(),
      telefono: presupuesto.customer.telefono,
      marca: presupuesto.bicycle.marca,
      color: presupuesto.bicycle.color ?? '',
      serviceIds,
      servicePrices,
      repuestos,
      repuestoPrices,
      observaciones: presupuesto.observaciones ?? '',
    }));
    prefilledRef.current = true;
  }, [presupuesto]);

  const set: WizardSet<Draft> = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const selectedIds = new Set(draft.serviceIds);
  const selectedServices = services.filter((s) => selectedIds.has(s.id));
  const selectedRepuestos = Object.entries(draft.repuestos).filter(([, qty]) => qty > 0);

  const subtotalServices = selectedServices.reduce(
    (a, s) => a + (draft.servicePrices[s.id] ?? s.precio_base),
    0,
  );
  const subtotalRepuestos = selectedRepuestos.reduce((a, [id, qty]) => {
    const price = draft.repuestoPrices[id];
    const item = inventory.find((i) => i.id === id);
    return a + (price ?? item?.precio_unitario ?? 0) * qty;
  }, 0);
  const total = subtotalServices + subtotalRepuestos;

  // Validacion por paso
  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return draft.nombre.trim().length > 0;
      case 1:
        return draft.marca.trim().length > 0;
      default:
        return true;
    }
  }, [step, draft]);

  const guardar = () => {
    const [nombreRaw, ...rest] = draft.nombre.trim().split(/\s+/);
    const nombre = nombreRaw ?? '';
    const apellido = rest.join(' ');
    const input: CreatePresupuestoInput = {
      customer: { nombre, apellido, telefono: draft.telefono },
      bicycle: { marca: draft.marca, color: draft.color || null },
      observaciones: draft.observaciones || null,
      services: selectedServices.map((s) => ({
        service_id: s.id,
        title_snapshot: s.titulo,
        description_snapshot: s.descripcion,
        unit_price: draft.servicePrices[s.id] ?? s.precio_base,
        quantity: 1,
      })),
      inventory_items: selectedRepuestos.map(([id, qty]) => {
        const item = inventory.find((i) => i.id === id);
        return {
          inventory_item_id: id,
          name_snapshot: item?.nombre ?? id,
          unit_price: draft.repuestoPrices[id] ?? item?.precio_unitario ?? 0,
          quantity: qty,
        };
      }),
    };
    create.mutateAsync(input).then(() => navigate('/dashboard/presupuestos'));
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
      <PageHeader title="Nuevo presupuesto" sub="Presupuesto" />

      <StepWizard
        steps={STEPS}
        current={step}
        onNext={canNext ? onNext : undefined}
        onBack={onBack}
        nextLabel={isLast ? 'Guardar presupuesto' : 'Siguiente'}
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
            <ServiciosStep
              services={services}
              selected={draft.serviceIds}
              onChange={(ids) => set('serviceIds', ids)}
              servicePrices={draft.servicePrices}
              onPriceChange={(id, price) =>
                setDraft((d) => ({ ...d, servicePrices: { ...d.servicePrices, [id]: price } }))
              }
            />
          )}
          {step === 3 && (
            <RepuestosStep
              inventory={inventory}
              isLoading={inventoryLoading}
              repuestos={draft.repuestos}
              onChange={(r) => set('repuestos', r)}
              repuestoPrices={draft.repuestoPrices}
              onPriceChange={(id, price) =>
                setDraft((d) => ({ ...d, repuestoPrices: { ...d.repuestoPrices, [id]: price } }))
              }
            />
          )}
          {step === 4 && (
            <ObsStep value={draft.observaciones} onChange={(v) => set('observaciones', v)} />
          )}
          {step === 5 && (
            <ResumenStep
              services={selectedServices}
              inventory={inventory}
              repuestos={draft.repuestos}
              servicePrices={draft.servicePrices}
              repuestoPrices={draft.repuestoPrices}
              subtotalServices={subtotalServices}
              subtotalRepuestos={subtotalRepuestos}
              total={total}
              confirmTitle="¿Guardar el presupuesto?"
              confirmText="Al confirmar se crea el presupuesto sin descontar stock del inventario."
            />
          )}
        </div>
      </StepWizard>
    </div>
  );
}