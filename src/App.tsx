import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { RecoverPage } from './pages/auth/RecoverPage';
import { DashboardPage } from './pages/app/DashboardPage';
import { RoutinesPage } from './pages/app/RoutinesPage';
import { RoutineDetailPage } from './pages/app/RoutineDetailPage';
import { CatalogPage } from './pages/app/CatalogPage';
import { ExerciseDetailPage } from './pages/app/ExerciseDetailPage';
import { WorkoutSessionPage } from './pages/app/WorkoutSessionPage';
import { HistoryPage } from './pages/app/HistoryPage';
import { WorkoutDetailPage } from './pages/app/WorkoutDetailPage';
import { ProgressPage } from './pages/app/ProgressPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';
import type { JSX } from 'react';

function Protected({ children }: { children: JSX.Element }) {
  const { profile, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Cargando…</div>;
  if (!profile) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

function Public({ children }: { children: JSX.Element }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Cargando…</div>;
  if (profile) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { init } = useAuth();
  useEffect(() => {
    init();
    // Escuchar cambios de tema del sistema
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const { profile } = useAuth.getState();
      if (profile?.theme === 'system') {
        document.documentElement.classList.toggle('dark', mq.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [init]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route path="/login" element={<Public><LoginPage /></Public>} />
        <Route path="/registro" element={<Public><RegisterPage /></Public>} />
        <Route path="/recuperar" element={<Public><RecoverPage /></Public>} />

        <Route path="/" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/entrenar" element={<Protected><RoutinesPage /></Protected>} />
        <Route path="/rutina/:id" element={<Protected><RoutineDetailPage /></Protected>} />
        <Route path="/ejercicios" element={<Protected><CatalogPage /></Protected>} />
        <Route path="/ejercicio/:id" element={<Protected><ExerciseDetailPage /></Protected>} />
        <Route path="/entrenar/sesion/:id" element={<Protected><WorkoutSessionPage /></Protected>} />
        <Route path="/historial" element={<Protected><HistoryPage /></Protected>} />
        <Route path="/historial/:id" element={<Protected><WorkoutDetailPage /></Protected>} />
        <Route path="/progreso" element={<Protected><ProgressPage /></Protected>} />
        <Route path="/perfil" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/configuracion" element={<Protected><SettingsPage /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
