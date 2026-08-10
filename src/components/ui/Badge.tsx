import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink';
  className?: string;
  glow?: boolean;
}

const styles: Record<NonNullable<Props['variant']>, { bg: string; text: string; border: string }> = {
  default: { bg: 'rgba(255,255,255,0.06)', text: '#E0E0E0', border: 'rgba(255,255,255,0.12)' },
  success: { bg: 'rgba(0,255,133,0.12)', text: '#00FF85', border: 'rgba(0,255,133,0.3)' },
  warning: { bg: 'rgba(255,158,61,0.12)', text: '#FF9E3D', border: 'rgba(255,158,61,0.3)' },
  danger: { bg: 'rgba(255,61,141,0.12)', text: '#FF3D8D', border: 'rgba(255,61,141,0.3)' },
  info: { bg: 'rgba(0,191,255,0.12)', text: '#00BFFF', border: 'rgba(0,191,255,0.3)' },
  purple: { bg: 'rgba(155,92,255,0.12)', text: '#9B5CFF', border: 'rgba(155,92,255,0.3)' },
  pink: { bg: 'rgba(255,61,141,0.12)', text: '#FF3D8D', border: 'rgba(255,61,141,0.3)' },
};

export function Badge({ children, variant = 'default', className, glow = false }: Props) {
  const s = styles[variant];
  return (
    <span
      className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        boxShadow: glow ? `0 0 12px ${s.border}` : undefined,
        backdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </span>
  );
}
