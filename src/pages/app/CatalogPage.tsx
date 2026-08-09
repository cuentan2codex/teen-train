import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { SEED_EXERCISES } from '../../data/seed';
import type { Level } from '../../types';

export function CatalogPage() {
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [nivel, setNivel] = useState<Level | 'todos'>('todos');

  const filtered = SEED_EXERCISES.filter(
    (e) =>
      (nivel === 'todos' || e.nivel === nivel) &&
      (query.trim() === '' ||
        e.nombre.toLowerCase().includes(query.toLowerCase()) ||
        e.musculos.some((m) => m.toLowerCase().includes(query.toLowerCase()))),
  );

  return (
    <AppShell>
      <PageHeader title="Ejercicios" subtitle="Catálogo completo" icon={<Search size={20} />} />

      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Buscar ejercicio o músculo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mb-4 flex gap-2">
        {(['todos', 'principiante', 'intermedio', 'avanzado'] as const).map((n) => (
          <button
            key={n}
            onClick={() => setNivel(n)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
              nivel === n
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() => nav(`/ejercicio/${ex.id}`)}
            className="card flex w-full items-center justify-between text-left active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                🏋️
              </div>
              <div>
                <p className="font-semibold">{ex.nombre}</p>
                <p className="text-xs text-slate-500">{ex.musculos.join(' · ')}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center text-sm text-slate-500">
            No se encontraron ejercicios.
          </div>
        )}
      </div>
    </AppShell>
  );
}
