import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';
import { ImageIcon } from './icons';

export interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onFile: (file: File) => Promise<string>;
  label?: string;
  hint?: string;
  className?: string;
}

/**
 * Selector + preview de imagen para el dashboard. Muestra la imagen actual
 * (o un placeholder) y permite reemplazarla/quitarla. El upload real queda a
 * cargo del caller vía `onFile`, que decide bucket y política de acceso.
 */
export function ImageUpload({
  value,
  onChange,
  onFile,
  label = 'Imagen',
  hint,
  className,
}: ImageUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await onFile(file);
      onChange(url);
    } catch (e) {
      console.error('ImageUpload error', e);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <span className="block text-[13.5px] font-medium text-muted">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-card border border-line bg-[var(--surface-2)]">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={22} className="text-muted" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={busy}
            onClick={() => inputRef.current?.click()}
          >
            {value ? 'Cambiar imagen' : 'Subir imagen'}
          </Button>
          {value ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => onChange(null)}>
              Quitar
            </Button>
          ) : null}
        </div>
      </div>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
