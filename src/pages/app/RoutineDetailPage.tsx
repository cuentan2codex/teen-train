import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ListOrdered, ArrowLeft, Play, Target } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { findRoutine, findExercise } from '../../data/seed';

export function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const routine = id ? findRoutine(id) : undefined;

  if (!routine) {
    return (
      <AppShell showNav={false}>
        <div className="text-center text-white/50">Rutina no encontrada.</div>
      </AppShell>
    );
  }

  const levelColor =
    routine.nivel === 'principiante' ? 'success' :
    routine.nivel === 'intermedio' ? 'warning' : 'danger';

  return (
    <AppShell showNav={false}>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="mb-2 flex items-center gap-2">
        <Badge variant={levelColor as any}>{routine.nivel}</Badge>
        <Badge variant="purple">{routine.objetivo}</Badge>
      </div>
      <h1 className="text-2xl font-extrabold text-white">{routine.nombre}</h1>
      <p className="mt-1 text-sm text-white/50">{routine.descripcion}</p>

      {/* Stats grid */}
      <div className="my-4 grid grid-cols-3 gap-3">
        <InfoBox icon={<Clock size={18} />} value={`${routine.duracion_estimada_min}`} label="min" color="#00BFFF" />
        <InfoBox icon={<ListOrdered size={18} />} value={`${routine.ejercicios.length}`} label="ejercicios" color="#9B5CFF" />
        <InfoBox icon={<Target size={18} />} value={`${routine.ejercicios.reduce((a, e) => a + e.series, 0)}`} label="series" color="#FF3D8D" />
      </div>

      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">Ejercicios</h2>
      <div className="space-y-2">
        {routine.ejercicios
          .slice()
          .sort((a, b) => a.orden - b.orden)
          .map((re, idx) => {
            const ex = findExercise(re.exercise_id);
            if (!ex) return null;
            return (
              <GlassCard
                key={idx}
                interactive
                onClick={() => nav(`/ejercicio/${ex.id}`)}
                className={`flex items-center gap-3 p-3 stagger-${Math.min(idx + 1, 6)}`}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    background: 'rgba(155,92,255,0.12)',
                    color: '#9B5CFF',
                    border: '1px solid rgba(155,92,255,0.3)',
                  }}
                >
                  {re.orden}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{ex.nombre}</p>
                  <p className="text-xs text-white/50">
                    {re.series} series × {re.repeticiones ?? `${re.duracion_seg}s`}
                    <span className="ml-2">· descanso {re.descanso_seg}s</span>
                  </p>
                </div>
                <span className="text-lg text-white/30">›</span>
              </GlassCard>
            );
          })}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button
          onClick={() => nav(`/entrenar/sesion/${routine.id}`)}
          className="btn-primary w-full py-4 text-base shadow-glow-purple"
        >
          <Play size={22} /> Comenzar entrenamiento
        </button>
      </div>
    </AppShell>
  );
}

function InfoBox({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <GlassCard className="flex flex-col items-center gap-1 p-3">
      <div style={{ color }}>{icon}</div>
      <p className="text-lg font-extrabold leading-none text-white">{value}</p>
      <p className="text-[10px] text-white/50">{label}</p>
    </GlassCard>
  );
}
