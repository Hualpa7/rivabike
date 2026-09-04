import type { Service } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils/fmt';
import { servicePresentation } from '@/features/landing/landing';

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
}

/** Modal de detalle de servicio: imagen unica + precio + plazo + CTA. */
export function ServiceModal({ service, onClose }: ServiceModalProps) {
  if (!service) return null;
  const p = servicePresentation(service);

  return (
    <Modal open={!!service} onClose={onClose} title={service.titulo} className="sm:max-w-2xl">
      {service.imagen_url ? (
        <img
          src={service.imagen_url}
          alt={service.titulo}
          className="aspect-[16/9] w-full rounded-card border border-line object-cover"
        />
      ) : null}
      <div className="mt-6">
        <p className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-pink-deep">
          Servicio
        </p>
        <h3 className="mt-1 font-display text-2xl font-bold text-ink">{service.titulo}</h3>
        {p.note ? <p className="mt-1 text-muted">{p.note}</p> : null}
        <p className="mt-4 leading-relaxed text-ink">{service.descripcion}</p>

        <dl className="mt-6 divide-y divide-line border-y border-line">
          <div className="flex items-center justify-between py-3">
            <dt className="font-mono text-xs uppercase tracking-wide text-muted">Precio de referencia</dt>
            <dd className="font-mono text-lg font-bold text-pink-deep">
              {formatCurrency(service.precio_base)}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="font-mono text-xs uppercase tracking-wide text-muted">Plazo</dt>
            <dd className="font-mono text-sm font-semibold text-ink">{p.time}</dd>
          </div>
        </dl>

        <a
          href="#contacto"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-pill bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-pink-deep"
        >
          Solicitar presupuesto
        </a>
      </div>
    </Modal>
  );
}
