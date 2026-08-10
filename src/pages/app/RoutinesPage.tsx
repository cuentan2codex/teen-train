import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ListOrdered, ChevronRight, Dumbbell } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Chip } from '../../components/ui/Chip';
import { SEED_ROUTINES } from '../../data/seed';
import type { Goal, Level, Routine } from '../../types';

const OBJETIVOS: { value: Goal | 'todos'; label: string; color: 'purple' | 'pink' | 'blue' | 'green' | 'orange' }[] = [
  { value: 'todos', label: 'Todos', color: 'purple' },
  { value: 'casa', label: 'En casa', color: 'green' },
  { value: 'fuerza', label: 'Fuerza', color: 'pink' },
  { value: 'resistencia', label: 'Resistencia', color: 'blue' },
  { value: 'acondicionamiento', label: 'Acondic.', color: 'orange' },
  { value: 'salud_general', label: 'Salud', color: 'purple' },
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
      <PageHeader title="Entrenar" subtitle="Elegí tu rutina de hoy" icon={<Dumbbell size={20} />} />

      {/* Filtros objetivo */}
      <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {OBJETIVOS.map((o) => (
          <Chip
            key={o.value}
            active={objetivo === o.value}
            onClick={() => setObjetivo(o.value)}
            color={o.color}
          >
            {o.label}
          </Chip>
        ))}
      </div>

      {/* Filtros nivel */}
      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {NIVELES.map((n) => (
          <Chip
            key={n.value}
            active={nivel === n.value}
            onClick={() => setNivel(n.value)}
            color="blue"
          >
            {n.label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-6 text-center text-sm text-white/50">
          No hay rutinas con esos filtros.
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, idx) => (
            <RoutineCard
              key={r.id}
              routine={r}
              onClick={() => nav(`/rutina/${r.id}`)}
              delay={Math.min(idx + 1, 6)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function RoutineCard({ routine, onClick, delay }: { routine: Routine; onClick: () => void; delay: number }) {
  const levelColor =
    routine.nivel === 'principiante' ? '#00FF85' :
    routine.nivel === 'intermedio' ? '#FF9E3D' : '#FF3D8D';

  return (
    <GlassCard
      interactive
      onClick={onClick}
      className={`flex items-center justify-between p-4 stagger-${delay}`}
    >
      <div className="flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-white">{routine.nombre}</h3>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{
              background: `${levelColor}1f`,
              color: levelColor,
              border: `1px solid ${levelColor}40`,
            }}
          >
            {routine.nivel}
          </span>
        </div>
        <p className="mb-2 text-xs text-white/50">{routine.descripcion}</p>
        <div className="flex gap-3 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {routine.duracion_estimada_min} min
          </span>
          <span className="flex items-center gap-1">
            <ListOrdered size={12} /> {routine.ejercicios.length} ejercicios
          </span>
        </div>
      </div>
      <ChevronRight size={20} className="text-white/30" />
    </GlassCard>
  );
}
