import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

// Modal/BottomSheet glass con animación slide-up.
export function Modal({ open, onClose, title, children, className }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in sm:items-center sm:p-4"
      style={{ backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className={clsx(
          'glass glass-glow w-full max-w-md rounded-t-4xl p-5 animate-slide-up sm:rounded-4xl',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60 transition hover:bg-white/15 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
