import { useState } from 'react';
import { toast } from 'sonner';
import type { PdfCondicionesTipo } from '@/types';
import { usePdfCondiciones, useUpdatePdfCondiciones } from '@/features/settings/api';
import { resolvePdfCondiciones } from '@/features/settings/pdf-condiciones';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { CloseIcon, PlusIcon } from '@/components/ui/icons';

const MAX_ITEMS = 5;
const MAX_LENGTH = 700;

/**
 * Editor de las condiciones que se imprimen en los PDFs (orden de trabajo o
 * presupuesto). Hasta 5 viñetas, cada una de maximo 700 caracteres — mismos
 * limites que valida el backend (upsert_pdf_condiciones).
 */
export function PdfCondicionesEditor({
  tipo,
  title,
  sub,
}: {
  tipo: PdfCondicionesTipo;
  title: string;
  sub?: string;
}) {
  const { data: list = [], isLoading } = usePdfCondiciones();
  const update = useUpdatePdfCondiciones();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);

  const items = resolvePdfCondiciones(tipo, list);

  const startEditing = () => {
    setDraft([...items]);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft([]);
    setEditing(false);
  };

  const patchDraft = (index: number, value: string) =>
    setDraft((d) => d.map((item, i) => (i === index ? value : item)));

  const removeItem = (index: number) =>
    setDraft((d) => d.filter((_, i) => i !== index));

  const addItem = () =>
    setDraft((d) => (d.length >= MAX_ITEMS ? d : [...d, '']));

  const handleSave = async () => {
    const cleaned = draft.map((i) => i.trim()).filter((i) => i.length > 0);
    if (cleaned.length === 0) {
      toast.error('Escribí al menos una condición.');
      return;
    }
    if (cleaned.some((i) => i.length > MAX_LENGTH)) {
      toast.error(`Cada condición admite hasta ${MAX_LENGTH} caracteres.`);
      return;
    }
    try {
      await update.mutateAsync({ tipo, items: cleaned });
      toast.success('Condiciones actualizadas.');
      setEditing(false);
    } catch {
      toast.error('No se pudieron guardar las condiciones. Intentalo de nuevo.');
    }
  };

  return (
    <section className="rounded-card border-2 border-line bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
        </div>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEditing} disabled={isLoading}>
            Editar
          </Button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          {draft.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <Textarea
                value={item}
                onChange={(e) => patchDraft(index, e.target.value)}
                placeholder={`Condición ${index + 1}…`}
                maxLength={MAX_LENGTH}
                rows={2}
              />
              <button
                type="button"
                aria-label="Quitar condición"
                onClick={() => removeItem(index)}
                className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-line hover:text-pink-deep"
              >
                <CloseIcon size={14} />
              </button>
            </div>
          ))}

          {draft.length < MAX_ITEMS ? (
            <Button variant="secondary" size="sm" onClick={addItem}>
              <PlusIcon size={16} />
              Añadir condición
            </Button>
          ) : (
            <p className="text-xs text-muted">Máximo {MAX_ITEMS} condiciones.</p>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              disabled={update.isPending}
            >
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={update.isPending}>
              Guardar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-1.5">
          {items.map((item, index) => (
            <p key={index} className="flex gap-2 text-sm leading-relaxed text-muted">
              <span className="text-pink-deep">• </span>
              <span>{item}</span>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}