import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const SHEET_SPRING = { stiffness: 280, damping: 26, mass: 0.8 };

/**
 * Modal/BottomSheet with liquid glass spring animation.
 * Sheet slides up with spring overshoot and settles softly.
 */
export function Modal({ open, onClose, title, children, className }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            className={clsx(
              'glass glass-glow w-full max-w-md rounded-t-4xl p-5 sm:rounded-4xl',
              className,
            )}
            initial={{ y: 80, scale: 0.95, opacity: 0, scaleY: 0.9 }}
            animate={{ y: 0, scale: 1, opacity: 1, scaleY: 1 }}
            exit={{ y: 60, scale: 0.97, opacity: 0, scaleY: 0.92 }}
            transition={{ type: 'spring', ...SHEET_SPRING }}
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: 'bottom center' }}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <motion.button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60"
                  style={{ border: 'none' }}
                  whileTap={{ scale: 0.85, rotate: -15, filter: 'brightness(1.2)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  whileHover={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
