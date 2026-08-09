import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ListOrdered, ArrowLeft, Play, Target } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { findRoutine, findExercise } from '../../data/seed';
import type { Level } from '../../types';

export function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const routine = id ? findRoutine(id) : undefined;

  if (!routine) {
    return (
      <AppShell showNav={false}>
        <div className="text-center text-slate-500">Rutina no encontrada.</div>
      </AppShell>
    );
  }

  const levelColor =
    routine.nivel === 'principiante' ? 'success' : routine.nivel === 'intermedio' ? 'warning' : 'danger';

  return (
    <AppShell showNav={false}>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="mb-2 flex items-center gap-2">
        <Badge variant={levelColor as any}>{capitalize(routine.nivel)}</Badge>
        <Badge variant="info">{capitalize(routine.objetivo)}</Badge>
      </div>
      <h1 className="text-2xl font-extrabold">{routine.nombre}</h1>
      <p className="mt-1 text-sm text-slate-500">{routine.descripcion}</p>

      <div className="my-4 grid grid-cols-3 gap-3">
        <InfoBox icon={<Clock size={18} />} value={`${routine.duracion_estimada_min}`} label="min" />
        <InfoBox icon={<ListOrdered size={18} />} value={`${routine.ejercicios.length}`} label="ejercicios" />
        <InfoBox icon={<Target size={18} />} value={`${routine.ejercicios.reduce((a, e) => a + e.series, 0)}`} label="series" />
      </div>

      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Ejercicios</h2>
      <div className="space-y-2">
        {routine.ejercicios
          .slice()
          .sort((a, b) => a.orden - b.orden)
          .map((re, idx) => {
            const ex = findExercise(re.exercise_id);
            if (!ex) return null;
            return (
              <div key={idx} className="card flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {re.orden}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{ex.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {re.series} series × {re.repeticiones ?? `${re.duracion_seg}s`}
                    <span className="ml-2">· descanso {re.descanso_seg}s</span>
                  </p>
                </div>
                <button
                  onClick={() => nav(`/ejercicio/${ex.id}`)}
                  className="rounded-full p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
                  aria-label="Ver ejercicio"
                >
                  ⓘ
                </button>
              </div>
            );
          })}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button
          onClick={() => nav(`/entrenar/sesion/${routine.id}`)}
          className="btn-primary w-full py-4 text-base shadow-lg"
        >
          <Play size={22} /> Comenzar entrenamiento
        </button>
      </div>
    </AppShell>
  );
}

function InfoBox({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card flex flex-col items-center gap-1 p-3">
      <div className="text-brand-600">{icon}</div>
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// re-export for compatibility
export type { Level };
