import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Dumbbell, ArrowRight } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { GlassCard } from '../../components/ui/GlassCard';

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-8">
      {/* Logo + título */}
      <div className="mb-8 text-center animate-pop">
        <div
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-white animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #9B5CFF, #FF3D8D)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <Dumbbell size={36} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Teen<span className="text-gradient-purple">Train</span>
        </h1>
        <p className="mt-1.5 text-sm text-white/50">Entrenamiento para adolescentes</p>
      </div>

      <GlassCard variant="strong" glow className="p-6 animate-slide-up">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-glass" htmlFor="email">Correo</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input-glass pl-11"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label-glass" htmlFor="password">Contraseña</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={6}
                className="input-glass pl-11 pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? 'Ocultar' : 'Mostrar'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="rounded-2xl px-4 py-3 text-sm font-medium text-neon-pink"
              style={{
                background: 'rgba(255,61,141,0.1)',
                border: '1px solid rgba(255,61,141,0.3)',
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-4 text-base" disabled={loading}>
            {loading ? 'Ingresando…' : <>Iniciar sesión <ArrowRight size={20} /></>}
          </button>
        </form>
      </GlassCard>

      <div className="mt-6 space-y-2 text-center text-sm">
        <Link to="/recuperar" className="font-semibold text-neon-purple hover:text-neon-pink transition">
          ¿Olvidaste tu contraseña?
        </Link>
        <div className="text-white/50">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-neon-purple hover:text-neon-pink transition">
            Regístrate
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-white/30">
        Para adolescentes (10–19 años). Consulta a un adulto antes de empezar.
      </p>
    </div>
  );
}
