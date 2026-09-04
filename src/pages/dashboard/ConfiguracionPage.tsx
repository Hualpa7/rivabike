import { PageHeader } from './PageHeader';

interface ConfigGroup {
  title: string;
  hint: string;
}

const GROUPS: ConfigGroup[] = [
  { title: 'Datos del negocio', hint: 'Nombre, CUIT, teléfono, correo de contacto.' },
  { title: 'Medios de pago', hint: 'Efectivo, transferencia, tarjetas y cuotas.' },
  { title: 'Preferencias', hint: 'Moneda, huso horario, notificaciones y presupuestos.' },
];

/** Configuracion (dashboard). Fase 6. Secciones pendientes de implementacion. */
export function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        sub="Datos del negocio, medios de pago y preferencias generales."
      />
      <div className="grid gap-4">
        {GROUPS.map((group) => (
          <section
            key={group.title}
            className="rounded-card border-2 border-line bg-paper p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-semibold text-ink">{group.title}</h2>
                <p className="mt-0.5 text-sm text-muted">{group.hint}</p>
              </div>
              <span className="rounded-pill bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-pink-deep">
                Sección pendiente
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
