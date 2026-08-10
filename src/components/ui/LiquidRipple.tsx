import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  /** Show the ripple at all (controlled by parent press state) */
  active: boolean;
  /** X position of touch within element */
  x?: number;
  /** Y position of touch within element */
  y?: number;
  /** Ripple color — should match the glass glow color */
  color?: string;
  /** Element width (if known, for sizing) */
  width?: number;
  /** Element height */
  height?: number;
  /** Intensity 0-1 */
  intensity?: number;
}

/**
 * Liquid ripple that expands from touch point.
 * NOT a Material Design ripple — this is a soft luminous wave
 * integrated into the glass surface.
 */
export function LiquidRipple({
  active,
  x = 0,
  y = 0,
  color = 'rgba(155, 92, 255, 0.35)',
  width = 200,
  height = 100,
  intensity = 1,
}: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const counterRef = useRef(0);

  const addRipple = useCallback(
    (px: number, py: number) => {
      const id = ++counterRef.current;
      setRipples((prev) => [...prev.slice(-2), { id, x: px, y: py }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    },
    [],
  );

  // When parent press activates, add a ripple at the touch point
  useEffect(() => {
    if (active) {
      addRipple(x, y);
    }
  }, [active, x, y, addRipple]);

  const maxDim = Math.max(width, height) * 1.4;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute"
            initial={{
              left: r.x,
              top: r.y,
              width: 0,
              height: 0,
              opacity: 0.7 * intensity,
              scale: 0,
            }}
            animate={{
              width: maxDim,
              height: maxDim,
              opacity: 0,
              scale: 1,
              x: -maxDim / 2,
              y: -maxDim / 2,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
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
