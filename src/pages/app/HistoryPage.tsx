import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Chip } from '../../components/ui/Chip';
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
        <Chip active={filter === 'todos'} onClick={() => setFilter('todos')} color="purple">Todos</Chip>
        <Chip active={filter === '7d'} onClick={() => setFilter('7d')} color="blue">7 días</Chip>
        <Chip active={filter === '30d'} onClick={() => setFilter('30d')} color="green">30 días</Chip>
      </div>

      {grouped.length === 0 ? (
        <GlassCard className="p-8 text-center text-sm text-white/50">
          <div className="mb-3 text-5xl">📭</div>
          Aún no tienes entrenamientos completados.
          <br />
          ¡Comienza el primero!
        </GlassCard>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, ws], gidx) => (
            <div key={day} className={`stagger-${Math.min(gidx + 1, 6)}`}>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">
                {formatDayLabel(day)}
              </h2>
              <div className="space-y-2">
                {ws.map((w) => (
                  <GlassCard
                    key={w.id}
                    interactive
                    onClick={() => nav(`/historial/${w.id}`)}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-neon-green"
                        style={{
                          background: 'rgba(0,255,133,0.12)',
                          border: '1px solid rgba(0,255,133,0.3)',
                        }}
                      >
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{w.routine_name}</p>
                        <p className="flex items-center gap-1 text-xs text-white/50">
                          <Clock size={11} /> {formatLongDuration(w.duracion_seg)}
                          <span className="mx-1">·</span>
                          {w.ejercicios.length} ej.
                          <span className="mx-1">·</span>
                          <span className="text-neon-purple">+{w.xp_ganado} XP</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/30" />
                  </GlassCard>
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
