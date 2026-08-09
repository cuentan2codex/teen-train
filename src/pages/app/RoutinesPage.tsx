import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ListOrdered, ChevronRight, Filter } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { SEED_ROUTINES } from '../../data/seed';
import type { Goal, Level, Routine } from '../../types';

const OBJETIVOS: { value: Goal | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'casa', label: 'En casa' },
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'resistencia', label: 'Resistencia' },
  { value: 'acondicionamiento', label: 'Acondicionamiento' },
  { value: 'salud_general', label: 'Salud' },
];

const NIVELES: { value: Level | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

export function RoutinesPage() {
  const nav = useNavigate();
  const [objetivo, setObjetivo] = useState<Goal | 'todos'>('todos');
  const [nivel, setNivel] = useState<Level | 'todos'>('todos');

  const filtered = SEED_ROUTINES.filter(
    (r) =>
      (objetivo === 'todos' || r.objetivo === objetivo) &&
      (nivel === 'todos' || r.nivel === nivel),
  );

  return (
    <AppShell>
      <PageHeader title="Entrenar" subtitle="Elegí tu rutina de hoy" icon={<ListOrdered size={20} />} />

      {/* Filtros objetivo */}
      <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {OBJETIVOS.map((o) => (
          <button
            key={o.value}
            onClick={() => setObjetivo(o.value)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              objetivo === o.value
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Filtros nivel */}
      <div className="mb-4 flex items-center gap-2">
        <Filter size={14} className="text-slate-400" />
        {NIVELES.map((n) => (
          <button
            key={n.value}
            onClick={() => setNivel(n.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              nivel === n.value
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          No hay rutinas con esos filtros.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RoutineCard key={r.id} routine={r} onClick={() => nav(`/rutina/${r.id}`)} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function RoutineCard({ routine, onClick }: { routine: Routine; onClick: () => void }) {
  const levelColor =
    routine.nivel === 'principiante'
      ? 'success'
      : routine.nivel === 'intermedio'
      ? 'warning'
      : 'danger';
  return (
    <button onClick={onClick} className="card flex w-full items-center justify-between text-left active:scale-[0.99]">
      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="font-bold">{routine.nombre}</h3>
          <Badge variant={levelColor as any}>{capitalize(routine.nivel)}</Badge>
        </div>
        <p className="mb-2 text-xs text-slate-500">{routine.descripcion}</p>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={13} /> {routine.duracion_estimada_min} min
          </span>
          <span className="flex items-center gap-1">
            <ListOrdered size={13} /> {routine.ejercicios.length} ejercicios
          </span>
        </div>
      </div>
      <ChevronRight size={20} className="text-slate-400" />
    </button>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
