import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { CloseIcon } from '@/components/ui/icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  /** Si es true, el contenido se agrega al paisaje del root (para Motion). */
  forceRender?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal accesible: portal a <body>, backdrop animado (fade), panel con
 * entrada fade+scale, focus trap + restauracion, cierre con Escape /
 * overlay, scroll-lock del fondo. En movil se comporta como bottom-sheet;
 * en desktop se centra. Respeta prefers-reduced-motion.
 */
export function Modal({
  open,
  onClose,
  title,
  labelledBy,
  children,
  className,
  forceRender = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusables = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    (focusables[0] ?? panel)?.focus();

    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      previousFocus.current?.focus();
    };
  }, [open]);

  if (!open && !forceRender) return null;
  if (!open && forceRender) return <ModalStatic>{children}</ModalStatic>;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--scrim)] p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-label={title}
            initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: 'easeOut' }}
            className={cn(
              'relative max-h-[92dvh] w-full overflow-y-auto rounded-t-card bg-paper pt-16 p-7 shadow-soft sm:max-h-[90vh] sm:max-w-3xl sm:rounded-card sm:pt-16 sm:px-8 sm:pb-8',
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-7 top-7 inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink text-white transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_18px_rgba(238,125,151,0.6)] active:scale-95"
            >
              <CloseIcon size={20} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** Contenido estatico (sin overlay) cuando forceRender y cerrado (para Motion). */
function ModalStatic({ children }: { children: ReactNode }) {
  return <div style={{ display: 'none' }} aria-hidden="true">{children}</div>;
}
