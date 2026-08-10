import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Dumbbell, LineChart, User } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/entrenar', label: 'Entrenar', icon: Dumbbell, end: false },
  { to: '/progreso', label: 'Progreso', icon: LineChart, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
];

/**
 * Bottom navigation with a physically sliding liquid-glass indicator.
 *
 * The active pill:
 * - Is the SAME DOM element that SLIDES between positions (never unmounts)
 * - Compacts slightly before moving (anticipation)
 * - Stretches horizontally during slide
 * - Compresses on arrival (settle)
 * - Bounces softly back to rest shape
 * - Maintains liquid glass appearance throughout
 * - Direction-aware: moves left or right physically
 */
export function BottomNav() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });

  // Phase: 'idle' | 'moving' | 'settling'
  const [phase, setPhase] = useState<'idle' | 'moving' | 'settling'>('idle');

  // Detect active index from current route
  useEffect(() => {
    const idx = items.findIndex(
      (it) =>
        (it.end && location.pathname === it.to) ||
        (!it.end && location.pathname.startsWith(it.to)),
    );
    if (idx !== -1 && idx !== activeIdx) {
      setPhase('moving');
      setActiveIdx(idx);
    }
  }, [location.pathname]);

  // Measure the active item and update indicator position
  const updateIndicator = useCallback(() => {
    const el = itemRefs.current[activeIdx];
    const container = containerRef.current;
    if (!el || !container) return;

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const pad = 6;

    setIndicator({
      x: elRect.left - containerRect.left + pad,
      width: elRect.width - pad * 2,
    });
  }, [activeIdx]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  // Phase transitions
  useEffect(() => {
    if (phase === 'moving') {
      // After the slide spring settles, switch to settling phase
      const timer = setTimeout(() => setPhase('settling'), 320);
      return () => clearTimeout(timer);
    }
    if (phase === 'settling') {
      // After the settle bounce, go back to idle
      const timer = setTimeout(() => setPhase('idle'), 280);
      return () => clearTimeout(timer);
    }
  }, [phase, activeIdx]);

  // Indicator animation values per phase
  const indicatorAnimate = {
    x: indicator.x,
    width:
      phase === 'moving'
        ? indicator.width * 1.1    // stretch horizontally during slide
        : phase === 'settling'
          ? indicator.width * 0.95  // compress on arrival
          : indicator.width,       // rest
    scaleY:
      phase === 'moving'
        ? 0.92                      // squash vertically during slide
        : phase === 'settling'
          ? 1.04                     // slight overshoot bounce
          : 1,                       // rest
  };

  const springMoving = { type: 'spring' as const, stiffness: 280, damping: 22, mass: 0.8 };
  const springSettling = { type: 'spring' as const, stiffness: 400, damping: 14, mass: 0.6 };
  const springIdle = { type: 'spring' as const, stiffness: 350, damping: 26, mass: 0.7 };

  const transition =
    phase === 'moving' ? springMoving :
    phase === 'settling' ? springSettling :
    springIdle;

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4 safe-bottom pointer-events-none">
      <div
        ref={containerRef}
        className="glass glass-glow pointer-events-auto relative flex items-center justify-around rounded-3xl px-2 py-2.5"
        style={{ borderRadius: 28 }}
      >
        {/* Sliding liquid-glass indicator pill — THE SAME element always */}
        <motion.div
          className="absolute top-1.5 left-0 h-[calc(100%-12px)] rounded-2xl pointer-events-none z-0"
          animate={indicatorAnimate}
          transition={transition}
          style={{
            background: 'rgba(155, 92, 255, 0.15)',
            boxShadow:
              '0 0 20px rgba(155, 92, 255, 0.45), inset 0 0 14px rgba(155, 92, 255, 0.15)',
            border: '1px solid rgba(155, 92, 255, 0.2)',
          }}
        >
          {/* Glass highlight on indicator */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
            }}
          />
          {/* Sheen that moves during slide */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            animate={{
              opacity: phase === 'moving' ? 0.8 : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />
        </motion.div>

        {/* Nav items */}
        {items.map((it, idx) => {
          const NavIcon = it.icon;
          const isActive = idx === activeIdx;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={() =>
                clsx(
                  'nav-item relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold',
                  'transition-colors duration-300',
                  isActive ? 'text-neon-purple' : 'text-white/40 hover:text-white/70',
                )
              }
              ref={(el: HTMLAnchorElement | null) => { itemRefs.current[idx] = el; }}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0,
                  filter: isActive
                    ? 'drop-shadow(0 0 6px rgba(155, 92, 255, 0.8))'
                    : 'drop-shadow(0 0 0px transparent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <NavIcon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <motion.span
                animate={{
                  scale: isActive ? [1, 1.03, 0.98, 1] : 1,
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 1,
                }}
              >
                {it.label}
              </motion.span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
