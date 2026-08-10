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
 * Uses framer-motion's `layoutId` to share a SINGLE indicator element
 * across all nav items. When the active item changes, framer-motion
 * automatically animates the indicator from the old position to the new one.
 *
 * This avoids the getBoundingClientRect() + useCallback/useEffect timing issues.
 */
export function BottomNav() {
  const location = useLocation();

  const activeIdx = items.findIndex(
    (it) =>
      (it.end && location.pathname === it.to) ||
      (!it.end && location.pathname.startsWith(it.to)),
  );

  const idx = activeIdx !== -1 ? activeIdx : 0;

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4 safe-bottom pointer-events-none">
      <div
        className="glass glass-glow pointer-events-auto relative flex items-center justify-around rounded-3xl px-2 py-2.5"
        style={{ borderRadius: 28 }}
      >
        {/* Nav items */}
        {items.map((it, i) => {
          const NavIcon = it.icon;
          const isActive = i === idx;
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
            >
              {/* Shared indicator — only rendered by the active item */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 -z-10 rounded-2xl pointer-events-none"
                  style={{
                    background: 'rgba(155, 92, 255, 0.15)',
                    boxShadow:
                      '0 0 20px rgba(155, 92, 255, 0.45), inset 0 0 14px rgba(155, 92, 255, 0.15)',
                    border: '1px solid rgba(155, 92, 255, 0.2)',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                    mass: 0.8,
                  }}
                >
                  {/* Glass highlight */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                    }}
                  />
                </motion.div>
              )}

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
