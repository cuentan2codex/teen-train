import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, Pause, Play,
  SkipForward, Coffee, Plus, Minus, Flag,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Modal } from '../../components/ui/Modal';
import { useStopwatch, useCountdown } from '../../hooks/useTimers';
import { useAuth } from '../../store/auth';
import { findRoutine, findExercise } from '../../data/seed';
import { workoutsRepo } from '../../services/database';
import { calcWorkoutXP, checkAchievements } from '../../services/gamification';
import type { Workout, SetLog, WorkoutExerciseLog } from '../../types';
import { formatDuration } from '../../utils/format';

export function WorkoutSessionPage() {
  const { id: routineId } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { profile, refresh } = useAuth();
  const routine = routineId ? findRoutine(routineId) : undefined;

  const sortedExercises = useMemo(
    () => (routine ? [...routine.ejercicios].sort((a, b) => a.orden - b.orden) : []),
    [routine],
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [sets, setSets] = useState<WorkoutExerciseLog[]>(() =>
    sortedExercises.map((re) => ({
      exercise_id: re.exercise_id,
      orden: re.orden,
      sets: Array.from({ length: re.series }, (_, i) => ({
        numero: i + 1,
        repeticiones: re.repeticiones ?? 0,
        peso_kg: 0,
        duracion_seg: re.duracion_seg,
        completado: false,
      })),
    })),
  );
  const [showRest, setShowRest] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showSummary, setShowSummary] = useState<null | { xp: number; duration: number }>(null);

  const stopwatch = useStopwatch();

  const restTimer = useCountdown(60, () => {
    setShowRest(false);
  });

  if (!routine || !profile) {
    return (
      <AppShell showNav={false}>
        <div className="text-center text-slate-500">Rutina no encontrada.</div>
      </AppShell>
    );
  }

  const current = sortedExercises[currentIdx];
  const currentLog = sets[currentIdx];
  const exercise = findExercise(current.exercise_id);

  const updateSet = useCallback((setIdx: number, patch: Partial<SetLog>) => {
    setSets((prev) => {
      const copy = prev.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
      copy[currentIdx].sets[setIdx] = { ...copy[currentIdx].sets[setIdx], ...patch };
      return copy;
    });
  }, [currentIdx]);

  const completeSet = useCallback((setIdx: number) => {
    setSets((prev) => {
      const copy = prev.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
      const s = copy[currentIdx].sets[setIdx];
      s.completado = !s.completado;
      return copy;
    });
    // Iniciar descanso si se completó
    if (!currentLog.sets[setIdx].completado) {
      const restSec = current.descanso_seg;
      setShowRest(true);
      restTimer.start(restSec);
    }
  }, [currentIdx, currentLog.sets, current.descanso_seg, restTimer]);

  const goNext = useCallback(() => {
    if (currentIdx < sortedExercises.length - 1) setCurrentIdx(currentIdx + 1);
    else setShowFinishConfirm(true);
  }, [currentIdx, sortedExercises.length]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  }, [currentIdx]);

  const finishWorkout = useCallback(() => {
    const endTs = Date.now();
    const duracion_seg = stopwatch.elapsed;
    const workout: Workout = {
      id: 'wk-' + Date.now().toString(36),
      user_id: profile.id,
      routine_id: routine.id,
      routine_name: routine.nombre,
      fecha_inicio: new Date(endTs - duracion_seg * 1000).toISOString(),
      fecha_fin: new Date(endTs).toISOString(),
      duracion_seg,
      estado: 'completado',
      xp_ganado: 0,
      ejercicios: sets,
    };
    const xp = calcWorkoutXP(workout);
    workout.xp_ganado = xp;
    workoutsRepo.save(profile.id, workout);

    // Actualizar XP del perfil
    useAuth.getState().updateProfile({ xp: profile.xp + xp });
    refresh();

    // Verificar logros
    checkAchievements(profile.id, useAuth.getState().profile!, [workout, ...workoutsRepo.list(profile.id)]);

    // Actualizar peso actual si el usuario registró pesos (lo dejamos igual)
    setShowFinishConfirm(false);
    setShowSummary({ xp, duration: duracion_seg });
  }, [stopwatch.elapsed, profile, routine, sets, refresh]);

  const cancelWorkout = useCallback(() => {
    nav(-1);
  }, [nav]);

  // Resumen
  if (showSummary) {
    return <SummaryView
      xp={showSummary.xp}
      duration={showSummary.duration}
      totalExercises={sortedExercises.length}
      totalSets={sets.reduce((a, e) => a + e.sets.filter((s) => s.completado).length, 0)}
      totalReps={sets.reduce((a, e) => a + e.sets.filter((s) => s.completado).reduce((b, s) => b + s.repeticiones, 0), 0)}
      onClose={() => nav('/historial')}
    />;
  }

  const completedSets = currentLog.sets.filter((s) => s.completado).length;
  const totalSets = currentLog.sets.length;
  const allExercisesDone = sets.every((e) => e.sets.every((s) => s.completado));

  return (
    <AppShell showNav={false}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={cancelWorkout}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500"
        >
          <ArrowLeft size={16} /> Salir
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold tabular-nums">{formatDuration(stopwatch.elapsed)}</span>
          <button
            onClick={() => (stopwatch.running ? stopwatch.pause() : stopwatch.resume())}
            className="rounded-full bg-slate-100 p-2 dark:bg-slate-800"
            aria-label={stopwatch.running ? 'Pausar' : 'Continuar'}
          >
            {stopwatch.running ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      {/* Progreso entre ejercicios */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">
            Ejercicio {currentIdx + 1} de {sortedExercises.length}
          </span>
          <span className="font-bold text-brand-600">
            {Math.round(((currentIdx) / sortedExercises.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${(currentIdx / sortedExercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tarjeta del ejercicio actual */}
      <div className="card mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{exercise?.musculos.join(' · ')}</p>
        <h2 className="text-xl font-extrabold">{exercise?.nombre}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {current.series} series × {current.repeticiones ?? `${current.duracion_seg}s`} · descanso {current.descanso_seg}s
        </p>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
          <span className="text-sm font-medium">Series completadas</span>
          <span className="font-bold">{completedSets}/{totalSets}</span>
        </div>
      </div>

      {/* Lista de series */}
      <div className="space-y-2">
        {currentLog.sets.map((s, idx) => (
          <div
            key={idx}
            className={`card p-3 transition ${
              s.completado ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Serie {s.numero}</span>
              <button
                onClick={() => completeSet(idx)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  s.completado
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                }`}
                aria-label={s.completado ? 'Desmarcar' : 'Completar serie'}
              >
                <Check size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <NumberStepper
                label="Reps"
                value={s.repeticiones}
                onChange={(v) => updateSet(idx, { repeticiones: v })}
                step={1}
                disabled={s.completado}
              />
              <NumberStepper
                label="Peso (kg)"
                value={s.peso_kg}
                onChange={(v) => updateSet(idx, { peso_kg: v })}
                step={0.5}
                disabled={s.completado}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navegación inferior */}
      <div className="sticky bottom-4 mt-6 flex gap-2">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="btn-secondary flex-1"
        >
          <ChevronLeft size={20} /> Anterior
        </button>
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="btn-secondary"
          aria-label="Finalizar"
        >
          <Flag size={20} />
        </button>
        <button
          onClick={goNext}
          className="btn-primary flex-[2]"
        >
          {currentIdx < sortedExercises.length - 1 ? (
            <>Siguiente <ChevronRight size={20} /></>
          ) : (
            <>Finalizar <Check size={20} /></>
          )}
        </button>
      </div>

      {/* Modal de descanso */}
      <Modal open={showRest} onClose={() => setShowRest(false)} title="Descanso">
        <RestView
          seconds={restTimer.remaining}
          running={restTimer.running}
          onSkip={() => { setShowRest(false); restTimer.reset(); }}
          onAdd={(s) => restTimer.start(restTimer.remaining + s)}
          onPause={restTimer.pause}
          onResume={restTimer.resume}
        />
      </Modal>

      {/* Modal confirmar finalizar */}
      <Modal open={showFinishConfirm} onClose={() => setShowFinishConfirm(false)} title="Finalizar entrenamiento">
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {allExercisesDone
              ? '¡Has completado todos los ejercicios! ¿Querés finalizar el entrenamiento?'
              : 'Aún quedan series sin completar. ¿Seguro que querés finalizar?'}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowFinishConfirm(false)} className="btn-secondary flex-1">
              Seguir entrenando
            </button>
            <button onClick={finishWorkout} className="btn-primary flex-1">
              Finalizar
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

function NumberStepper({
  label, value, onChange, step = 1, disabled,
}: { label: string; value: number; onChange: (v: number) => void; step?: number; disabled?: boolean }) {
  return (
    <div className="flex-1">
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(+e.target.value || 0)}
          className="input h-10 text-center"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(+(value + step).toFixed(2))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function RestView({
  seconds, running, onSkip, onAdd, onPause, onResume,
}: {
  seconds: number; running: boolean;
  onSkip: () => void; onAdd: (s: number) => void;
  onPause: () => void; onResume: () => void;
}) {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
        <Coffee size={48} className="text-brand-600" />
      </div>
      <p className="mb-1 text-sm font-medium text-slate-500">Tiempo de descanso</p>
      <p className="mb-5 font-mono text-5xl font-extrabold tabular-nums">{mm}:{ss}</p>
      <div className="flex justify-center gap-2">
        <button onClick={() => onAdd(15)} className="btn-secondary">+15s</button>
        {running ? (
          <button onClick={onPause} className="btn-secondary"><Pause size={16} /> Pausar</button>
        ) : (
          <button onClick={onResume} className="btn-secondary"><Play size={16} /> Continuar</button>
        )}
        <button onClick={onSkip} className="btn-primary"><SkipForward size={16} /> Saltar</button>
      </div>
    </div>
  );
}

function SummaryView({
  xp, duration, totalExercises, totalSets, totalReps, onClose,
}: {
  xp: number; duration: number; totalExercises: number; totalSets: number; totalReps: number; onClose: () => void;
}) {
  return (
    <AppShell showNav={false}>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-pop">
        <div className="mb-3 text-6xl">🎉</div>
        <h1 className="text-2xl font-extrabold">¡Entrenamiento completado!</h1>
        <p className="mt-1 text-slate-500">Lo lograste, seguí así.</p>

        <div className="my-6 grid w-full grid-cols-2 gap-3">
          <SummaryStat icon="⏱️" label="Duración" value={formatDuration(duration)} />
          <SummaryStat icon="🏋️" label="Ejercicios" value={`${totalExercises}`} />
          <SummaryStat icon="📦" label="Series" value={`${totalSets}`} />
          <SummaryStat icon="🔢" label="Repeticiones" value={`${totalReps}`} />
        </div>

        <div className="card w-full border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-700 dark:text-amber-300">XP ganado</p>
          <p className="text-3xl font-extrabold text-amber-600">+{xp} XP</p>
        </div>

        <button onClick={onClose} className="btn-primary mt-6 w-full">
          Ver historial
        </button>
      </div>
    </AppShell>
  );
}

function SummaryStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="card flex flex-col items-center gap-1 p-3">
      <span className="text-2xl">{icon}</span>
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
