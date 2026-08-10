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
// glow: añade borde luminoso gradiente que recorre el perímetro.
// interactive: añade animación de hundido al tocar.
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
        interactive && 'transition-all duration-200 active:scale-[0.98]',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
