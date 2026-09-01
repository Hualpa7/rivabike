import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full resize-y rounded-card border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted transition-colors focus:border-pink-deep focus:outline-none',
        invalid && 'border-pink-deep',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
