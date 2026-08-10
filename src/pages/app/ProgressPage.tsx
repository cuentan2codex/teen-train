import { useMemo, useState } from 'react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Area, AreaChart,
} from 'recharts';
import { TrendingUp, Scale, Dumbbell, Clock, Plus, Activity } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Chip } from '../../components/ui/Chip';
import { useAuth } from '../../store/auth';
import { workoutsRepo, weightsRepo } from '../../services/database';
import { calcStreak, countReps } from '../../services/gamification';
import { formatDateShort } from '../../utils/format';

type Tab = 'peso' | 'reps' | 'sesiones' | 'tiempo';

export function ProgressPage() {
  const { profile, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>('peso');
  if (!profile) return null;

  const workouts = useMemo(() => workoutsRepo.list(profile.id), [profile.id]);
  const weights = useMemo(() => weightsRepo.list(profile.id), [profile.id]);

  const weightData = useMemo(
    () => weights.slice(-30).map((w) => ({
      fecha: formatDateShort(w.fecha),
      peso: +w.peso_kg.toFixed(1),
    })),
    [weights],
  );

  const weeklyData = useMemo(() => {
    const weeks: { label: string; sesiones: number; reps: number; minutos: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      const ws = workouts.filter((w) => {
        const d = new Date(w.fecha_inicio);
        return d >= start && d < end && w.estado === 'completado';
      });
      weeks.push({
        label: formatDateShort(start.toISOString()),
        sesiones: ws.length,
        reps: ws.reduce((a, w) => a + countReps(w), 0),
        minutos: Math.round(ws.reduce((a, w) => a + w.duracion_seg, 0) / 60),
      });
    }
    return weeks;
  }, [workouts]);

  const repsData = useMemo(
    () =>
      workouts
        .filter((w) => w.estado === 'completado')
        .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
        .slice(-10)
        .map((w, idx) => ({
          label: `#${idx + 1}`,
          reps: countReps(w),
          fecha: formatDateShort(w.fecha_inicio),
        })),
    [workouts],
  );

  const totalWorkouts = workouts.filter((w) => w.estado === 'completado').length;
  const totalMinutes = Math.round(workouts.reduce((a, w) => a + w.duracion_seg, 0) / 60);
  const streak = calcStreak(workouts);
  const pesoDiff = weights.length >= 2 ? +(weights[weights.length - 1].peso_kg - weights[0].peso_kg).toFixed(1) : 0;

  const addWeight = () => {
    const input = prompt('Nuevo peso (kg):', profile.peso_actual_kg.toString());
    if (input == null) return;
    const v = parseFloat(input);
    if (isNaN(v) || v < 30 || v > 200) {
      alert('Peso inválido. Debe estar entre 30 y 200 kg.');
      return;
    }
    weightsRepo.add(profile.id, v);
    updateProfile({ peso_actual_kg: v });
  };

  const tooltipStyle = {
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(15,15,24,0.85)',
    backdropFilter: 'blur(20px)',
    fontSize: 12,
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  return (
    <AppShell>
      <PageHeader title="Progreso" subtitle="Tu evolución en números" icon={<TrendingUp size={20} />} />

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard icon={<Dumbbell size={18} />} value={`${totalWorkouts}`} label="Entrenamientos" color="#9B5CFF" delay={1} />
        <StatCard icon={<Clock size={18} />} value={`${totalMinutes}m`} label="Tiempo total" color="#00BFFF" delay={2} />
        <StatCard icon={<Activity size={18} />} value={`${streak}🔥`} label="Racha actual" color="#FF9E3D" delay={3} />
        <StatCard icon={<Scale size={18} />} value={`${pesoDiff > 0 ? '+' : ''}${pesoDiff}kg`} label="Cambio peso" color="#00FF85" delay={4} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        <Chip active={tab === 'peso'} onClick={() => setTab('peso')} color="blue">Peso</Chip>
        <Chip active={tab === 'reps'} onClick={() => setTab('reps')} color="green">Reps</Chip>
        <Chip active={tab === 'sesiones'} onClick={() => setTab('sesiones')} color="purple">Sesiones</Chip>
        <Chip active={tab === 'tiempo'} onClick={() => setTab('tiempo')} color="orange">Tiempo</Chip>
      </div>

      {/* Gráfico de peso */}
      {tab === 'peso' && (
        <GlassCard variant="strong" glow className="p-5 animate-slide-up">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-white">
              <Scale size={18} className="text-neon-blue" /> Peso corporal
            </h2>
            <button onClick={addWeight} className="btn-glass px-3 py-1.5 text-xs">
              <Plus size={14} /> Registrar
            </button>
          </div>
          {weightData.length < 2 ? (
            <p className="py-8 text-center text-sm text-white/40">
              Registra tu peso al menos 2 veces para ver tu evolución.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weightData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00BFFF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00BFFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, 'Peso']} />
                <Area type="monotone" dataKey="peso" stroke="#00BFFF" strokeWidth={3} fill="url(#pesoGrad)" dot={{ r: 4, fill: '#00BFFF', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      )}

      {/* Gráfico de repeticiones */}
      {tab === 'reps' && (
        <GlassCard variant="green" glow className="p-5 animate-slide-up">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
            <Activity size={18} className="text-neon-green" /> Repeticiones (últimos 10)
          </h2>
          {repsData.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">Aún no hay datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={repsData} margin={{ top: 5, right: 10, bottom: 0, left: -25 }}>
                <defs>
                  <linearGradient id="repsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF85" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00FF85" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}`, 'Repeticiones']} labelFormatter={(_, p) => p?.[0]?.payload?.fecha ?? ''} />
                <Area type="monotone" dataKey="reps" stroke="#00FF85" strokeWidth={3} fill="url(#repsGrad)" dot={{ r: 4, fill: '#00FF85', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      )}

      {/* Gráfico de sesiones por semana */}
      {tab === 'sesiones' && (
        <GlassCard variant="purple" glow className="p-5 animate-slide-up">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
            <Dumbbell size={18} className="text-neon-purple" /> Sesiones por semana
          </h2>
          {weeklyData.every((w) => w.sesiones === 0) ? (
            <p className="py-8 text-center text-sm text-white/40">Aún no hay datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, bottom: 0, left: -25 }}>
                <defs>
                  <linearGradient id="sesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9B5CFF" />
                    <stop offset="100%" stopColor="#FF3D8D" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}`, 'Sesiones']} cursor={{ fill: 'rgba(155,92,255,0.1)' }} />
                <Bar dataKey="sesiones" fill="url(#sesGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      )}

      {/* Gráfico de tiempo */}
      {tab === 'tiempo' && (
        <GlassCard variant="pink" glow className="p-5 animate-slide-up">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
            <Clock size={18} className="text-neon-pink" /> Minutos por semana
          </h2>
          {weeklyData.every((w) => w.minutos === 0) ? (
            <p className="py-8 text-center text-sm text-white/40">Aún no hay datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, bottom: 0, left: -25 }}>
                <defs>
                  <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF3D8D" />
                    <stop offset="100%" stopColor="#FF9E3D" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} min`, 'Tiempo']} cursor={{ fill: 'rgba(255,61,141,0.1)' }} />
                <Bar dataKey="minutos" fill="url(#timeGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      )}
    </AppShell>
  );
}

function StatCard({ icon, value, label, color, delay }: { icon: React.ReactNode; value: string; label: string; color: string; delay: number }) {
  return (
    <GlassCard className={`flex items-center gap-3 p-4 stagger-${delay}`}>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: `${color}1f`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-lg font-extrabold leading-none text-white">{value}</p>
        <p className="text-[10px] text-white/50">{label}</p>
      </div>
    </GlassCard>
  );
}
