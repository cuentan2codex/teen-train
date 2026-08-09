import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Dumbbell, ListChecks, Timer } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { findExercise } from '../../data/seed';

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const ex = id ? findExercise(id) : undefined;

  if (!ex) {
    return (
      <AppShell showNav={false}>
        <div className="text-center text-slate-500">Ejercicio no encontrado.</div>
      </AppShell>
    );
  }

  return (
    <AppShell showNav={false}>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="mb-3 flex items-center gap-2">
        <Badge variant="info">{capitalize(ex.nivel)}</Badge>
        <Badge>{ex.tipo === 'repeticiones' ? 'Repeticiones' : 'Duración'}</Badge>
      </div>
      <h1 className="mb-1 text-2xl font-extrabold">{ex.nombre}</h1>
      <p className="text-sm text-slate-500">{ex.descripcion}</p>

      {/* Placeholder visual: emoji grande + músculos */}
      <div className="my-5 flex h-40 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/40 dark:to-brand-900/20">
        <Dumbbell size={72} className="text-brand-500" />
      </div>

      <div className="mb-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Músculos principales</h2>
        <div className="flex flex-wrap gap-2">
          {ex.musculos.map((m) => (
            <Badge key={m} variant="success">{m}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <ListChecks size={16} /> Instrucciones
        </h2>
        <ol className="space-y-2">
          {ex.instrucciones.map((inst, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm">{inst}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <Timer size={16} />
        Calienta antes de empezar. Si sientes dolor, detente y descansa.
      </div>
    </AppShell>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
