import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Chip } from '../../components/ui/Chip';
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
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          className="input-glass pl-11"
          placeholder="Buscar ejercicio o músculo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {(['todos', 'principiante', 'intermedio', 'avanzado'] as const).map((n) => (
          <Chip
            key={n}
            active={nivel === n}
            onClick={() => setNivel(n)}
            color="purple"
          >
            {n === 'todos' ? 'Todos' : n.charAt(0).toUpperCase() + n.slice(1)}
          </Chip>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((ex, idx) => (
          <GlassCard
            key={ex.id}
            interactive
            onClick={() => nav(`/ejercicio/${ex.id}`)}
            className={`flex items-center justify-between p-3 stagger-${Math.min(idx + 1, 6)}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(155,92,255,0.15), rgba(0,191,255,0.15))',
                  border: '1px solid rgba(155,92,255,0.25)',
                }}
              >
                🏋️
              </div>
              <div>
                <p className="font-semibold text-white">{ex.nombre}</p>
                <p className="text-xs text-white/50">{ex.musculos.join(' · ')}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/30" />
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <GlassCard className="p-6 text-center text-sm text-white/50">
            No se encontraron ejercicios.
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}
