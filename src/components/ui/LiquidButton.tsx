import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface LiquidButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-3 text-sm rounded-2xl',
  lg: 'px-5 py-3.5 text-base rounded-2xl',
};

/**
 * Premium liquid button with multi-axis gelatinous press.
 *
 * Press: squash (scaleY 0.92, scaleX 1.03), slight translate down,
 * brightness increase, internal content shift.
 * Release: spring recovery with overshoot.
 */
export function LiquidButton({
  children,
  variant = 'glass',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled,
  className,
  type = 'button',
}: LiquidButtonProps) {
  const baseClass = clsx(
    'inline-flex items-center justify-center gap-2 font-semibold relative overflow-hidden',
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #9B5CFF, #FF3D8D)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 4px 20px rgba(155, 92, 255, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
    },
    success: {
      background: 'linear-gradient(135deg, #00FF85, #00BFFF)',
      color: '#050507',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 20px rgba(0, 255, 133, 0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
    },
    danger: {
      background: 'linear-gradient(135deg, #FF3D8D, #FF9E3D)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 4px 20px rgba(255, 61, 141, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.22)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
    },
  };

  const spring = { stiffness: 420, damping: 18, mass: 0.7 };
  const springLight = { stiffness: 500, damping: 22, mass: 0.5 };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClass}
      style={variantStyle[variant]}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 1,
              scaleX: 1.04,
              scaleY: 0.92,
              y: 2,
              filter: 'brightness(1.12)',
            }
      }
      transition={{
        type: 'spring',
        ...spring,
      }}
    >
      {/* Sheen highlight */}
      {variant === 'primary' && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
        />
      )}
      <motion.span
        className="relative z-10 inline-flex items-center gap-2"
        whileTap={
          disabled
            ? undefined
            : { y: 0.5, scale: 0.97 }
        }
        transition={{ type: 'spring', ...springLight }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
