import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Dumbbell } from 'lucide-react';
import { useAuth } from '../../store/auth';

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
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-lg">
          <Dumbbell size={32} />
        </div>
        <h1 className="text-2xl font-extrabold">TeenTrain</h1>
        <p className="mt-1 text-sm text-slate-500">Entrenamiento para adolescentes</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Correo</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input pl-10"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={6}
              className="input pl-10 pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Ocultar' : 'Mostrar'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        <Link to="/recuperar" className="font-semibold text-brand-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <div className="mt-2 text-center text-sm text-slate-500">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-brand-600 hover:underline">
          Regístrate
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Para adolescentes (10–19 años). Consulta a un adulto antes de empezar un plan de entrenamiento.
      </p>
    </div>
  );
}
