import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface Props {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: 'purple' | 'pink' | 'blue' | 'green' | 'orange';
  className?: string;
}

const colorMap = {
  purple: { active: 'rgba(155,92,255,0.2)', text: '#9B5CFF', border: 'rgba(155,92,255,0.4)', glow: 'rgba(155,92,255,0.4)' },
  pink: { active: 'rgba(255,61,141,0.2)', text: '#FF3D8D', border: 'rgba(255,61,141,0.4)', glow: 'rgba(255,61,141,0.4)' },
  blue: { active: 'rgba(0,191,255,0.2)', text: '#00BFFF', border: 'rgba(0,191,255,0.4)', glow: 'rgba(0,191,255,0.4)' },
  green: { active: 'rgba(0,255,133,0.2)', text: '#00FF85', border: 'rgba(0,255,133,0.4)', glow: 'rgba(0,255,133,0.4)' },
  orange: { active: 'rgba(255,158,61,0.2)', text: '#FF9E3D', border: 'rgba(255,158,61,0.4)', glow: 'rgba(255,158,61,0.4)' },
};

const CHIP_SPRING = { stiffness: 450, damping: 20, mass: 0.6 };

/**
 * Liquid Chip with gelatinous press physics.
 * Squash on press, spring recovery with overshoot.
 */
export function Chip({ children, active = false, onClick, color = 'purple', className }: Props) {
  const c = colorMap[color];
  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold',
        className,
      )}
      style={{
        background: active ? c.active : 'rgba(255,255,255,0.05)',
        color: active ? c.text : 'rgba(255,255,255,0.6)',
        border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.1)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: active ? `0 0 16px ${c.glow}` : 'none',
      }}
      whileTap={{
        scale: 0.9,
        scaleX: 1.04,
        y: 1,
        filter: 'brightness(1.15)',
      }}
      transition={{
        type: 'spring',
        ...CHIP_SPRING,
      }}
    >
      <motion.span
        whileTap={{ x: 0, y: 0.5, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22, mass: 0.5 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'inherit' }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
