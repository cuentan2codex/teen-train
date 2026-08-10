import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  value: number;
  max: number;
  label?: string;
  color?: string; // gradient CSS string
  className?: string;
  children?: ReactNode;
  height?: number;
}

// Barra de progreso glass con relleno gradiente y glow + jelly idle.
export function Progress({ value, max, label, color, className, children, height = 10 }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const gradient = color || 'linear-gradient(90deg, #9B5CFF, #FF3D8D)';

  return (
    <div className={className}>
      {(label || children) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-white/70">{label}</span>
          {children ?? <span className="text-white/50">{pct}%</span>}
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          height,
          backdropFilter: 'blur(8px)',
        }}
      >
        <motion.div
          className="h-full rounded-full"
          animate={{
            scaleX: [1, 1.003, 0.997, 1.001, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: `${pct}%`,
            background: gradient,
            boxShadow: `0 0 12px ${color ? 'rgba(155,92,255,0.5)' : 'rgba(155,92,255,0.5)'}`,
            transformOrigin: 'left center',
          }}
        />
      </div>
    </div>
  );
}
