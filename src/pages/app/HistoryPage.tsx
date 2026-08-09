import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../store/auth';
import { workoutsRepo } from '../../services/database';
import type { Workout } from '../../types';
import { formatLongDuration } from '../../utils/format';

export function HistoryPage() {
  const nav = useNavigate();
  const { profile } = useAuth();
  if (!profile) return null;

  const [filter, setFilter] = useState<'todos' | '7d' | '30d'>('todos');

  const workouts = useMemo(() => {
    const all = workoutsRepo.list(profile.id)
      .filter((w) => w.estado === 'completado')
      .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());
    if (filter === '7d') {
      const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
      return all.filter((w) => new Date(w.fecha_inicio).getTime() >= cutoff);
    }
    if (filter === '30d') {
      const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
      return all.filter((w) => new Date(w.fecha_inicio).getTime() >= cutoff);
    }
    return all;
  }, [profile.id, filter]);

  // Agrupar por día
  const grouped = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of workouts) {
      const key = new Date(w.fecha_inicio).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries());
  }, [workouts]);

  return (
    <AppShell>
      <PageHeader title="Historial" subtitle="Tus entrenamientos completados" icon={<Calendar size={20} />} />

      <div className="mb-4 flex gap-2">
        {([
          { v: 'todos', l: 'Todos' },
          { v: '7d', l: '7 días' },
          { v: '30d', l: '30 días' },
        ] as const).map((opt) => (
          <button
            key={opt.v}
            onClick={() => setFilter(opt.v)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === opt.v
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {opt.l}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          <div className="mb-2 text-4xl">📭</div>
          Aún no tienes entrenamientos completados.
          <br />
          ¡Comienza el primero!
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, ws]) => (
            <div key={day}>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                {formatDayLabel(day)}
              </h2>
              <div className="space-y-2">
                {ws.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => nav(`/historial/${w.id}`)}
                    className="card flex w-full items-center justify-between text-left active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-900/30">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-semibold">{w.routine_name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={11} /> {formatLongDuration(w.duracion_seg)}
                          <span className="mx-1">·</span>
                          {w.ejercicios.length} ejercicios
                          <span className="mx-1">·</span>
                          +{w.xp_ganado} XP
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function formatDayLabel(day: string): string {
  const d = new Date(day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}
