import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { auth } from '../../services/database';

export function RecoverPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.resetPassword(email, newPass);
      setDone(true);
      setTimeout(() => nav('/login'), 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-5 py-10 text-center">
        <div className="mb-3 text-5xl">✅</div>
        <h1 className="text-xl font-bold">Contraseña restablecida</h1>
        <p className="mt-2 text-sm text-slate-500">Iniciando sesión…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <h1 className="mb-2 text-2xl font-extrabold">Recuperar contraseña</h1>
      <p className="mb-6 text-sm text-slate-500">
        Ingresa tu correo y una nueva contraseña. Los datos se restablecerán en este dispositivo.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Correo</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              className="input pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label">Nueva contraseña</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              className="input pl-10"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
        </div>
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Restableciendo…' : 'Restablecer'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
