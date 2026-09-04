import { useState } from 'react';
import type { SiteSettings } from '@/types';
import { useSiteSettingsAdmin, useUpdateSiteSettings } from '@/features/settings/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from './PageHeader';

type StringField = {
  [K in keyof SiteSettings]: SiteSettings[K] extends string | null ? K : never;
}[keyof SiteSettings];

const BLOCKS: { key: StringField; label: string; desc: string }[] = [
  { key: 'hero_titulo', label: 'Hero · título', desc: 'El titular principal de la portada' },
  { key: 'hero_eyebrow', label: 'Hero · subtítulo', desc: 'Apoyo del titular' },
  // About
  { key: 'about_titulo', label: 'Nosotros · título', desc: 'Título de la sección "nosotros"' },
  { key: 'about_descripcion', label: 'Nosotros · descripción', desc: 'Quiénes somos y cómo trabajamos' },
  { key: 'about_check_1', label: 'Nosotros · check 1', desc: 'Primer punto destacado' },
  { key: 'about_check_1_descripcion', label: 'Nosotros · check 1 descripción', desc: 'Detalle del primer punto destacado' },
  { key: 'about_check_2', label: 'Nosotros · check 2', desc: 'Segundo punto destacado' },
  { key: 'about_check_2_descripcion', label: 'Nosotros · check 2 descripción', desc: 'Detalle del segundo punto destacado' },
  // Cómo trabajamos
  { key: 'how_it_works_titulo', label: 'Cómo trabajamos · título', desc: 'Título de la sección' },
  { key: 'how_it_works_subtitulo', label: 'Cómo trabajamos · subtítulo', desc: 'Apoyo del título' },
  { key: 'how_it_works_descripcion', label: 'Cómo trabajamos · descripción', desc: 'Texto introductorio' },
  { key: 'how_we_work_paso1_titulo', label: 'Proceso · paso 1 título', desc: 'Nombre del paso 1' },
  { key: 'how_we_work_paso1_descripcion', label: 'Proceso · paso 1 texto', desc: 'Detalle del paso 1' },
  { key: 'how_we_work_paso2_titulo', label: 'Proceso · paso 2 título', desc: 'Nombre del paso 2' },
  { key: 'how_we_work_paso2_descripcion', label: 'Proceso · paso 2 texto', desc: 'Detalle del paso 2' },
  { key: 'how_we_work_paso3_titulo', label: 'Proceso · paso 3 título', desc: 'Nombre del paso 3' },
  { key: 'how_we_work_paso3_descripcion', label: 'Proceso · paso 3 texto', desc: 'Detalle del paso 3' },
  { key: 'how_we_work_paso4_titulo', label: 'Proceso · paso 4 título', desc: 'Nombre del paso 4' },
  { key: 'how_we_work_paso4_descripcion', label: 'Proceso · paso 4 texto', desc: 'Detalle del paso 4' },
  // Reseñas
  { key: 'reviews_titulo', label: 'Reseñas · título', desc: 'Título de la sección de reseñas' },
  { key: 'reviews_subtitulo', label: 'Reseñas · subtítulo', desc: 'Apoyo del título' },
  // Servicios
  { key: 'services_titulo', label: 'Servicios · título', desc: 'Título de la sección de servicios' },
  { key: 'services_subtitulo', label: 'Servicios · subtítulo', desc: 'Apoyo del título' },
  // Contacto
  { key: 'descripcion', label: 'Nosotros · descripción', desc: 'Quiénes somos y cómo trabajamos' },
  { key: 'direccion', label: 'Contacto · dirección', desc: 'Dónde encontrarnos' },
  { key: 'horarios', label: 'Contacto · horarios', desc: 'Horarios de atención' },
];

/** Contenido del sitio: bloques editables que alimentan la landing. */
export function ContenidoPage() {
  const { data: settings } = useSiteSettingsAdmin();
  const update = useUpdateSiteSettings();
  const [editing, setEditing] = useState<(typeof BLOCKS)[number] | null>(null);
  const [value, setValue] = useState('');

  const openEdit = (block: (typeof BLOCKS)[number]) => {
    setValue(settings?.[block.key] ?? '');
    setEditing(block);
  };

  const save = () => {
    if (!editing) return;
    update
      .mutateAsync({ [editing.key]: value } as Partial<SiteSettings>)
      .then(() => setEditing(null));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Contenido del sitio" sub="Textos y datos que alimentan la web pública" />

      <section className="overflow-hidden rounded-card border-2 border-line bg-paper">
        <div className="divide-y divide-line">
          {BLOCKS.map((b) => (
            <div key={b.key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-ink">{b.label}</div>
                <div className="truncate text-xs text-muted">{b.desc}</div>
              </div>
              <button
                type="button"
                onClick={() => openEdit(b)}
                aria-label={`Editar ${b.label}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-pink-deep hover:text-pink-deep"
              >
                <PencilIcon />
              </button>
            </div>
          ))}
        </div>
      </section>

      {editing ? (
        <Modal open onClose={() => setEditing(null)} title="Editar bloque" className="sm:max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Bloque</label>
              <Input disabled value={editing.label} />
            </div>
            <div>
              <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Texto</label>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Contenido actualizado del bloque"
                className="min-h-[140px] w-full rounded-card border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-pink-deep focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={save} loading={update.isPending}>
                Guardar
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
