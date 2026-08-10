import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Flame, Dumbbell, Settings, LogOut, Trophy, ChevronRight } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Avatar } from '../../components/ui/Avatar';
import { Progress } from '../../components/ui/Progress';
import { useAuth } from '../../store/auth';
import { workoutsRepo, achievementsRepo } from '../../services/database';
import { calcStreak, levelFromXP } from '../../services/gamification';
import { SEED_ACHIEVEMENTS } from '../../data/seed';
import { formatDate } from '../../utils/format';

export function ProfilePage() {
  const nav = useNavigate();
  const { profile, logout } = useAuth();
  if (!profile) return null;

  const workouts = useMemo(() => workoutsRepo.list(profile.id), [profile.id]);
  const unlocked = useMemo(() => achievementsRepo.list(profile.id), [profile.id]);
  const streak = calcStreak(workouts);
  const totalWorkouts = workouts.filter((w) => w.estado === 'completado').length;
  const lvl = levelFromXP(profile.xp);

  const unlockedIds = new Set(unlocked.map((u) => u.achievement_id));

  return (
    <AppShell>
      <PageHeader
        title="Perfil"
        icon={<Trophy size={20} />}
        action={
          <button
            onClick={() => nav('/configuracion')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white/60 transition hover:bg-white/8 hover:text-white"
            aria-label="Configuración"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Settings size={20} />
          </button>
        }
      />

      {/* Cabecera de perfil */}
      <GlassCard variant="purple" glow className="mb-4 flex items-center gap-4 p-5 animate-slide-up">
        <Avatar name={profile.nombre} size={64} glow />
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-white">{profile.nombre}</h2>
          <p className="text-sm text-white/50">{profile.email}</p>
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-neon-purple">Nivel {lvl.nivel}</span>
              <span className="text-white/50">{profile.xp.toLocaleString()} XP</span>
            </div>
            <Progress value={lvl.progreso * 100} max={100} color="linear-gradient(90deg, #9B5CFF, #FF3D8D)" height={6} />
          </div>
        </div>
      </GlassCard>

      {/* Stats resumen */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatBox icon={<Flame size={18} />} value={`${streak}`} label="Racha días" color="#FF9E3D" delay={2} />
        <StatBox icon={<Dumbbell size={18} />} value={`${totalWorkouts}`} label="Entrenamientos" color="#9B5CFF" delay={3} />
        <StatBox icon={<Award size={18} />} value={`${unlocked.length}/${SEED_ACHIEVEMENTS.length}`} label="Logros" color="#00FF85" delay={4} />
      </div>

      {/* Datos físicos */}
      <GlassCard className="mb-4 p-4 stagger-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">Datos personales</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Edad" value={`${profile.edad} años`} />
          <Info label="Altura" value={`${profile.altura_cm} cm`} />
          <Info label="Peso inicial" value={`${profile.peso_inicial_kg.toFixed(1)} kg`} />
          <Info label="Peso actual" value={`${profile.peso_actual_kg.toFixed(1)} kg`} />
          <Info label="Objetivo" value={profile.objetivo.replace('_', ' ')} />
          <Info label="Nivel" value={profile.nivel} />
          <Info label="Miembro desde" value={formatDate(profile.created_at)} />
          <Info label="Unidades" value={profile.units.toUpperCase()} />
        </div>
      </GlassCard>

      {/* Logros */}
      <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">Logros</h3>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {SEED_ACHIEVEMENTS.map((a, idx) => {
          const isUnlocked = unlockedIds.has(a.id);
          return (
            <GlassCard
              key={a.id}
              className={`flex flex-col items-center gap-1 p-3 text-center transition stagger-${Math.min(idx + 1, 6)} ${
                isUnlocked ? '' : 'opacity-30 grayscale'
              }`}
            >
              <span className="text-3xl" style={isUnlocked ? { filter: 'drop-shadow(0 0 8px rgba(255,158,61,0.5))' } : undefined}>
                {a.icono}
              </span>
              <p className="text-xs font-bold leading-tight text-white">{a.nombre}</p>
              <p className="text-[10px] text-white/50">{a.descripcion}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Menú rápido */}
      <div className="space-y-2">
        <MenuItem icon={<Settings size={18} />} label="Configuración" onClick={() => nav('/configuracion')} color="#9B5CFF" />
        <MenuItem
          icon={<LogOut size={18} />}
          label="Cerrar sesión"
          onClick={() => { logout(); nav('/login'); }}
          color="#FF3D8D"
        />
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="font-semibold capitalize text-white">{value}</p>
    </div>
  );
}

function StatBox({ icon, value, label, color, delay }: { icon: React.ReactNode; value: string; label: string; color: string; delay: number }) {
  return (
    <GlassCard className={`flex flex-col items-center gap-1 p-3 stagger-${delay}`}>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: `${color}1f`, color, border: `1px solid ${color}40` }}
      >
        {icon}
      </div>
      <p className="text-lg font-extrabold leading-none text-white">{value}</p>
      <p className="text-[10px] text-white/50">{label}</p>
    </GlassCard>
  );
}

function MenuItem({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) {
  return (
    <GlassCard interactive onClick={onClick} className="flex items-center gap-3 p-4">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}1f`, color, border: `1px solid ${color}40` }}
      >
        {icon}
      </div>
      <span className="flex-1 font-medium text-white">{label}</span>
      <ChevronRight size={20} className="text-white/30" />
    </GlassCard>
  );
}
