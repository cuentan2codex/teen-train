import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, LineChart, User } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/entrenar', label: 'Entrenar', icon: Dumbbell, end: false },
  { to: '/progreso', label: 'Progreso', icon: LineChart, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
];

// Navegación inferior flotante de vidrio líquido.
// No toca los bordes — flota como pieza independiente con sombra y glow.
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4 safe-bottom pointer-events-none">
      <div
        className="glass glass-glow pointer-events-auto flex items-center justify-around rounded-3xl px-2 py-2.5"
        style={{ borderRadius: 28 }}
      >
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                clsx(
                  'relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold transition-all duration-300',
                  isActive
                    ? 'text-neon-purple'
                    : 'text-white/40 hover:text-white/70',
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
                      }}
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(155, 92, 255, 0.8))' } : undefined}
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
