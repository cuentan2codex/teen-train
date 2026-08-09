import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { TrendingUp, Scale, Dumbbell, Clock, Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../store/auth';
import { workoutsRepo, weightsRepo } from '../../services/database';
import { calcStreak, countReps } from '../../services/gamification';
import { formatDateShort } from '../../utils/format';

export function ProgressPage() {
  const { profile, updateProfile } = useAuth();
  if (!profile) return null;

  const workouts = useMemo(() => workoutsRepo.list(profile.id), [profile.id]);
  const weights = useMemo(() => weightsRepo.list(profile.id), [profile.id]);

  // Datos de peso
  const weightData = useMemo(
    () => weights.slice(-30).map((w) => ({
      fecha: formatDateShort(w.fecha),
      peso: +w.peso_kg.toFixed(1),
    })),
    [weights],
  );

  // Entrenamientos por semana (últimas 8 semanas)
  const weeklyData = useMemo(() => {
    const weeks: { label: string; entrenamientos: number; reps: number; minutos: number }[] = [];
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
        entrenamientos: ws.length,
        reps: ws.reduce((a, w) => a + countReps(w), 0),
        minutos: Math.round(ws.reduce((a, w) => a + w.duracion_seg, 0) / 60),
      });
    }
    return weeks;
  }, [workouts]);

  // Repeticiones totales por entrenamiento (últimos 10)
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

  return (
    <AppShell>
      <PageHeader title="Progreso" subtitle="Tu evolución en números" icon={<TrendingUp size={20} />} />

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard icon={<Dumbbell size={20} />} value={`${totalWorkouts}`} label="Entrenamientos" color="text-brand-600 bg-brand-50 dark:bg-brand-900/30" />
        <StatCard icon={<Clock size={20} />} value={`${totalMinutes}m`} label="Tiempo total" color="text-purple-600 bg-purple-50 dark:bg-purple-900/30" />
        <StatCard icon={<TrendingUp size={20} />} value={`${streak}🔥`} label="Racha actual" color="text-orange-600 bg-orange-50 dark:bg-orange-900/30" />
        <StatCard icon={<Scale size={20} />} value={`${pesoDiff > 0 ? '+' : ''}${pesoDiff}kg`} label="Cambio peso" color="text-green-600 bg-green-50 dark:bg-green-900/30" />
      </div>

      {/* Gráfico de peso */}
      <div className="card mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Scale size={18} className="text-brand-600" /> Peso corporal
          </h2>
          <button onClick={addWeight} className="btn-secondary px-3 py-1.5 text-xs">
            <Plus size={14} /> Registrar
          </button>
        </div>
        {weightData.length < 2 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Registra tu peso al menos 2 veces para ver tu evolución.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`${v} kg`, 'Peso']}
              />
              <Line type="monotone" dataKey="peso" stroke="#1a78f5" strokeWidth={3} dot={{ r: 3, fill: '#1a78f5' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Entrenamientos por semana */}
      <div className="card mb-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold">
          <Dumbbell size={18} className="text-brand-600" /> Entrenamientos por semana
        </h2>
        {weeklyData.every((w) => w.entrenamientos === 0) ? (
          <p className="py-6 text-center text-sm text-slate-500">Aún no hay datos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 10, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`${v}`, 'Entrenamientos']}
              />
              <Bar dataKey="entrenamientos" fill="#1a78f5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Repeticiones por entrenamiento */}
      <div className="card mb-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold">
          <TrendingUp size={18} className="text-brand-600" /> Repeticiones (últimos 10)
        </h2>
        {repsData.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Aún no hay datos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={repsData} margin={{ top: 5, right: 10, bottom: 0, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`${v}`, 'Repeticiones']}
                labelFormatter={(_, p) => p?.[0]?.payload?.fecha ?? ''}
              />
              <Line type="monotone" dataKey="reps" stroke="#22c55e" strokeWidth={3} dot={{ r: 3, fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="card flex items-center gap-3 p-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-lg font-extrabold leading-none">{value}</p>
        <p className="text-[10px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}
