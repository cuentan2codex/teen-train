import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Dumbbell, Scale, ChevronRight, Sparkles, Zap, Clock } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';
import { ActivityRing } from '../../components/ui/ActivityRing';
import { Avatar } from '../../components/ui/Avatar';
import { Progress } from '../../components/ui/Progress';
import { useAuth } from '../../store/auth';
import { workoutsRepo, goalsRepo } from '../../services/database';
import { calcStreak, workoutsThisWeek, levelFromXP } from '../../services/gamification';
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

  const weeklyGoal = goals.find((g) => g.tipo === 'entrenamientos_semana' && g.estado === 'activa');
  const weeklyTarget = weeklyGoal?.objetivo_valor ?? 3;
  const weeklyProgress = Math.min(weeklyTarget, week.length);

  // Porcentaje de actividad semanal (para el anillo)
  const activityPct = Math.min(100, (weeklyProgress / weeklyTarget) * 100);

  // Rutina recomendada del día
  const routineIds = ['rt_full_body_principiante', 'rt_full_body_intermedio', 'rt_fuerza_casa', 'rt_resistencia', 'rt_acondicionamiento'];
  const recommendedId = routineIds[new Date().getDay() % routineIds.length];
  const recommended = findRoutine(recommendedId);

  const lastWorkout = useMemo(() => {
    const sorted = [...workouts].sort(
      (a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime(),
    );
    return sorted[0];
  }, [workouts]);

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <AppShell>
      {/* Header con saludo + avatar */}
      <div className="mb-5 flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">{today}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{greeting}, {profile.nombre} 👋</h1>
        </div>
        <button onClick={() => nav('/perfil')}>
          <Avatar name={profile.nombre} size={44} glow />
        </button>
      </div>

      {/* Tarjeta hero con ActivityRing */}
      <GlassCard variant="strong" glow className="mb-4 p-5 stagger-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neon-pink">Actividad semanal</p>
            <p className="text-4xl font-extrabold text-white animate-count-pop">
              {weeklyProgress}<span className="text-lg text-white/40">/{weeklyTarget}</span>
            </p>
            <p className="mt-1 text-sm text-white/50">entrenamientos completados</p>
            <div className="mt-3">
              <Progress
                value={weeklyProgress}
                max={weeklyTarget}
                color="linear-gradient(90deg, #FF3D8D, #9B5CFF)"
                height={8}
              />
            </div>
          </div>
          <ActivityRing
            value={activityPct}
            size={120}
            stroke={12}
            gradientFrom="#FF3D8D"
            gradientTo="#9B5CFF"
            glowColor="rgba(255, 61, 141, 0.6)"
          >
            <span className="text-2xl font-extrabold text-white">{Math.round(activityPct)}%</span>
            <span className="text-[10px] text-white/50">objetivo</span>
          </ActivityRing>
        </div>
      </GlassCard>

      {/* XP y nivel */}
      <GlassCard variant="purple" glow className="mb-4 p-4 stagger-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-neon-purple"
              style={{ background: 'rgba(155,92,255,0.15)', border: '1px solid rgba(155,92,255,0.3)' }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs text-white/50">Nivel {lvl.nivel}</p>
              <p className="text-lg font-extrabold text-white">{profile.xp.toLocaleString()} XP</p>
            </div>
          </div>
          <span className="text-xs text-white/50">{Math.round(lvl.progreso * 100)}% al nivel {lvl.nivel + 1}</span>
        </div>
        <Progress value={lvl.progreso * 100} max={100} color="linear-gradient(90deg, #9B5CFF, #00BFFF)" height={6} />
      </GlassCard>

      {/* Grid de stats rápidas */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatTile
          icon={<Flame size={18} />}
          value={`${streak}`}
          label="Racha días"
          color="#FF9E3D"
          delay={3}
        />
        <StatTile
          icon={<Dumbbell size={18} />}
          value={`${week.length}`}
          label="Esta semana"
          color="#9B5CFF"
          delay={4}
        />
        <StatTile
          icon={<Scale size={18} />}
          value={`${profile.peso_actual_kg.toFixed(0)}`}
          label="kg actual"
          color="#00BFFF"
          delay={5}
        />
        <StatTile
          icon={<Zap size={18} />}
          value={`${workouts.filter(w => w.estado === 'completado').length}`}
          label="Total"
          color="#00FF85"
          delay={6}
        />
      </div>

      {/* Rutina recomendada del día */}
      {recommended && (
        <div className="mb-4 stagger-4">
          <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">Tu entrenamiento de hoy</h2>
          <GlassCard
            interactive
            onClick={() => nav(`/rutina/${recommended.id}`)}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(155,92,255,0.2), rgba(255,61,141,0.2))',
                  border: '1px solid rgba(155,92,255,0.3)',
                }}
              >
                🏋️
              </div>
              <div>
                <p className="font-bold text-white">{recommended.nombre}</p>
                <p className="flex items-center gap-2 text-xs text-white/50">
                  <Clock size={11} /> {recommended.duracion_estimada_min} min
                  <span>·</span>
                  {recommended.ejercicios.length} ejercicios
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/40" />
          </GlassCard>
        </div>
      )}

      {/* Último entrenamiento */}
      {lastWorkout && (
        <div className="mb-6 stagger-5">
          <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">Último entrenamiento</h2>
          <GlassCard
            interactive
            onClick={() => nav(`/historial/${lastWorkout.id}`)}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-neon-green"
                style={{ background: 'rgba(0,255,133,0.12)', border: '1px solid rgba(0,255,133,0.3)' }}
              >
                <Trophy size={22} />
              </div>
              <div>
                <p className="font-semibold text-white">{lastWorkout.routine_name}</p>
                <p className="text-xs text-white/50">
                  {Math.floor(lastWorkout.duracion_seg / 60)} min · +{lastWorkout.xp_ganado} XP
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/40" />
          </GlassCard>
        </div>
      )}

      {/* CTA principal */}
      <button
        onClick={() => nav('/entrenar')}
        className="btn-primary w-full py-4 text-base shadow-glow-purple stagger-6"
      >
        <Dumbbell size={22} /> Comenzar entrenamiento
      </button>
    </AppShell>
  );
}

function StatTile({
  icon, value, label, color, delay,
}: { icon: React.ReactNode; value: string; label: string; color: string; delay: number }) {
  return (
    <GlassCard className={`p-4 stagger-${delay}`}>
      <div
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background: `${color}1f`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {icon}
      </div>
      <p className="text-2xl font-extrabold leading-none text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/50">{label}</p>
    </GlassCard>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return '¡Buenos días';
  if (h < 19) return '¡Buenas tardes';
  return '¡Buenas noches';
}
