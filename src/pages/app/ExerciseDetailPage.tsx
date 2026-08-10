import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Dumbbell, ListChecks, Timer } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { findExercise } from '../../data/seed';

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const ex = id ? findExercise(id) : undefined;

  if (!ex) {
    return (
      <AppShell showNav={false}>
        <div className="text-center text-white/50">Ejercicio no encontrado.</div>
      </AppShell>
    );
  }

  return (
    <AppShell showNav={false}>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="mb-3 flex items-center gap-2">
        <Badge variant="purple">{ex.nivel}</Badge>
        <Badge>{ex.tipo === 'repeticiones' ? 'Repeticiones' : 'Duración'}</Badge>
      </div>
      <h1 className="mb-1 text-2xl font-extrabold text-white">{ex.nombre}</h1>
      <p className="text-sm text-white/50">{ex.descripcion}</p>

      {/* Placeholder visual con icono y glow */}
      <GlassCard
        variant="purple"
        glow
        className="my-5 flex h-44 items-center justify-center"
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(155,92,255,0.3), rgba(255,61,141,0.3))',
            border: '1px solid rgba(155,92,255,0.4)',
          }}
        >
          <Dumbbell size={40} className="text-white" />
        </div>
      </GlassCard>

      <div className="mb-5">
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">Músculos principales</h2>
        <div className="flex flex-wrap gap-2">
          {ex.musculos.map((m) => (
            <Badge key={m} variant="success" glow>{m}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-white/40">
          <ListChecks size={16} /> Instrucciones
        </h2>
        <ol className="space-y-2">
          {ex.instrucciones.map((inst, i) => (
            <GlassCard key={i} className="flex gap-3 p-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #9B5CFF, #FF3D8D)',
                }}
              >
                {i + 1}
              </span>
              <span className="text-sm text-white/80">{inst}</span>
            </GlassCard>
          ))}
        </ol>
      </div>

      <div
        className="mt-5 flex items-center gap-2 rounded-2xl p-3 text-xs"
        style={{
          background: 'rgba(255,158,61,0.1)',
          border: '1px solid rgba(255,158,61,0.3)',
          color: '#FF9E3D',
        }}
      >
        <Timer size={16} />
        Calienta antes de empezar. Si sientes dolor, detente y descansa.
      </div>
    </AppShell>
  );
}
