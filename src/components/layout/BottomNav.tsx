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

const NAV_SPRING = { stiffness: 350, damping: 28, mass: 0.9 };
const INDICATOR_SPRING = { stiffness: 300, damping: 24, mass: 0.7 };

/**
 * Bottom navigation with a physically sliding liquid-glass indicator.
 *
 * The active pill:
 * - SLIDES from old position to new (never disappears/reappears)
 * - Stretches horizontally during movement
 * - Squashes on arrival
 * - Bounces softly on settle
 * - Generates a subtle glow wave in the bar on arrival
 */
export function BottomNav() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [barGlow, setBarGlow] = useState<{ x: number; opacity: number }>({ x: 0, opacity: 0 });

  // Detect active index from current route
  useEffect(() => {
    const idx = items.findIndex(
      (it) =>
        (it.end && location.pathname === it.to) ||
        (!it.end && location.pathname.startsWith(it.to)),
    );
    if (idx !== -1 && idx !== activeIdx) {
      setIsMoving(true);
      setActiveIdx(idx);
      // Glow wave at new position
      setBarGlow({ x: indicator.x + indicator.width / 2, opacity: 0.6 });
      setTimeout(() => setBarGlow((g) => ({ ...g, opacity: 0 })), 500);
    }
  }, [location.pathname]);

  // Measure the active item and move indicator there
  const updateIndicator = useCallback(() => {
    const el = itemRefs.current[activeIdx];
    const container = containerRef.current;
    if (!el || !container) return;

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const pad = 6; // visual padding inside pill

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

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4 safe-bottom pointer-events-none">
      <div
        ref={containerRef}
        className="glass glass-glow pointer-events-auto relative flex items-center justify-around rounded-3xl px-2 py-2.5"
        style={{ borderRadius: 28 }}
      >
        {/* Ambient glow wave */}
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        >
          <motion.div
            className="absolute top-0 h-full w-24"
            animate={{ x: barGlow.x - 48, opacity: barGlow.opacity }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'radial-gradient(ellipse, rgba(155,92,255,0.2), transparent 80%)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>

        {/* Sliding glass indicator pill */}
        <motion.div
          className="absolute top-1.5 left-0 h-[calc(100%-12px)] rounded-2xl pointer-events-none z-0"
          animate={{
            x: indicator.x,
            width: isMoving
              ? indicator.width * 1.08 // stretch during movement
              : indicator.width,
            scaleY: isMoving ? 0.94 : 1, // squash on arrival
          }}
          transition={isMoving ? { type: 'spring', ...NAV_SPRING } : { type: 'spring', ...INDICATOR_SPRING }}
          onAnimationComplete={() => {
            if (isMoving) setIsMoving(false);
          }}
          style={{
            background: 'rgba(155, 92, 255, 0.15)',
            boxShadow:
              '0 0 18px rgba(155, 92, 255, 0.45), inset 0 0 12px rgba(155, 92, 255, 0.15)',
            border: '1px solid rgba(155, 92, 255, 0.2)',
          }}
        />

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
              {it.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
