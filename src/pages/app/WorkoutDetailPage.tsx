import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Dumbbell, Check, Award } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
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
        <div className="text-center text-slate-500">Entrenamiento no encontrado.</div>
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
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="text-2xl font-extrabold">{workout.routine_name}</h1>
      <p className="text-sm text-slate-500">{formatDate(workout.fecha_inicio)}</p>

      <div className="my-4 grid grid-cols-2 gap-3">
        <Stat icon={<Clock size={18} />} value={formatLongDuration(workout.duracion_seg)} label="Duración" />
        <Stat icon={<Dumbbell size={18} />} value={`${workout.ejercicios.length}`} label="Ejercicios" />
        <Stat icon={<Check size={18} />} value={`${totalSets}`} label="Series" />
        <Stat icon={<Award size={18} />} value={`+${workout.xp_ganado}`} label="XP ganado" />
      </div>

      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Resumen de series</h2>
      <div className="space-y-2">
        {workout.ejercicios.map((e, idx) => {
          const ex = findExercise(e.exercise_id);
          return (
            <div key={idx} className="card p-3">
              <p className="mb-2 font-semibold">{ex?.nombre ?? 'Ejercicio'}</p>
              <div className="space-y-1">
                {e.sets.map((s, sidx) => (
                  <div key={sidx} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                    <span className="text-slate-500">Serie {s.numero}</span>
                    <div className="flex items-center gap-3">
                      <span>{s.repeticiones} reps</span>
                      {s.peso_kg > 0 && <span>{s.peso_kg} kg</span>}
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        s.completado ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {s.completado && <Check size={12} strokeWidth={3} />}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {totalVolume > 0 && (
        <div className="card mt-3 bg-brand-50 text-center dark:bg-brand-900/20">
          <p className="text-xs text-slate-500">Volumen total (reps × peso)</p>
          <p className="text-xl font-extrabold text-brand-700 dark:text-brand-300">{totalVolume.toFixed(1)} kg</p>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card flex flex-col gap-1 p-3">
      <div className="text-brand-600">{icon}</div>
      <p className="text-xl font-extrabold leading-none">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
