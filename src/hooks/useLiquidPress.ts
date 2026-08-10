import { useRef, useCallback, useState } from 'react';
import type { Transition } from 'framer-motion';

export interface LiquidPressConfig {
  /** Intensity multiplier: 0.5 = subtle, 1 = normal, 1.5 = strong */
  intensity?: number;
  /** Spring config for recovery bounce */
  spring?: Transition;
  /** Enable internal content shift */
  shiftContent?: boolean;
  /** Enable slight rotation */
  rotate?: boolean;
  /** Scale on press (before intensity) */
  pressScaleX?: number;
  pressScaleY?: number;
}

const DEFAULT_SPRING: Transition = {
  stiffness: 400,
  damping: 15,
  mass: 0.8,
};

const DEFAULT_CONFIG: Required<LiquidPressConfig> = {
  intensity: 1,
  spring: DEFAULT_SPRING,
  shiftContent: true,
  rotate: false,
  pressScaleX: 0.96,
  pressScaleY: 0.96,
};

export interface LiquidPressState {
  isPressed: boolean;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  translateX: number;
  translateY: number;
  brightness: number;
}

const IDLE: LiquidPressState = {
  isPressed: false,
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  brightness: 1,
};

/**
 * Hook that tracks pointer position and computes gelatinous deformation.
 * Returns handlers to attach to a motion.div and the current press state.
 *
 * Physics:
 * - Touch: squash (scaleY < 1, scaleX > 1), translate toward touch,
 *   slight brightness increase, optional rotation based on touch offset.
 * - Release: spring-animated recovery with overshoot (handled by framer-motion).
 */
export function useLiquidPress(cfg: LiquidPressConfig = {}) {
  const config = { ...DEFAULT_CONFIG, ...cfg };
  const [state, setState] = useState<LiquidPressState>(IDLE);
  const elRef = useRef<HTMLElement | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      elRef.current = el;
      const rect = el.getBoundingClientRect();

      // Touch position relative to center (normalized -1 to 1)
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2); // -1..1
      const ny = (e.clientY - cy) / (rect.height / 2);

      const i = config.intensity;

      // Squash & stretch based on touch offset from center
      const squashY = config.pressScaleY - Math.abs(ny) * 0.01 * i;
      const stretchX = config.pressScaleX - Math.abs(ny) * 0.01 * i;

      // Translate toward touch point (very subtle, 2-4px)
      const tx = nx * 2 * i;
      const ty = ny * 1.5 * i;

      // Slight rotation based on horizontal offset
      const rot = config.rotate ? nx * 1.2 * i : 0;

      // Brightness pulse
      const bright = 1 + 0.06 * i;

      setState({
        isPressed: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        scaleX: stretchX,
        scaleY: squashY,
        rotate: rot,
        translateX: tx,
        translateY: ty,
        brightness: bright,
      });
    },
    [config.intensity, config.pressScaleX, config.pressScaleY, config.rotate],
  );

  const handlePointerUp = useCallback(() => {
    setState(IDLE);
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (state.isPressed) setState(IDLE);
  }, [state.isPressed]);

  /** Motion values style to spread on a framer-motion `motion.div` */
  const motionStyle = {
    scaleX: state.scaleX,
    scaleY: state.scaleY,
    x: state.translateX,
    y: state.translateY,
    rotate: state.rotate,
    filter: state.isPressed ? `brightness(${state.brightness})` : 'brightness(1)',
    transition: state.isPressed
      ? { type: 'tween', duration: 0.1, ease: 'easeOut' }
      : { type: 'spring', ...config.spring },
  };

  /** Style for inner content that shifts slightly toward touch */
  const contentShift = config.shiftContent && state.isPressed
    ? {
        x: state.translateX * 0.6,
        y: state.translateY * 0.4,
        scale: 0.985,
        transition: state.isPressed
          ? { type: 'tween' as const, duration: 0.08 }
          : { type: 'spring' as const, stiffness: 500, damping: 20, mass: 0.6 },
      }
    : {
        x: 0,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 500, damping: 20, mass: 0.6 },
      };

  return {
    state,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onPointerCancel: handlePointerUp,
    },
    motionStyle,
    contentShift,
    spring: config.spring,
  };
}
