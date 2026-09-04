import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Service } from '@/types';
import {
  useServicesAdmin,
  useCreateService,
  useUpdateService,
  useServiceCategories,
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
} from '@/features/services/api';
import { uploadImage } from '@/lib/supabase/storage';
import { formatCurrency } from '@/lib/utils/fmt';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PlusIcon, SearchIcon } from '@/components/ui/icons';
import { PageHeader } from './PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

interface FormValues {
  titulo: string;
  descripcion: string;
  precio_base: number;
  plazo: string | null;
  categoria_id: string | null;
  imagen_url: string | null;
  activo: boolean;
}

const schema = z.object({
  titulo: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  precio_base: z.coerce.number().min(0, 'Precio inválido'),
  plazo: z.string().nullable().optional(),
  categoria_id: z.string().nullable().optional(),
  imagen_url: z.string().nullable().optional(),
  activo: z.boolean(),
});

/** Pagina Servicios del panel: catalogo con alta / edicion + categorias. */
export function ServiciosPage() {
  const { data: services = [], isLoading } = useServicesAdmin();
  const { data: categories = [] } = useServiceCategories();
  const create = useCreateService();
  const update = useUpdateService();
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setOpen(true);
  };

  const handleAddCategory = async () => {
    const nombre = newCategory.trim();
    if (!nombre) return;
    await createCategory.mutateAsync({ nombre });
    setNewCategory('');
  };

  const startEditCategory = (c: { id: string; nombre: string }) => {
    setEditCategoryId(c.id);
    setEditCategoryName(c.nombre);
  };

  const saveEditCategory = async () => {
    const nombre = editCategoryName.trim();
    if (!editCategoryId || !nombre) return;
    await updateCategory.mutateAsync({ id: editCategoryId, nombre });
    setEditCategoryId(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = async (c: { id: string; nombre: string }) => {
    if (!window.confirm(`¿Seguro que querés eliminar la categoría "${c.nombre}"? Los servicios asociados quedarán sin categoría.`))
      return;
    await deleteCategory.mutateAsync({ id: c.id });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trabajos / Servicios"
        sub="Catálogo de servicios que ofrece el taller"
        action={
          <Button onClick={openNew}>
            <PlusIcon size={18} />
            Nuevo servicio
          </Button>
        }
      />

      <section className="rounded-card border-2 border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Categorías</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-5 py-4">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-pill border border-line px-3 py-1 text-xs font-medium text-ink"
            >
              {editCategoryId === c.id ? (
                <>
                  <Input
                    autoFocus
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void saveEditCategory();
                      }
                      if (e.key === 'Escape') {
                        setEditCategoryId(null);
                        setEditCategoryName('');
                      }
                    }}
                    className="w-28 py-0.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => void saveEditCategory()}
                    disabled={updateCategory.isPending}
                    aria-label="Guardar categoría"
                    className="text-pink-deep hover:text-pink-deep/80"
                  >
                    <CheckIcon />
                  </button>
                </>
              ) : (
                <>
                  {c.nombre}
                  <button
                    type="button"
                    onClick={() => startEditCategory(c)}
                    aria-label={`Editar ${c.nombre}`}
                    className="text-muted transition-colors hover:text-ink"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteCategory(c)}
                    disabled={deleteCategory.isPending}
                    aria-label={`Eliminar ${c.nombre}`}
                    className="text-muted transition-colors hover:text-pink-deep"
                  >
                    <TrashIcon />
                  </button>
                </>
              )}
            </span>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddCategory();
                }
              }}
              placeholder="Nueva categoría…"
              className="w-44 py-2 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleAddCategory()}
              loading={createCategory.isPending}
            >
              Crear
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-card border-2 border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Servicios activos</h2>
          <span className="num text-sm text-muted">{services.length} servicios</span>
        </div>

        {services.length === 0 ? (
          <EmptyState
            icon={<SearchIcon size={24} />}
            title="Sin servicios"
            description="No hay servicios cargados todavía."
            className="m-5"
          />
        ) : (
          <div className="divide-y divide-line">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  {s.imagen_url ? (
                    <img
                      src={s.imagen_url}
                      alt=""
                      className="h-12 w-14 shrink-0 rounded-card object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-ink">{s.titulo}</div>
                    <div className="truncate text-xs text-muted">
                      {s.categoria_nombre ?? s.categoria ?? 'Sin categoría'}
                      {s.descripcion ? ` · ${s.descripcion}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="num font-mono text-sm font-semibold text-pink-deep">
                    {formatCurrency(s.precio_base)}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    aria-label={`Editar ${s.titulo}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-pink-deep hover:text-pink-deep"
                  >
                    <PencilIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ServiceFormModal
        open={open}
        service={editing}
        categories={categories}
        busy={create.isPending || update.isPending}
        onClose={() => setOpen(false)}
        onSubmit={(values) => {
          if (editing) {
            update.mutateAsync({ id: editing.id, ...values }).then(() => setOpen(false));
          } else {
            create.mutateAsync(values).then(() => setOpen(false));
          }
        }}
      />
    </div>
  );
}

interface ServiceFormModalProps {
  open: boolean;
  service: Service | null;
  categories: Array<{ id: string; nombre: string }>;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

function ServiceFormModal({
  open,
  service,
  categories,
  busy,
  onClose,
  onSubmit,
}: ServiceFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      titulo: service?.titulo ?? '',
      descripcion: service?.descripcion ?? '',
      precio_base: service?.precio_base ?? 0,
      plazo: service?.plazo ?? null,
      categoria_id: service?.categoria_id ?? null,
      imagen_url: service?.imagen_url ?? null,
      activo: service?.activo ?? true,
    },
  });

  const activo = watch('activo');
  const imagenUrl = watch('imagen_url');

  // La opcion "values" de RHF sincroniza el form con la entidad editada
  // automaticamente al cambiar `service`/abrir el modal (fix autofill).

  const upload = async (file: File) =>
    uploadImage({ bucket: 'public-gallery', path: `services/${service?.id ?? 'nuevo'}`, file });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={service ? 'Editar servicio' : 'Nuevo servicio'}
      className="sm:max-w-2xl"
    >
      <form
        onSubmit={handleSubmit((v) =>
          onSubmit({
            ...v,
            precio_base: Number(v.precio_base),
            plazo: v.plazo || null,
            categoria_id: v.categoria_id || null,
            imagen_url: v.imagen_url || null,
          }),
        )}
        className="space-y-5"
      >
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
            Nombre <span className="text-pink-deep">*</span>
          </label>
          <Input
            placeholder="Ej. Ajuste de frenos"
            invalid={!!errors.titulo}
            {...register('titulo')}
          />
          {errors.titulo ? <p className="mt-1 text-xs text-pink-deep">{errors.titulo.message}</p> : null}
        </div>
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Descripción</label>
          <textarea
            placeholder="Qué incluye el servicio…"
            className="min-h-[92px] w-full rounded-card border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-pink-deep focus:outline-none"
            {...register('descripcion')}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
              Precio <span className="text-pink-deep">*</span>
            </label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              invalid={!!errors.precio_base}
              {...register('precio_base')}
            />
            {errors.precio_base ? (
              <p className="mt-1 text-xs text-pink-deep">{errors.precio_base.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Plazo</label>
            <Input placeholder="Ej. Mismo día" {...register('plazo')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Categoría</label>
            <select
              {...register('categoria_id')}
              className="w-full rounded-card border border-line bg-paper px-4 py-3 text-sm text-ink focus:border-pink-deep focus:outline-none"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ImageUpload
          label="Imagen (opcional)"
          value={imagenUrl}
          onChange={(url) => setValue('imagen_url', url)}
          onFile={upload}
        />
        <div className="flex items-center justify-between rounded-card border border-line px-4 py-3">
          <div>
            <div className="text-sm font-medium text-ink">Servicio activo</div>
            <div className="text-xs text-muted">Se muestra en la lista y en el wizard</div>
          </div>
          <Switch checked={activo} onChange={(v) => setValue('activo', v)} label="Servicio activo" />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
    </svg>
  );
}
