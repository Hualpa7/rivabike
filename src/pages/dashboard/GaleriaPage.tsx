import { useState } from 'react';
import type { GalleryItemWithImages } from '@/types';
import {
  useGalleryItemsAdmin,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useUploadGalleryImages,
  useDeleteGalleryImage,
} from '@/features/gallery/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';
import { Switch } from '@/components/ui/Switch';
import { PlusIcon, ImageIcon } from '@/components/ui/icons';
import { PageHeader } from './PageHeader';

/** Galeria del panel: alta/edición de trabajos + subida/borrado de imágenes. */
export function GaleriaPage() {
  const { data: items = [], isLoading } = useGalleryItemsAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GalleryItemWithImages | null>(null);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galería"
        sub="Trabajos terminados para el sitio público"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon size={18} />
            Nuevo trabajo
          </Button>
        }
      />

      {items.length === 0 ? (
        <p className="text-sm text-muted">No hay trabajos cargados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const img = item.images[0]?.storage_path;
            return (
              <figure
                key={item.id}
                className="group cursor-pointer overflow-hidden rounded-card border-2 border-line bg-paper transition-colors hover:border-pink-deep"
                onClick={() => setEditTarget(item)}
              >
                <div className="relative">
                  {img ? (
                    <img src={img} alt={item.titulo} className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-[var(--surface-2)] text-muted">
                      <ImageIcon size={28} />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-pill bg-black/40 px-2.5 py-1 font-mono text-xs font-semibold text-white backdrop-blur-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-pill bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {item.images.length} foto{item.images.length === 1 ? '' : 's'}
                  </span>
                  {!item.publicado ? (
                    <span className="absolute bottom-3 right-3 rounded-pill bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                      Borrador
                    </span>
                  ) : null}
                </div>
                <figcaption className="px-4 py-3">
                  <div className="text-sm font-semibold text-ink">{item.titulo}</div>
                  {item.categoria ? (
                    <div className="mt-0.5 text-xs text-muted">{item.categoria}</div>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {createOpen ? (
        <CreateWorkModal onClose={() => setCreateOpen(false)} onCreate={() => setCreateOpen(false)} />
      ) : null}

      {editTarget ? (
        <EditWorkModal item={editTarget} onClose={() => setEditTarget(null)} />
      ) : null}
    </div>
  );
}

function CreateWorkModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: () => void;
}) {
  const create = useCreateGalleryItem();
  const upload = useUploadGalleryImages();
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [publicado, setPublicado] = useState(true);
  const [check_1, setCheck1] = useState('');
  const [check_2, setCheck2] = useState('');
  const [check_3, setCheck3] = useState('');
  const [check_4, setCheck4] = useState('');
  const [antes, setAntes] = useState<File | null>(null);
  const [despues, setDespues] = useState<File | null>(null);

  const submit = async () => {
    const item = await create.mutateAsync({
      titulo,
      categoria: categoria || null,
      descripcion: descripcion || null,
      fecha: fecha || null,
      publicado,
      check_1: check_1 || null,
      check_2: check_2 || null,
      check_3: check_3 || null,
      check_4: check_4 || null,
    });
    const files = [antes!, despues!];
    await upload.mutateAsync({
      galleryItemId: item.id,
      files,
      tipos: ['antes', 'despues'],
    });
    onCreate();
  };

  const valid =
    titulo.trim().length > 0 && antes !== null && despues !== null;

  return (
    <Modal open onClose={onClose} title="Nuevo trabajo" className="sm:max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
            Título <span className="text-pink-deep">*</span>
          </label>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Cambio de cubierta 29" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Categoría</label>
            <Input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej. Mantenimiento" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Fecha</label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Descripción</label>
          <Textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Contá qué se hizo en este trabajo…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block cursor-pointer">
            <span className="mb-1.5 flex items-center gap-1 text-[13.5px] font-medium text-muted">
              Foto antes <span className="text-pink-deep">*</span>
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setAntes(e.target.files?.[0] ?? null)}
            />
            <span className="flex h-28 items-center justify-center rounded-card border border-dashed border-line bg-[var(--surface-2)] text-center text-xs font-medium text-muted">
              {antes ? antes.name : 'Subir foto antes'}
            </span>
          </label>
          <label className="block cursor-pointer">
            <span className="mb-1.5 flex items-center gap-1 text-[13.5px] font-medium text-muted">
              Foto después <span className="text-pink-deep">*</span>
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setDespues(e.target.files?.[0] ?? null)}
            />
            <span className="flex h-28 items-center justify-center rounded-card border border-dashed border-line bg-[var(--surface-2)] text-center text-xs font-medium text-muted">
              {despues ? despues.name : 'Subir foto después'}
            </span>
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Qué se hizo</label>
          <div className="space-y-2">
            <Input value={check_1} onChange={(e) => setCheck1(e.target.value)} placeholder="Check 1 · Ej. Cambio de cubierta" />
            <Input value={check_2} onChange={(e) => setCheck2(e.target.value)} placeholder="Check 2" />
            <Input value={check_3} onChange={(e) => setCheck3(e.target.value)} placeholder="Check 3" />
            <Input value={check_4} onChange={(e) => setCheck4(e.target.value)} placeholder="Check 4" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-card border border-line px-4 py-3">
          <div>
            <div className="text-sm font-medium text-ink">Publicado</div>
            <div className="text-xs text-muted">Visible en la galería pública</div>
          </div>
          <Switch checked={publicado} onChange={setPublicado} label="Publicado" />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void submit()}
            loading={create.isPending || upload.isPending}
            disabled={!valid}
          >
            Crear
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditWorkModal({
  item,
  onClose,
}: {
  item: GalleryItemWithImages;
  onClose: () => void;
}) {
  const update = useUpdateGalleryItem();
  const upload = useUploadGalleryImages();
  const del = useDeleteGalleryImage();

  const [titulo, setTitulo] = useState(item.titulo);
  const [categoria, setCategoria] = useState(item.categoria ?? '');
  const [descripcion, setDescripcion] = useState(item.descripcion ?? '');
  const [fecha, setFecha] = useState(item.fecha ?? '');
  const [publicado, setPublicado] = useState(item.publicado);
  const [check_1, setCheck1] = useState(item.check_1 ?? '');
  const [check_2, setCheck2] = useState(item.check_2 ?? '');
  const [check_3, setCheck3] = useState(item.check_3 ?? '');
  const [check_4, setCheck4] = useState(item.check_4 ?? '');
  const [antes, setAntes] = useState<{ id: string; storage_path: string } | null>(
    () => item.images.find((i) => i.tipo === 'antes') ?? item.images[0] ?? null,
  );
  const [despues, setDespues] = useState<{ id: string; storage_path: string } | null>(
    () => item.images.find((i) => i.tipo === 'despues') ?? (item.images[1] && item.images.find((i) => i.tipo !== 'antes') ? item.images[1] : null),
  );

  const save = () => {
    update
      .mutateAsync({
        id: item.id,
        titulo,
        categoria: categoria || null,
        descripcion: descripcion || null,
        fecha: fecha || null,
        publicado,
        check_1: check_1 || null,
        check_2: check_2 || null,
        check_3: check_3 || null,
        check_4: check_4 || null,
      })
      .then(() => {
        onClose();
      });
  };

  const replaceSlot = async (tipo: 'antes' | 'despues', file?: File) => {
    if (!file) return;
    const current = tipo === 'antes' ? antes : despues;
    const [created] = await upload.mutateAsync({
      galleryItemId: item.id,
      files: [file],
      tipos: [tipo],
    });
    if (current) void del.mutateAsync({ id: current.id });
    if (tipo === 'antes') setAntes({ id: created.id, storage_path: created.storage_path });
    else setDespues({ id: created.id, storage_path: created.storage_path });
  };

  return (
    <Modal open onClose={onClose} title="Editar trabajo" className="sm:max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
            Título <span className="text-pink-deep">*</span>
          </label>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Categoría</label>
            <Input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej. Mantenimiento" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Fecha</label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Descripción</label>
          <Textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Contá qué se hizo en este trabajo…"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="block text-[13.5px] font-medium text-muted">Fotos</span>
            <span className="text-xs text-muted">
              Un antes y un después por trabajo
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block cursor-pointer">
              <span className="mb-1.5 flex items-center gap-1 text-[13.5px] font-medium text-muted">
                Antes
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  void replaceSlot('antes', e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <span className="relative block overflow-hidden rounded-card border border-line bg-[var(--surface-2)]">
                {antes ? (
                  <img src={antes.storage_path} alt="Antes" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <span className="flex aspect-[4/3] w-full items-center justify-center text-center text-xs font-medium text-muted">
                    Subir foto antes
                  </span>
                )}
              </span>
            </label>
            <label className="block cursor-pointer">
              <span className="mb-1.5 flex items-center gap-1 text-[13.5px] font-medium text-muted">
                Después
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  void replaceSlot('despues', e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <span className="relative block overflow-hidden rounded-card border border-line bg-[var(--surface-2)]">
                {despues ? (
                  <img src={despues.storage_path} alt="Después" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <span className="flex aspect-[4/3] w-full items-center justify-center text-center text-xs font-medium text-muted">
                    Subir foto después
                  </span>
                )}
              </span>
            </label>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-[13.5px] font-medium text-muted">Qué se hizo</span>
          <div className="space-y-2">
            <Input value={check_1} onChange={(e) => setCheck1(e.target.value)} placeholder="Check 1" />
            <Input value={check_2} onChange={(e) => setCheck2(e.target.value)} placeholder="Check 2" />
            <Input value={check_3} onChange={(e) => setCheck3(e.target.value)} placeholder="Check 3" />
            <Input value={check_4} onChange={(e) => setCheck4(e.target.value)} placeholder="Check 4" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-card border border-line px-4 py-3">
          <div>
            <div className="text-sm font-medium text-ink">Publicado</div>
            <div className="text-xs text-muted">Visible en la galería pública</div>
          </div>
          <Switch checked={publicado} onChange={setPublicado} label="Publicado" />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={save}
            loading={update.isPending}
            disabled={titulo.trim().length === 0}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
