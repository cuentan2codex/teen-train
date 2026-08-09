import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor, Bell, Scale as ScaleIcon, Lock, Trash2, User } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { useAuth, applyTheme } from '../../store/auth';
import { auth } from '../../services/database';
import type { Theme, Units, Profile } from '../../types';

export function SettingsPage() {
  const nav = useNavigate();
  const { profile, updateProfile, deleteAccount } = useAuth();
  const [showDelete, setShowDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  if (!profile) return null;

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (pwForm.new !== pwForm.confirm) {
      setPwError('Las contraseñas no coinciden.');
      return;
    }
    if (pwForm.new.length < 6) {
      setPwError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      await auth.changePassword(profile!.id, pwForm.old, pwForm.new);
      setPwSuccess(true);
      setPwForm({ old: '', new: '', confirm: '' });
      setTimeout(() => { setShowPassword(false); setPwSuccess(false); }, 1500);
    } catch (err) {
      setPwError((err as Error).message);
    }
  }

  function setTheme(theme: Theme) {
    updateProfile({ theme });
    applyTheme(theme);
  }

  return (
    <AppShell showNav={false}>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <PageHeader title="Configuración" icon={<User size={20} />} />

      {/* Cuenta */}
      <Section title="Cuenta">
        <Row label="Nombre">
          <input
            className="input h-9 w-40 text-right"
            value={profile.nombre}
            onChange={(e) => updateProfile({ nombre: e.target.value })}
          />
        </Row>
        <button
          onClick={() => setShowPassword(true)}
          className="flex w-full items-center justify-between py-3 text-left"
        >
          <span className="flex items-center gap-2">
            <Lock size={18} className="text-slate-400" /> Cambiar contraseña
          </span>
        </button>
      </Section>

      {/* Apariencia */}
      <Section title="Apariencia">
        <div className="py-2">
          <p className="mb-2 flex items-center gap-2 text-sm">
            <Moon size={16} className="text-slate-400" /> Tema
          </p>
          <div className="flex gap-2">
            <ThemeBtn active={profile.theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={16} />} label="Claro" />
            <ThemeBtn active={profile.theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={16} />} label="Oscuro" />
            <ThemeBtn active={profile.theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={16} />} label="Sistema" />
          </div>
        </div>
      </Section>

      {/* Entrenamiento */}
      <Section title="Entrenamiento">
        <Row label={<span className="flex items-center gap-2"><ScaleIcon size={16} className="text-slate-400" /> Unidades de peso</span>}>
          <div className="flex gap-2">
            <button
              onClick={() => updateProfile({ units: 'kg' as Units })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.units === 'kg' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
            >kg</button>
            <button
              onClick={() => updateProfile({ units: 'lb' as Units })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.units === 'lb' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
            >lb</button>
          </div>
        </Row>
        <Row label={<span className="flex items-center gap-2"><Bell size={16} className="text-slate-400" /> Notificaciones</span>}>
          <Toggle
            checked={profile.notifications_enabled}
            onChange={(v) => updateProfile({ notifications_enabled: v })}
          />
        </Row>
      </Section>

      {/* Zona peligrosa */}
      <Section title="Zona de peligro">
        <button
          onClick={() => setShowDelete(true)}
          className="flex w-full items-center gap-2 py-3 text-left text-red-600 dark:text-red-400"
        >
          <Trash2 size={18} /> Eliminar cuenta
        </button>
      </Section>

      {/* Aviso de privacidad */}
      <div className="card mt-4 bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/50">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Privacidad</p>
        <p className="mt-1">
          Tus datos se guardan únicamente en este dispositivo. No se envían a servidores externos.
          Esta aplicación no sustituye el consejo de un entrenador, médico o profesional de la salud.
        </p>
      </div>

      {/* Modal contraseña */}
      <Modal open={showPassword} onClose={() => setShowPassword(false)} title="Cambiar contraseña">
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            placeholder="Contraseña actual"
            className="input"
            value={pwForm.old}
            onChange={(e) => setPwForm({ ...pwForm, old: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="input"
            value={pwForm.new}
            onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Repetir nueva contraseña"
            className="input"
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            required
            minLength={6}
          />
          {pwError && <p className="text-sm font-medium text-red-600">{pwError}</p>}
          {pwSuccess && <p className="text-sm font-medium text-green-600">Contraseña actualizada ✓</p>}
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </Modal>

      {/* Modal eliminar cuenta */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="¿Eliminar cuenta?">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Esta acción <strong>eliminará permanentemente</strong> tu cuenta, entrenamientos, pesos y logros.
            No podrás recuperar estos datos.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              onClick={() => { deleteAccount(); nav('/login'); }}
              className="btn-danger flex-1"
            >
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card mb-3">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function ThemeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-semibold transition ${
        active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

// re-export for compatibility
export type { Profile };
