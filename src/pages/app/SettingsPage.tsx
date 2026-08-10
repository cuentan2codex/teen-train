import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor, Bell, Scale as ScaleIcon, Lock, Trash2, User } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../store/auth';
import { auth } from '../../services/database';
import type { Theme, Units } from '../../types';

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

  // La app es dark-first: el theme sólo controla preferencia futura.
  function setTheme(theme: Theme) {
    updateProfile({ theme });
  }

  return (
    <AppShell showNav={false}>
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <PageHeader title="Configuración" icon={<User size={20} />} />

      {/* Cuenta */}
      <Section title="Cuenta">
        <Row label="Nombre">
          <input
            className="input-glass h-9 w-40 text-right"
            value={profile.nombre}
            onChange={(e) => updateProfile({ nombre: e.target.value })}
          />
        </Row>
        <button
          onClick={() => setShowPassword(true)}
          className="flex w-full items-center justify-between py-3 text-left"
        >
          <span className="flex items-center gap-2 text-white/80">
            <Lock size={18} className="text-white/40" /> Cambiar contraseña
          </span>
        </button>
      </Section>

      {/* Apariencia */}
      <Section title="Apariencia">
        <div className="py-2">
          <p className="mb-2 flex items-center gap-2 text-sm text-white/80">
            <Moon size={16} className="text-white/40" /> Tema
          </p>
          <div className="flex gap-2">
            <ThemeBtn active={profile.theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={16} />} label="Claro" />
            <ThemeBtn active={profile.theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={16} />} label="Oscuro" />
            <ThemeBtn active={profile.theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={16} />} label="Sistema" />
          </div>
          <p className="mt-2 text-xs text-white/40">
            La app está optimizada para modo oscuro (AMOLED). El tema claro se aplicará en futuras versiones.
          </p>
        </div>
      </Section>

      {/* Entrenamiento */}
      <Section title="Entrenamiento">
        <Row label={<span className="flex items-center gap-2"><ScaleIcon size={16} className="text-white/40" /> Unidades de peso</span>}>
          <div className="flex gap-2">
            <button
              onClick={() => updateProfile({ units: 'kg' as Units })}
              className="rounded-full px-3 py-1 text-xs font-semibold transition"
              style={{
                background: profile.units === 'kg' ? 'rgba(155,92,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: profile.units === 'kg' ? '#9B5CFF' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${profile.units === 'kg' ? 'rgba(155,92,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >kg</button>
            <button
              onClick={() => updateProfile({ units: 'lb' as Units })}
              className="rounded-full px-3 py-1 text-xs font-semibold transition"
              style={{
                background: profile.units === 'lb' ? 'rgba(155,92,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: profile.units === 'lb' ? '#9B5CFF' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${profile.units === 'lb' ? 'rgba(155,92,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >lb</button>
          </div>
        </Row>
        <Row label={<span className="flex items-center gap-2"><Bell size={16} className="text-white/40" /> Notificaciones</span>}>
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
          className="flex w-full items-center gap-2 py-3 text-left text-neon-pink"
        >
          <Trash2 size={18} /> Eliminar cuenta
        </button>
      </Section>

      {/* Aviso de privacidad */}
      <GlassCard className="mt-4 p-4">
        <p className="font-semibold text-white/80">Privacidad</p>
        <p className="mt-1 text-xs text-white/50">
          Tus datos se guardan únicamente en este dispositivo. No se envían a servidores externos.
          Esta aplicación no sustituye el consejo de un entrenador, médico o profesional de la salud.
        </p>
      </GlassCard>

      {/* Modal contraseña */}
      <Modal open={showPassword} onClose={() => setShowPassword(false)} title="Cambiar contraseña">
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            placeholder="Contraseña actual"
            className="input-glass"
            value={pwForm.old}
            onChange={(e) => setPwForm({ ...pwForm, old: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="input-glass"
            value={pwForm.new}
            onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Repetir nueva contraseña"
            className="input-glass"
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            required
            minLength={6}
          />
          {pwError && (
            <p className="text-sm font-medium text-neon-pink">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="text-sm font-medium text-neon-green">Contraseña actualizada ✓</p>
          )}
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </Modal>

      {/* Modal eliminar cuenta */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="¿Eliminar cuenta?">
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Esta acción <strong className="text-neon-pink">eliminará permanentemente</strong> tu cuenta, entrenamientos, pesos y logros.
            No podrás recuperar estos datos.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowDelete(false)} className="btn-glass flex-1">
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
    <GlassCard className="mb-3 p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-white/40">{title}</h3>
      <div className="divide-y divide-white/5">{children}</div>
    </GlassCard>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-white/80">{label}</span>
      {children}
    </div>
  );
}

function ThemeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-semibold transition active:scale-95"
      style={{
        background: active ? 'rgba(155,92,255,0.2)' : 'rgba(255,255,255,0.05)',
        color: active ? '#9B5CFF' : 'rgba(255,255,255,0.6)',
        border: `1px solid ${active ? 'rgba(155,92,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: active ? '0 0 12px rgba(155,92,255,0.3)' : 'none',
      }}
    >
      {icon} {label}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition"
      style={{
        background: checked ? 'linear-gradient(135deg, #9B5CFF, #FF3D8D)' : 'rgba(255,255,255,0.15)',
        boxShadow: checked ? '0 0 12px rgba(155,92,255,0.4)' : 'none',
      }}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}
