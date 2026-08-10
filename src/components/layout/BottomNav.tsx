import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, LineChart, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useRef } from 'react';

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/entrenar', label: 'Entrenar', icon: Dumbbell, end: false },
  { to: '/progreso', label: 'Progreso', icon: LineChart, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
];

// Navegación inferior flotante de vidrio líquido.
// El indicador activo (pill con glow) se desplaza fluidamente entre tabs.
export function BottomNav() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4 safe-bottom pointer-events-none">
      <div
        ref={containerRef}
        className="glass glass-glow pointer-events-auto relative flex items-center justify-around rounded-3xl px-2 py-2.5"
        style={{ borderRadius: 28 }}
      >
        {items.map((it, idx) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              style={{ ['--nav-idx' as string]: idx }}
              className={({ isActive }) =>
                clsx(
                  'nav-item relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold transition-colors duration-300',
                  isActive ? 'text-neon-purple' : 'text-white/40 hover:text-white/70',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute inset-0 -z-10 rounded-2xl"
                      style={{
                        background: 'rgba(155, 92, 255, 0.18)',
                        boxShadow: '0 0 18px rgba(155, 92, 255, 0.5), inset 0 0 12px rgba(155, 92, 255, 0.2)',
                        animation: 'nav-pill-in 0.4s var(--ease-jelly, cubic-bezier(0.34, 1.56, 0.64, 1))',
                      }}
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(155, 92, 255, 0.8))' : undefined,
                      transition: 'transform 0.3s var(--ease-jelly, cubic-bezier(0.34, 1.56, 0.64, 1))',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }}
                  />
                  {it.label}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
