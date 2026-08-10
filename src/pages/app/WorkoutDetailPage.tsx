import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Dumbbell, Check, Award } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../store/auth';
import { workoutsRepo } from '../../services/database';
import { findExercise } from '../../data/seed';
import { formatDate, formatLongDuration } from '../../utils/format';

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { profile } = useAuth();
  if (!profile) return null;

  const workout = useMemo(
    () => (id ? workoutsRepo.get(profile.id, id) : undefined),
    [id, profile.id],
  );

  if (!workout) {
    return (
      <AppShell showNav={false}>
        <div className="text-center text-white/50">Entrenamiento no encontrado.</div>
      </AppShell>
    );
  }

  const totalSets = workout.ejercicios.reduce((a, e) => a + e.sets.filter((s) => s.completado).length, 0);
  const totalVolume = workout.ejercicios.reduce(
    (a, e) => a + e.sets.filter((s) => s.completado).reduce((b, s) => b + s.repeticiones * s.peso_kg, 0),
    0,
  );

  return (
    <AppShell showNav={false}>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="text-2xl font-extrabold text-white">{workout.routine_name}</h1>
      <p className="text-sm text-white/50">{formatDate(workout.fecha_inicio)}</p>

      <div className="my-4 grid grid-cols-2 gap-3">
        <Stat icon={<Clock size={18} />} value={formatLongDuration(workout.duracion_seg)} label="Duración" color="#00BFFF" />
        <Stat icon={<Dumbbell size={18} />} value={`${workout.ejercicios.length}`} label="Ejercicios" color="#9B5CFF" />
        <Stat icon={<Check size={18} />} value={`${totalSets}`} label="Series" color="#00FF85" />
        <Stat icon={<Award size={18} />} value={`+${workout.xp_ganado}`} label="XP ganado" color="#FF9E3D" />
      </div>

      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">Resumen de series</h2>
      <div className="space-y-2">
        {workout.ejercicios.map((e, idx) => {
          const ex = findExercise(e.exercise_id);
          return (
            <GlassCard key={idx} className="p-4">
              <p className="mb-2 font-semibold text-white">{ex?.nombre ?? 'Ejercicio'}</p>
              <div className="space-y-1">
                {e.sets.map((s, sidx) => (
                  <div
                    key={sidx}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="text-white/50">Serie {s.numero}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white">{s.repeticiones} reps</span>
                      {s.peso_kg > 0 && <span className="text-white/70">{s.peso_kg} kg</span>}
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{
                          background: s.completado
                            ? 'linear-gradient(135deg, #00FF85, #00BFFF)'
                            : 'rgba(255,255,255,0.1)',
                          color: s.completado ? '#050507' : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {s.completado && <Check size={12} strokeWidth={3} />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {totalVolume > 0 && (
        <GlassCard variant="purple" glow className="mt-3 p-4 text-center">
          <p className="text-xs text-white/50">Volumen total (reps × peso)</p>
          <p className="text-2xl font-extrabold text-gradient-purple">{totalVolume.toFixed(1)} kg</p>
        </GlassCard>
      )}
    </AppShell>
  );
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <GlassCard className="flex flex-col gap-1 p-4">
      <div style={{ color }}>{icon}</div>
      <p className="text-xl font-extrabold leading-none text-white">{value}</p>
      <p className="text-[10px] text-white/50">{label}</p>
    </GlassCard>
  );
}
