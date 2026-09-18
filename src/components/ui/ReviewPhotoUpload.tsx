import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { MAX_UPLOAD_BYTES } from '@/lib/supabase/storage';
import { ImageIcon, CloseIcon } from './icons';

interface ReviewPhotoUploadProps {
  photos: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  max?: number;
  /** Fotos ya guardadas (p. ej. de una orden existente). Cuentan para el límite. */
  existingCount?: number;
  className?: string;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';
export const MAX_REVIEW_PHOTOS = 4;
export const MAX_WORK_ORDER_PHOTOS = 6;

/**
 * Selector de fotos con preview en vivo y un botón para quitar cada una.
 * `max` limita el total (incluyendo `existingCount`); al llegar al límite se
 * deshabilita el selector. Para reseñas el máximo es 4, para órdenes 6.
 */
export function ReviewPhotoUpload({
  photos,
  onAdd,
  onRemove,
  max = MAX_REVIEW_PHOTOS,
  existingCount = 0,
  className,
}: ReviewPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const total = photos.length + existingCount;
  const remaining = Math.max(max - total, 0);
  const atLimit = total >= max;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const ok: File[] = [];
    const bad: string[] = [];
    for (const f of files) {
      if (f.size > MAX_UPLOAD_BYTES) bad.push(f.name);
      else ok.push(f);
    }
    setRejected(bad);
    if (ok.length) onAdd(ok.slice(0, remaining));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-3">
        {photos.map((file, i) => (
          <div
            key={`${file.name}-${i}`}
            className="relative h-20 w-20 overflow-hidden rounded-card border border-line"
          >
            <PreviewImg file={file} alt={`Foto ${i + 1}`} />
            <button
              type="button"
              aria-label={`Quitar foto ${i + 1}`}
              onClick={() => onRemove(i)}
              className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-paper transition-colors hover:bg-pink-deep"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}

        {!atLimit ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center rounded-card border-2 border-dashed border-line text-muted transition-colors hover:border-pink-deep hover:text-pink-deep"
            aria-label="Agregar foto"
          >
            <ImageIcon size={22} />
          </button>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        {total}/{max} fotos · se convierten a webp al subir
      </p>
      {rejected.length > 0 ? (
        <p className="text-xs text-pink-deep">
          Muy pesadas (+10 MB, no se agregaron): {rejected.join(', ')}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

/** Preview de un File con object URL revocada al desmontar/cambiar archivo. */
function PreviewImg({ file, alt }: { file: File; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  if (!url) return null;
  return <img src={url} alt={alt} className="h-full w-full object-cover" />;
}
