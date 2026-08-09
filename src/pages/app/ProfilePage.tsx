import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Flame, Dumbbell, Settings, LogOut, Trophy } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
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
            className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Configuración"
          >
            <Settings size={20} />
          </button>
        }
      />

      {/* Cabecera de perfil */}
      <div className="card mb-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-extrabold text-white">
          {profile.nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-extrabold">{profile.nombre}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <p className="mt-1 text-xs font-semibold text-brand-600">Nivel {lvl.nivel} · {profile.xp.toLocaleString()} XP</p>
        </div>
      </div>

      {/* Datos físicos */}
      <div className="card mb-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Datos personales</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Edad" value={`${profile.edad} años`} />
          <Info label="Altura" value={`${profile.altura_cm} cm`} />
          <Info label="Peso inicial" value={`${profile.peso_inicial_kg.toFixed(1)} kg`} />
          <Info label="Peso actual" value={`${profile.peso_actual_kg.toFixed(1)} kg`} />
          <Info label="Objetivo" value={capitalize(profile.objetivo.replace('_', ' '))} />
          <Info label="Nivel" value={capitalize(profile.nivel)} />
          <Info label="Miembro desde" value={formatDate(profile.created_at)} />
          <Info label="Unidades" value={profile.units.toUpperCase()} />
        </div>
      </div>

      {/* Stats resumen */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatBox icon={<Flame size={20} />} value={`${streak}`} label="Racha días" color="text-orange-500" />
        <StatBox icon={<Dumbbell size={20} />} value={`${totalWorkouts}`} label="Entrenamientos" color="text-brand-600" />
        <StatBox icon={<Award size={20} />} value={`${unlocked.length}/${SEED_ACHIEVEMENTS.length}`} label="Logros" color="text-amber-500" />
      </div>

      {/* Logros */}
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Logros</h3>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {SEED_ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedIds.has(a.id);
          return (
            <div
              key={a.id}
              className={`card flex flex-col items-center gap-1 p-3 text-center transition ${
                unlocked ? '' : 'opacity-40 grayscale'
              }`}
            >
              <span className="text-3xl">{a.icono}</span>
              <p className="text-xs font-bold leading-tight">{a.nombre}</p>
              <p className="text-[10px] text-slate-500">{a.descripcion}</p>
            </div>
          );
        })}
      </div>

      <button onClick={() => { logout(); nav('/login'); }} className="btn-secondary w-full">
        <LogOut size={18} /> Cerrar sesión
      </button>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}

function StatBox({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="card flex flex-col items-center gap-1 p-3">
      <div className={color}>{icon}</div>
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
