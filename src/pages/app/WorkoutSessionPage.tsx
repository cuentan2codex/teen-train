import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, Pause, Play,
  SkipForward, Coffee, Plus, Minus, Flag,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';
import { Modal } from '../../components/ui/Modal';
import { ActivityRing } from '../../components/ui/ActivityRing';
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
        <div className="text-center text-white/50">Rutina no encontrada.</div>
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
    const wasCompleted = currentLog.sets[setIdx].completado;
    setSets((prev) => {
      const copy = prev.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
      copy[currentIdx].sets[setIdx].completado = !copy[currentIdx].sets[setIdx].completado;
      return copy;
    });
    if (!wasCompleted) {
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

    useAuth.getState().updateProfile({ xp: profile.xp + xp });
    refresh();
    checkAchievements(profile.id, useAuth.getState().profile!, [workout, ...workoutsRepo.list(profile.id)]);

    setShowFinishConfirm(false);
    setShowSummary({ xp, duration: duracion_seg });
  }, [stopwatch.elapsed, profile, routine, sets, refresh]);

  const cancelWorkout = useCallback(() => {
    nav(-1);
  }, [nav]);

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
  const overallProgress = (sets.reduce((a, e) => a + e.sets.filter((s) => s.completado).length, 0) /
    sets.reduce((a, e) => a + e.sets.length, 0)) * 100;

  return (
    <AppShell showNav={false}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={cancelWorkout}
          className="inline-flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition"
        >
          <ArrowLeft size={16} /> Salir
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold tabular-nums text-neon-purple" style={{ textShadow: '0 0 12px rgba(155,92,255,0.6)' }}>
            {formatDuration(stopwatch.elapsed)}
          </span>
          <button
            onClick={() => (stopwatch.running ? stopwatch.pause() : stopwatch.resume())}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/70 backdrop-blur transition hover:bg-white/15"
            aria-label={stopwatch.running ? 'Pausar' : 'Continuar'}
          >
            {stopwatch.running ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      {/* Progreso global con anillo */}
      <GlassCard variant="purple" glow className="mb-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neon-purple">Progreso total</p>
            <p className="text-2xl font-extrabold text-white">
              {Math.round(overallProgress)}<span className="text-base text-white/40">%</span>
            </p>
            <p className="text-xs text-white/50">
              Ejercicio {currentIdx + 1} de {sortedExercises.length}
            </p>
          </div>
          <ActivityRing
            value={overallProgress}
            size={80}
            stroke={8}
            gradientFrom="#9B5CFF"
            gradientTo="#00BFFF"
            glowColor="rgba(155, 92, 255, 0.6)"
          >
            <span className="text-sm font-bold text-white">{Math.round(overallProgress)}%</span>
          </ActivityRing>
        </div>
      </GlassCard>

      {/* Tarjeta del ejercicio actual */}
      <GlassCard variant="strong" className="mb-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neon-pink">
          {exercise?.musculos.join(' · ')}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-white">{exercise?.nombre}</h2>
        <p className="mt-1 text-sm text-white/50">
          {current.series} series × {current.repeticiones ?? `${current.duracion_seg}s`} · descanso {current.descanso_seg}s
        </p>

        <div
          className="mt-3 flex items-center justify-between rounded-2xl p-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-sm font-medium text-white/70">Series completadas</span>
          <span className="font-bold text-neon-green" style={{ textShadow: '0 0 8px rgba(0,255,133,0.5)' }}>
            {completedSets}/{totalSets}
          </span>
        </div>
      </GlassCard>

      {/* Lista de series */}
      <div className="space-y-2">
        {currentLog.sets.map((s, idx) => (
          <GlassCard
            key={idx}
            className={`p-3 transition-all ${s.completado ? 'glass-green' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Serie {s.numero}</span>
              <button
                onClick={() => completeSet(idx)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 ${
                  s.completado ? 'animate-pop' : ''
                }`}
                style={{
                  background: s.completado
                    ? 'linear-gradient(135deg, #00FF85, #00BFFF)'
                    : 'rgba(255,255,255,0.08)',
                  color: s.completado ? '#050507' : 'rgba(255,255,255,0.5)',
                  border: s.completado ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.12)',
                  boxShadow: s.completado ? '0 0 16px rgba(0,255,133,0.5)' : 'none',
                }}
                aria-label={s.completado ? 'Desmarcar' : 'Completar serie'}
              >
                <Check size={20} strokeWidth={3} />
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
          </GlassCard>
        ))}
      </div>

      {/* Navegación inferior */}
      <div className="sticky bottom-4 mt-6 flex gap-2">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="btn-glass flex-1"
        >
          <ChevronLeft size={20} /> Ant.
        </button>
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="btn-glass"
          aria-label="Finalizar"
        >
          <Flag size={20} />
        </button>
        <button
          onClick={goNext}
          className="btn-primary flex-[2] shadow-glow-purple"
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
          <p className="text-sm text-white/70">
            {allExercisesDone
              ? '¡Has completado todos los ejercicios! ¿Querés finalizar el entrenamiento?'
              : 'Aún quedan series sin completar. ¿Seguro que querés finalizar?'}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowFinishConfirm(false)} className="btn-glass flex-1">
              Seguir
            </button>
            <button onClick={finishWorkout} className="btn-success flex-1">
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
      <label className="mb-1 block text-xs text-white/50">{label}</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white/60 disabled:opacity-40"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(+e.target.value || 0)}
          className="input-glass h-10 text-center"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(+(value + step).toFixed(2))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white/60 disabled:opacity-40"
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
  const total = 60; // baseline para el anillo
  const pct = Math.min(100, (seconds / total) * 100);
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');

  return (
    <div className="text-center">
      <ActivityRing
        value={pct}
        size={200}
        stroke={14}
        gradientFrom="#9B5CFF"
        gradientTo="#00BFFF"
        glowColor="rgba(0, 191, 255, 0.6)"
      >
        <Coffee size={32} className="mx-auto mb-1 text-neon-blue" />
        <p className="text-xs text-white/50">Descanso</p>
        <p className="font-mono text-4xl font-extrabold text-white" style={{ textShadow: '0 0 16px rgba(0,191,255,0.6)' }}>
          {mm}:{ss}
        </p>
      </ActivityRing>

      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => onAdd(15)} className="btn-glass">+15s</button>
        {running ? (
          <button onClick={onPause} className="btn-glass"><Pause size={16} /> Pausar</button>
        ) : (
          <button onClick={onResume} className="btn-glass"><Play size={16} /> Continuar</button>
        )}
        <button onClick={onSkip} className="btn-primary shadow-glow-purple">
          <SkipForward size={16} /> Saltar
        </button>
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="mb-3 text-7xl animate-pop">🎉</div>
        <h1 className="text-2xl font-extrabold text-white">¡Entrenamiento completado!</h1>
        <p className="mt-1 text-white/50">Lo lograste, seguí así.</p>

        <div className="my-6 grid w-full grid-cols-2 gap-3">
          <SummaryStat icon="⏱️" label="Duración" value={formatDuration(duration)} />
          <SummaryStat icon="🏋️" label="Ejercicios" value={`${totalExercises}`} />
          <SummaryStat icon="📦" label="Series" value={`${totalSets}`} />
          <SummaryStat icon="🔢" label="Repeticiones" value={`${totalReps}`} />
        </div>

        <GlassCard
          variant="purple"
          glow
          className="w-full p-5 animate-pulse-glow"
        >
          <p className="text-sm text-neon-purple">XP ganado</p>
          <p className="text-4xl font-extrabold text-gradient-purple">+{xp} XP</p>
        </GlassCard>

        <button onClick={onClose} className="btn-primary mt-6 w-full shadow-glow-purple">
          Ver historial
        </button>
      </div>
    </AppShell>
  );
}

function SummaryStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <GlassCard className="flex flex-col items-center gap-1 p-3">
      <span className="text-2xl">{icon}</span>
      <p className="text-lg font-extrabold leading-none text-white">{value}</p>
      <p className="text-[10px] text-white/50">{label}</p>
    </GlassCard>
  );
}
