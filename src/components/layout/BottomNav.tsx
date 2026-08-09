import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, LineChart, User } from 'lucide-react';
import { clsx } from 'clsx';

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/entrenar', label: 'Entrenar', icon: Dumbbell, end: false },
  { to: '/progreso', label: 'Progreso', icon: LineChart, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur safe-bottom dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition',
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
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
