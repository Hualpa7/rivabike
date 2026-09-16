import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useServicesAdmin } from '@/features/services/api';
import { useInventoryItems } from '@/features/inventory/api';
import { useCreateWorkOrder, useUploadWorkOrderPhoto } from '@/features/work-orders/api';
import { usePresupuesto } from '@/features/presupuestos/api';
import type { CreateWorkOrderInput } from '@/types';
import { Input } from '@/components/ui/Input';
import { StepWizard } from '@/components/ui/StepWizard';
import { ReviewPhotoUpload, MAX_WORK_ORDER_PHOTOS } from '@/components/ui/ReviewPhotoUpload';
import { PageHeader } from './PageHeader';
import {
  BiciStep,
  ClienteStep,
  FieldLabel,
  ObsStep,
  RepuestosStep,
  ResumenStep,
  ServiciosStep,
  type WizardDraft,
  type WizardSet,
} from '@/features/work-orders/components/steps';

// Las fotos de ordenes no se categorizan (antes/durante/despues); la
// columna `tipo` de la DB lo exige, asi que se guarda siempre este valor.
const PHOTO_TIPO = 'antes';

type Draft = WizardDraft & {
  fechaEntrega: string;
  senia: number;
  photos: File[];
};

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
  fechaEntrega: '',
  senia: 0,
  photos: [],
};

/** Wizard de nueva orden de trabajo en 6 pasos. */
export function NuevaOrdenPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: services = [] } = useServicesAdmin();
  const { data: inventory = [] } = useInventoryItems({ onlyActive: true });
  const create = useCreateWorkOrder();
  const uploadPhoto = useUploadWorkOrderPhoto();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [prefilled, setPrefilled] = useState(false);

  const presupuestoId = searchParams.get('presupuesto') ?? undefined;
  const { data: presupuesto } = usePresupuesto(presupuestoId ?? '');

  useEffect(() => {
    if (!presupuesto || prefilled) return;
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
    setPrefilled(true);
  }, [presupuesto, prefilled]);

  const set: WizardSet<Draft> = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const selectedServices = services.filter((s) => draft.serviceIds.includes(s.id));
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
  const total = Math.max(subtotalServices + subtotalRepuestos - (draft.senia ?? 0), 0);

  // Validacion por paso
  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return draft.nombre.trim().length > 0;
      case 1:
        return draft.marca.trim().length > 0;
      case 4:
        return draft.fechaEntrega.trim().length > 0;
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
      bicycle: { marca: draft.marca, color: draft.color || null },
      fecha_estimada_entrega: draft.fechaEntrega || null,
      observaciones: draft.observaciones || null,
      senia: draft.senia > 0 ? draft.senia : undefined,
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
    create
      .mutateAsync(input)
      .then(async (data) => {
        if (draft.photos.length > 0) {
          try {
            await Promise.all(
              draft.photos.map((file) =>
                uploadPhoto.mutateAsync({
                  workOrderId: data.id,
                  file,
                  tipo: PHOTO_TIPO,
                }),
              ),
            );
          } catch {
            toast.error('La orden se creó, pero no se pudieron subir todas las fotos.');
          }
        }
        navigate('/dashboard/ordenes');
      })
      .catch(() => {
        toast.error('No se pudo crear la orden. Intentalo de nuevo.');
      });
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
      <PageHeader title="Nueva orden" sub="Orden de trabajo" />

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
              repuestos={draft.repuestos}
              onChange={(r) => set('repuestos', r)}
              repuestoPrices={draft.repuestoPrices}
              onPriceChange={(id, price) =>
                setDraft((d) => ({ ...d, repuestoPrices: { ...d.repuestoPrices, [id]: price } }))
              }
            />
          )}
          {step === 4 && (
            <div className="space-y-5">
              <ObsStep value={draft.observaciones} onChange={(v) => set('observaciones', v)} />
              <div>
                <FieldLabel>Fotos de la orden</FieldLabel>
                <ReviewPhotoUpload
                  photos={draft.photos}
                  max={MAX_WORK_ORDER_PHOTOS}
                  onAdd={(files) => set('photos', [...draft.photos, ...files])}
                  onRemove={(index) =>
                    set('photos', draft.photos.filter((_, i) => i !== index))
                  }
                />
                <p className="mt-1.5 text-xs text-muted">
                  Adjuntá fotos del estado de la bici. Se suben junto con la orden.
                </p>
              </div>
              <div>
                <FieldLabel required>Fecha estimada de entrega</FieldLabel>
                <Input type="date" value={draft.fechaEntrega} onChange={(e) => set('fechaEntrega', e.target.value)} required />
              </div>
            </div>
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
              senia={draft.senia > 0 ? draft.senia : 0}
              onSeniaChange={(v) => set('senia', v)}
              confirmTitle="¿Guardar la orden?"
              confirmText="Al confirmar se crea la orden de trabajo y los repuestos se descuentan del inventario."
            />
          )}
        </div>
      </StepWizard>
    </div>
  );
}