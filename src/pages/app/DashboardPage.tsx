import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Dumbbell, Scale, Target, ChevronRight, Sparkles } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../store/auth';
import { workoutsRepo, goalsRepo } from '../../services/database';
import { calcStreak, workoutsThisWeek, levelFromXP } from '../../services/gamification';
import { Progress } from '../../components/ui/Progress';
import { findRoutine } from '../../data/seed';
import type { Workout, UserGoal } from '../../types';

export function DashboardPage() {
  const nav = useNavigate();
  const { profile } = useAuth();
  if (!profile) return null;

  const workouts = useMemo<Workout[]>(() => workoutsRepo.list(profile.id), [profile.id, profile.xp]);
  const goals = useMemo<UserGoal[]>(() => goalsRepo.list(profile.id), [profile.id]);
  const streak = useMemo(() => calcStreak(workouts), [workouts]);
  const week = useMemo(() => workoutsThisWeek(workouts), [workouts]);
  const lvl = levelFromXP(profile.xp);
  const lastWorkout = useMemo(() => {
    const sorted = [...workouts].sort(
      (a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime(),
    );
    return sorted[0];
  }, [workouts]);

  const weeklyGoal = goals.find((g) => g.tipo === 'entrenamientos_semana' && g.estado === 'activa');
  const weeklyTarget = weeklyGoal?.objetivo_valor ?? 3;
  const weeklyProgress = Math.min(weeklyTarget, week.length);

  // Rutina recomendada del día: rota según el día de la semana
  const routineIds = ['rt_full_body_principiante', 'rt_full_body_intermedio', 'rt_fuerza_casa', 'rt_resistencia', 'rt_acondicionamiento'];
  const recommendedId = routineIds[new Date().getDay() % routineIds.length];
  const recommended = findRoutine(recommendedId);

  const greeting = getGreeting();

  return (
    <AppShell>
      {/* Header con saludo */}
      <div className="mb-5">
        <p className="text-sm text-slate-500">{greeting} 👋</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{profile.nombre}</h1>
      </div>

      {/* Tarjeta de nivel / XP */}
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-100">Nivel {lvl.nivel}</p>
            <p className="text-2xl font-extrabold">{profile.xp.toLocaleString()} XP</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <Sparkles size={24} />
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-brand-100">
            <span>Progreso al nivel {lvl.nivel + 1}</span>
            <span>{Math.round(lvl.progreso * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${lvl.progreso * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard icon={<Flame size={20} />} value={`${streak}`} label="Racha días" color="text-orange-500 bg-orange-50 dark:bg-orange-900/30" />
        <StatCard icon={<Dumbbell size={20} />} value={`${week.length}/${weeklyTarget}`} label="Esta semana" color="text-brand-600 bg-brand-50 dark:bg-brand-900/30" />
        <StatCard icon={<Scale size={20} />} value={`${profile.peso_actual_kg.toFixed(0)}`} label="kg actual" color="text-purple-600 bg-purple-50 dark:bg-purple-900/30" />
      </div>

      {/* Objetivo semanal */}
      {weeklyGoal && (
        <div className="card mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-brand-600" />
              <span className="font-semibold">Objetivo semanal</span>
            </div>
            <span className="text-sm font-bold text-brand-600">
              {weeklyProgress}/{weeklyTarget}
            </span>
          </div>
          <Progress value={weeklyProgress} max={weeklyTarget} />
          <p className="mt-2 text-xs text-slate-500">
            {weeklyProgress >= weeklyTarget
              ? '¡Objetivo cumplido esta semana! 🎉'
              : `Te faltan ${weeklyTarget - weeklyProgress} entrenamiento(s) para tu objetivo.`}
          </p>
        </div>
      )}

      {/* Rutina recomendada del día */}
      {recommended && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Tu entrenamiento de hoy</h2>
          <button
            onClick={() => nav(`/rutina/${recommended.id}`)}
            className="card flex w-full items-center justify-between text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl dark:bg-brand-900/40">
                🏋️
              </div>
              <div>
                <p className="font-bold">{recommended.nombre}</p>
                <p className="text-xs text-slate-500">
                  {recommended.duracion_estimada_min} min · {recommended.ejercicios.length} ejercicios · {capitalize(recommended.nivel)}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* Último entrenamiento */}
      {lastWorkout && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Último entrenamiento</h2>
          <button
            onClick={() => nav(`/historial/${lastWorkout.id}`)}
            className="card flex w-full items-center justify-between text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-900/30">
                <Trophy size={22} />
              </div>
              <div>
                <p className="font-semibold">{lastWorkout.routine_name}</p>
                <p className="text-xs text-slate-500">
                  {Math.floor(lastWorkout.duracion_seg / 60)} min · {lastWorkout.ejercicios.length} ejercicios
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* CTA principal */}
      <button
        onClick={() => nav('/entrenar')}
        className="btn-primary w-full py-4 text-base"
      >
        <Dumbbell size={22} /> Comenzar entrenamiento
      </button>
    </AppShell>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 p-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>{icon}</div>
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return '¡Buenos días';
  if (h < 19) return '¡Buenas tardes';
  return '¡Buenas noches';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
