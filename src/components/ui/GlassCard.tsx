import { type ReactNode, type CSSProperties, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useLiquidPress } from '../../hooks/useLiquidPress';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'purple' | 'pink' | 'green' | 'blue';
  glow?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  interactive?: boolean;
  /** Liquid press intensity (0.5=subtle, 1=normal, 1.5=strong) */
  liquidIntensity?: number;
}

const variantClass: Record<string, string> = {
  default: '',
  strong: 'glass-strong',
  purple: 'glass-purple',
  pink: 'glass-pink',
  green: 'glass-green',
  blue: '',
};

/**
 * Liquid ripple that expands from touch point — soft luminous wave in glass.
 */
function LiquidRipple({
  active,
  x,
  y,
  color,
  maxDim,
}: {
  active: boolean;
  x: number;
  y: number;
  color: string;
  maxDim: number;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    if (active) {
      const id = ++counterRef.current;
      setRipples((prev) => [...prev.slice(-2), { id, x, y }]);
      const timer = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [active, x, y]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute"
            initial={{
              left: r.x, top: r.y,
              width: 0, height: 0,
              opacity: 0.5,
            }}
            animate={{
              width: maxDim, height: maxDim,
              opacity: 0,
              x: -maxDim / 2, y: -maxDim / 2,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderRadius: '50%',
              background: `radial-gradient(circle, ${color}, transparent 70%)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Liquid Glass Card — premium gelatinous physics on press.
 *
 * On touch:
 * - Container squash+stretch toward touch point
 * - Brightness pulse
 * - Luminous ripple from touch point
 * - Internal content shifts slightly toward press
 *
 * On release:
 * - Spring-animated recovery with overshoot
 *
 * Preserves all existing glass/liquid-glass styling.
 */
export function GlassCard({
  children,
  className,
  variant = 'default',
  glow = false,
  style,
  onClick,
  interactive = false,
  liquidIntensity = 1,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 200, h: 100 });

  // Measure card for ripple sizing
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isInteractive = interactive || !!onClick;

  const liquid = useLiquidPress({
    intensity: liquidIntensity,
    pressScaleX: 0.97,
    pressScaleY: 0.965,
    rotate: false,
  });

  // Determine ripple glow color based on variant
  const rippleColor =
    variant === 'purple' ? 'rgba(155, 92, 255, 0.3)' :
    variant === 'pink' ? 'rgba(255, 61, 141, 0.3)' :
    variant === 'green' ? 'rgba(0, 255, 133, 0.25)' :
    'rgba(180, 160, 255, 0.2)';

  const maxDim = Math.max(dims.w, dims.h) * 1.5;

  const vc = variantClass[variant] || '';

  // Non-interactive: plain glass card (no liquid physics)
  if (!isInteractive) {
    return (
      <div
        ref={cardRef}
        className={clsx(
          'glass',
          vc,
          glow && 'glass-glow',
          className,
        )}
        style={style}
      >
        {children}
      </div>
    );
  }

  // Interactive: full liquid physics
  return (
    <motion.div
      ref={cardRef}
      className={clsx(
        'glass',
        vc,
        glow && 'glass-glow',
        'glass-liquid',
        className,
      )}
      style={{
        ...style,
        transformOrigin: 'center center',
      }}
      onClick={onClick}
      {...liquid.handlers}
      animate={liquid.motionStyle}
      tabIndex={0}
      role={onClick ? 'button' : undefined}
    >
      <LiquidRipple
        active={liquid.state.isPressed}
        x={liquid.state.x}
        y={liquid.state.y}
        color={rippleColor}
        maxDim={maxDim}
      />
      <motion.div animate={liquid.contentShift} style={{ willChange: 'transform' }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
