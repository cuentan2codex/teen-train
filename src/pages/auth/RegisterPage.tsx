import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Dumbbell, User } from 'lucide-react';
import { useAuth } from '../../store/auth';
import type { Goal, Sex } from '../../types';

export function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirm: '',
    edad: 14,
    sexo: 'no_especifica' as Sex,
    altura_cm: 165,
    peso_inicial_kg: 60,
    objetivo: 'salud_general' as Goal,
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        edad: form.edad,
        sexo: form.sexo,
        altura_cm: form.altura_cm,
        peso_inicial_kg: form.peso_inicial_kg,
        objetivo: form.objetivo,
      });
      nav('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-600 text-white">
          <Dumbbell size={28} />
        </div>
        <h1 className="text-2xl font-extrabold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">Empezá tu camino fitness hoy</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nombre de usuario</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required
              minLength={2}
              maxLength={30}
              className="input pl-10"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Correo electrónico</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              className="input pl-10"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={show ? 'text' : 'password'}
                required
                minLength={6}
                className="input pl-10 pr-10"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
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
          <div>
            <label className="label">Repetir</label>
            <input
              type={show ? 'text' : 'password'}
              required
              minLength={6}
              className="input"
              placeholder="••••••"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Edad</label>
            <input
              type="number"
              min={10}
              max={19}
              required
              className="input"
              value={form.edad}
              onChange={(e) => set('edad', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Altura (cm)</label>
            <input
              type="number"
              min={120}
              max={210}
              required
              className="input"
              value={form.altura_cm}
              onChange={(e) => set('altura_cm', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Peso (kg)</label>
            <input
              type="number"
              min={30}
              max={150}
              step={0.1}
              required
              className="input"
              value={form.peso_inicial_kg}
              onChange={(e) => set('peso_inicial_kg', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Sexo (opcional)</label>
            <select
              className="input"
              value={form.sexo}
              onChange={(e) => set('sexo', e.target.value as Sex)}
            >
              <option value="no_especifica">Prefiero no decir</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="label">Objetivo</label>
            <select
              className="input"
              value={form.objetivo}
              onChange={(e) => set('objetivo', e.target.value as Goal)}
            >
              <option value="salud_general">Salud general</option>
              <option value="fuerza">Fuerza</option>
              <option value="resistencia">Resistencia</option>
              <option value="acondicionamiento">Acondicionamiento</option>
              <option value="casa">Entrenar en casa</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
