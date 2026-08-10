import { type ReactNode, type CSSProperties } from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'purple' | 'pink' | 'green' | 'blue';
  glow?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
}

// Tarjeta de vidrio líquido reutilizable.
// variant: controla intensidad y color del glow.
// glow: borde luminoso gradiente.
// interactive: añade animación gelatinosa al tocar (compresión + leve elevación).
export function GlassCard({
  children,
  className,
  variant = 'default',
  glow = false,
  style,
  onClick,
  interactive = false,
}: GlassCardProps) {
  const variantClass = {
    default: '',
    strong: 'glass-strong',
    purple: 'glass-purple',
    pink: 'glass-pink',
    green: 'glass-green',
    blue: '',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass',
        variantClass,
        glow && 'glass-glow',
        interactive && 'glass-interactive',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
