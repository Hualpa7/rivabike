import { useEffect, useMemo, useState } from 'react';
import type { InventoryItem, StockMovement } from '@/types';
import {
  useInventoryItems,
  useStockMovements,
  useRegisterStockMovement,
  useCreateInventoryItem,
  useUpdateInventoryItem,
} from '@/features/inventory/api';
import { formatCurrency, formatDateDayMonthYear } from '@/lib/utils/fmt';
import { cn } from '@/lib/utils/cn';
import { uploadImage, resolveStoredPath } from '@/lib/supabase/storage';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';
import { Chip } from '@/components/ui/Chip';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { QtyStepper } from '@/components/ui/QtyStepper';
import { Switch } from '@/components/ui/Switch';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { SearchIcon, PlusIcon, ImageIcon } from '@/components/ui/icons';
import { PageHeader } from './PageHeader';
import {
  stockStatus,
  STOCK_STATUS_LABEL,
  STOCK_STATUS_DOT,
  STOCK_STATUS_BG,
  STOCK_STATUS_TEXT,
} from './stock';

type Filter = 'todos' | 'ok' | 'bajo' | 'sin_stock';
type ShowFilter = 'activos' | 'todos' | 'inactivos';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'ok', label: 'Con stock' },
  { key: 'bajo', label: 'Stock bajo' },
  { key: 'sin_stock', label: 'Sin stock' },
];

const SHOW_FILTERS: { key: ShowFilter; label: string }[] = [
  { key: 'activos', label: 'Activos' },
  { key: 'todos', label: 'Ver todos' },
  { key: 'inactivos', label: 'Deshabilitados' },
];

const MOVE_LABEL: Record<StockMovement['tipo'], string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  ajuste: 'Ajuste',
  consumo_trabajo: 'Consumo',
  devolucion: 'Devolución',
};

const MOVE_SIGN: Record<StockMovement['tipo'], number> = {
  entrada: 1,
  salida: -1,
  ajuste: 0,
  consumo_trabajo: -1,
  devolucion: 1,
};

/** Inventario del panel: busqueda + chips + tabla/cards + ajuste de stock + movimientos. */
export function InventarioPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [show, setShow] = useState<ShowFilter>('activos');
  const { data: items = [], isLoading } = useInventoryItems({ search });
  const create = useCreateInventoryItem();
  const update = useUpdateInventoryItem();
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [movementsTarget, setMovementsTarget] = useState<InventoryItem | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (show === 'activos' && !i.activo) return false;
      if (show === 'inactivos' && i.activo) return false;
      if (filter === 'todos') return true;
      return stockStatus(i.stock_actual) === filter;
    });
  }, [items, filter, show]);

  const clearFilters = () => {
    setSearch('');
    setFilter('todos');
    setShow('activos');
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        sub="Repuestos y consumibles del taller"
        action={
          <Button onClick={() => setNewOpen(true)}>
            <PlusIcon size={18} />
            Nuevo producto
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex min-w-[240px] flex-1 items-center gap-2 rounded-pill border border-line bg-paper px-4 py-2.5">
          <SearchIcon size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en inventario…"
            aria-label="Buscar en inventario"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div role="group" aria-label="Filtrar por stock" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div role="group" aria-label="Mostrar por estado" className="flex flex-wrap gap-2">
          {SHOW_FILTERS.map((f) => (
            <Chip key={f.key} active={show === f.key} onClick={() => setShow(f.key)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Tabla desktop */}
      <section className="hidden overflow-hidden rounded-card border-2 border-line bg-paper md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-[0.05em] text-muted">
              <th className="px-5 py-3 font-semibold">Producto</th>
              <th className="px-5 py-3 font-semibold">Stock</th>
              <th className="px-5 py-3 text-right font-semibold">Precio</th>
              <th className="px-5 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold">Último movimiento</th>
              <th className="w-32 px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">Cargando…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyStateBlock onClear={clearFilters} />
                </td>
              </tr>
            ) : (
              filtered.map((i) => (
                <RowItem
                  key={i.id}
                  item={i}
                  onAdjust={setAdjustTarget}
                  onEdit={setEditTarget}
                  onMovements={setMovementsTarget}
                />
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Cards moviles */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <p className="text-sm text-muted">Cargando…</p>
        ) : filtered.length === 0 ? (
          <EmptyStateBlock onClear={clearFilters} />
        ) : (
          filtered.map((i) => (
            <MobileCard
              key={i.id}
              item={i}
              onAdjust={setAdjustTarget}
              onEdit={setEditTarget}
              onMovements={setMovementsTarget}
            />
          ))
        )}
      </div>

      {movementsTarget ? (
        <MovementsModal item={movementsTarget} onClose={() => setMovementsTarget(null)} />
      ) : null}

      {adjustTarget ? (
        <AdjustStockModal item={adjustTarget} onClose={() => setAdjustTarget(null)} />
      ) : null}

      {editTarget ? (
        <EditProductoModal
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(input) =>
            update.mutateAsync({ id: editTarget.id, ...input }).then(() => setEditTarget(null))
          }
          busy={update.isPending}
        />
      ) : null}

      {newOpen ? (
        <NewItemModal
          onClose={() => setNewOpen(false)}
          onSubmit={(input) =>
            create.mutateAsync(input).then(() => setNewOpen(false))
          }
          busy={create.isPending}
        />
      ) : null}
    </div>
  );
}

function RowItem({
  item,
  onAdjust,
  onEdit,
  onMovements,
}: {
  item: InventoryItem;
  onAdjust: (i: InventoryItem) => void;
  onEdit: (i: InventoryItem) => void;
  onMovements: (i: InventoryItem) => void;
}) {
  const s = stockStatus(item.stock_actual);
  return (
    <tr className="transition-colors hover:bg-[var(--surface-2)]">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <ItemThumb url={item.imagen_url} />
          <div>
            <div className="text-sm font-semibold text-ink">{item.nombre}</div>
            <div className="text-xs text-muted">{item.descripcion ?? '—'}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="num">{item.stock_actual} u.</span>
      </td>
      <td className="num px-5 py-3.5 text-right font-semibold text-ink">
        {formatCurrency(item.precio_unitario)}
      </td>
      <td className="px-5 py-3.5">
        <StockBadge status={s} />
      </td>
      <td className="px-5 py-3.5">
        <LastMovement itemId={item.id} />
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onMovements(item)}
            aria-label={`Movimientos de ${item.nombre}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-line text-muted transition-colors hover:border-pink-deep hover:text-pink-deep"
          >
            <HistoryIcon />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Editar ${item.nombre}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-line text-muted transition-colors hover:border-pink-deep hover:text-pink-deep"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            onClick={() => onAdjust(item)}
            aria-label={`Ajustar stock de ${item.nombre}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-line text-muted transition-colors hover:border-pink-deep hover:text-pink-deep"
          >
            <PlusIcon size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function MobileCard({
  item,
  onAdjust,
  onEdit,
  onMovements,
}: {
  item: InventoryItem;
  onAdjust: (i: InventoryItem) => void;
  onEdit: (i: InventoryItem) => void;
  onMovements: (i: InventoryItem) => void;
}) {
  const s = stockStatus(item.stock_actual);
  return (
    <div className="rounded-card border-2 border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ItemThumb url={item.imagen_url} />
          <div>
            <div className="text-sm font-semibold text-ink">{item.nombre}</div>
            <div className="mt-1 text-xs text-muted">{item.descripcion ?? '—'}</div>
          </div>
        </div>
        <StockBadge status={s} />
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Stock</dt>
          <dd className="num">{item.stock_actual} u.</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Precio</dt>
          <dd className="num font-semibold text-pink-deep">{formatCurrency(item.precio_unitario)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Último movimiento</dt>
          <dd className="flex items-center gap-1.5">
            <LastMovement itemId={item.id} />
          </dd>
        </div>
      </dl>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" onClick={() => onMovements(item)}>
          Movimientos
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onAdjust(item)}>
          Ajustar stock
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onEdit(item)}>
          Editar
        </Button>
      </div>
    </div>
  );
}

/** Mini imagen del producto; resuelve signed URL para buckets privados. */
function ItemThumb({ url }: { url: string | null }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!url) {
      setSrc(null);
      return;
    }
    resolveStoredPath('inventory-images', url)
      .then((resolved) => {
        if (active) setSrc(resolved);
      })
      .catch(() => {
        if (active) setSrc(url);
      });
    return () => {
      active = false;
    };
  }, [url]);
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-[var(--surface-2)]">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon size={16} className="text-muted" />
      )}
    </div>
  );
}

/** Muestra el último movimiento del ítem (por fecha). */
function LastMovement({ itemId }: { itemId: string }) {
  const { data: movements = [] } = useStockMovements({ inventoryItemId: itemId });
  const last = movements[0];
  if (!last) return <span className="text-sm text-muted">—</span>;
  const sign = MOVE_SIGN[last.tipo] || 1;
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'text-xs font-semibold',
          sign > 0 ? 'text-emerald-600' : sign < 0 ? 'text-pink-deep' : 'text-muted',
        )}
      >
        {sign > 0 ? '+' : ''}
        {last.cantidad} u.
      </span>
      <span className="text-xs text-muted">{MOVE_LABEL[last.tipo]}</span>
    </div>
  );
}

function MovementsModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { data: movements = [], isLoading } = useStockMovements({ inventoryItemId: item.id });
  return (
    <Modal open onClose={onClose} title={`Movimientos · ${item.nombre}`} className="sm:max-w-2xl">
      <div className="max-h-[60vh] overflow-auto rounded-card border-2 border-line">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted">Cargando…</p>
        ) : movements.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Sin movimientos registrados.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-[11.5px] uppercase tracking-[0.05em] text-muted">
                <th className="px-4 py-2.5 font-semibold">Fecha</th>
                <th className="px-4 py-2.5 font-semibold">Movimiento</th>
                <th className="px-4 py-2.5 text-right font-semibold">Cantidad</th>
                <th className="px-4 py-2.5 text-right font-semibold">Resultante</th>
                <th className="px-4 py-2.5 font-semibold">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {movements.map((m) => {
                const sign = MOVE_SIGN[m.tipo] || 1;
                return (
                  <tr key={m.id} className="align-top text-sm">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {formatDateDayMonthYear(m.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-semibold',
                          sign > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : sign < 0
                              ? 'bg-pink-50 text-pink-deep'
                              : 'bg-[var(--surface-3)] text-muted',
                        )}
                      >
                        {MOVE_LABEL[m.tipo]}
                      </span>
                    </td>
                    <td className={cn('num whitespace-nowrap px-4 py-3 text-right font-semibold', sign < 0 && 'text-pink-deep')}>
                      {sign > 0 ? '+' : ''}
                      {m.cantidad} u.
                    </td>
                    <td className="num whitespace-nowrap px-4 py-3 text-right text-muted">
                      {m.stock_posterior} u.
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      {m.motivo ? (
                        <span
                          title={m.motivo}
                          className="block cursor-help truncate text-muted"
                        >
                          {m.motivo}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}

function StockBadge({ status }: { status: 'sin_stock' | 'bajo' | 'ok' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold',
        STOCK_STATUS_BG[status],
        STOCK_STATUS_TEXT[status],
      )}
    >
      <span className={cn('h-[7px] w-[7px] rounded-full', STOCK_STATUS_DOT[status])} />
      {STOCK_STATUS_LABEL[status]}
    </span>
  );
}

function EmptyStateBlock({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={<SearchIcon size={24} />}
      title="Sin resultados"
      description="No hay productos que coincidan con la búsqueda o el filtro."
      action={
        <Button variant="secondary" onClick={onClear}>
          Limpiar filtros
        </Button>
      }
      className="m-5"
    />
  );
}

function AdjustStockModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const register = useRegisterStockMovement();
  const [type, setType] = useState<'entrada' | 'salida'>('entrada');
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');

  const submit = () => {
    register
      .mutateAsync({
        inventory_item_id: item.id,
        tipo: type,
        cantidad,
        motivo: motivo.trim() || null,
      })
      .then(onClose);
  };

  const max = type === 'salida' ? item.stock_actual : Infinity;
  const motivoValid = motivo.trim().length > 0;

  return (
    <Modal open onClose={onClose} title="Ajustar stock" className="sm:max-w-xl">
      <div className="space-y-5">
        <div>
          <div className="text-sm font-semibold text-ink">{item.nombre}</div>
          <div className="num mt-0.5 text-xs text-muted">Stock actual: {item.stock_actual} u.</div>
        </div>

        <div role="group" aria-label="Tipo de movimiento" className="flex gap-2">
          <Chip active={type === 'entrada'} onClick={() => setType('entrada')}>
            Entrada
          </Chip>
          <Chip active={type === 'salida'} onClick={() => setType('salida')}>
            Salida
          </Chip>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Cantidad</span>
          <QtyStepper value={cantidad} onChange={setCantidad} min={1} max={max} label="unidades" />
        </div>
        {type === 'salida' && cantidad > item.stock_actual ? (
          <p className="text-xs text-pink-deep">No hay suficiente stock.</p>
        ) : null}

        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
            Motivo <span className="text-pink-deep">*</span>
          </label>
          <Input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej. Compra a proveedor"
            invalid={!motivoValid}
          />
          {!motivoValid ? (
            <p className="mt-1 text-xs text-pink-deep">El motivo es obligatorio.</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            loading={register.isPending}
            disabled={type === 'salida' && cantidad > item.stock_actual}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function NewItemModal({
  onClose,
  onSubmit,
  busy,
}: {
  onClose: () => void;
  onSubmit: (input: { nombre: string; descripcion: string; stock_actual: number; precio_unitario: number; imagen_url: string | null }) => void;
  busy: boolean;
}) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState(0);
  const [precio, setPrecio] = useState(0);
  const [imagen, setImagen] = useState<string | null>(null);

  const valid = nombre.trim().length > 0;

  return (
    <Modal open onClose={onClose} title="Nuevo producto" className="sm:max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
            Nombre <span className="text-pink-deep">*</span>
          </label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cámara 26×1.95" />
        </div>
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Descripción</label>
          <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <ImageUpload
          value={imagen}
          onChange={setImagen}
          onFile={(file) => uploadImage({ bucket: 'inventory-images', path: 'inventory', file })}
          label="Imagen del producto"
          hint="Se guarda en el bucket privado de inventario."
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Stock inicial</label>
            <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Precio unitario</label>
            <Input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() =>
              onSubmit({ nombre, descripcion, stock_actual: stock, precio_unitario: precio, imagen_url: imagen })
            }
            loading={busy}
            disabled={!valid}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditProductoModal({
  item,
  onClose,
  onSubmit,
  busy,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSubmit: (input: { nombre: string; descripcion: string; precio_unitario: number; imagen_url: string | null; activo: boolean }) => void;
  busy: boolean;
}) {
  const [nombre, setNombre] = useState(item.nombre);
  const [descripcion, setDescripcion] = useState(item.descripcion ?? '');
  const [precio, setPrecio] = useState(item.precio_unitario);
  const [imagen, setImagen] = useState<string | null>(item.imagen_url ?? null);
  const [activo, setActivo] = useState(item.activo);

  const valid = nombre.trim().length > 0;

  return (
    <Modal open onClose={onClose} title="Editar producto" className="sm:max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
            Nombre <span className="text-pink-deep">*</span>
          </label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Descripción</label>
          <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <ImageUpload
          value={imagen}
          onChange={setImagen}
          onFile={(file) => uploadImage({ bucket: 'inventory-images', path: 'inventory', file })}
          label="Imagen del producto"
          hint="Se guarda en el bucket privado de inventario."
        />
        <div>
          <label className="mb-1.5 block text-[13.5px] font-medium text-muted">Precio unitario</label>
          <Input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} />
        </div>
        <div className="rounded-card border-2 border-line bg-[var(--surface-2)] px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Stock actual</span>
            <span className="num">{item.stock_actual} u.</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            El stock se ajusta con el movimiento, no acá.
          </p>
        </div>
        <div className="flex items-center justify-between rounded-card border-2 border-line px-4 py-3">
          <div>
            <div className="text-sm font-medium text-ink">Producto activo</div>
            <div className="text-xs text-muted">
              {item.activo ? 'Visible en el listado del taller' : 'Deshabilitado, oculto del stock'}
            </div>
          </div>
          <Switch checked={activo} onChange={setActivo} label="Producto activo" />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit({ nombre, descripcion, precio_unitario: precio, imagen_url: imagen, activo })}
            loading={busy}
            disabled={!valid}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function HistoryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
