import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './store/auth';
import { AppBackground } from './components/layout/AppBackground';
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

/**
 * Wraps each page route with a soft liquid page transition.
 * Pages enter with a subtle scale+fade from below, connected
 * to the nav indicator's movement.
 */
function PageTransition({ children }: { children: JSX.Element }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.998 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 28,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Public><PageTransition><LoginPage /></PageTransition></Public>} />
        <Route path="/registro" element={<Public><PageTransition><RegisterPage /></PageTransition></Public>} />
        <Route path="/recuperar" element={<Public><PageTransition><RecoverPage /></PageTransition></Public>} />

        <Route path="/" element={<Protected><PageTransition><DashboardPage /></PageTransition></Protected>} />
        <Route path="/entrenar" element={<Protected><PageTransition><RoutinesPage /></PageTransition></Protected>} />
        <Route path="/rutina/:id" element={<Protected><PageTransition><RoutineDetailPage /></PageTransition></Protected>} />
        <Route path="/ejercicios" element={<Protected><PageTransition><CatalogPage /></PageTransition></Protected>} />
        <Route path="/ejercicio/:id" element={<Protected><PageTransition><ExerciseDetailPage /></PageTransition></Protected>} />
        <Route path="/entrenar/sesion/:id" element={<Protected><PageTransition><WorkoutSessionPage /></PageTransition></Protected>} />
        <Route path="/historial" element={<Protected><PageTransition><HistoryPage /></PageTransition></Protected>} />
        <Route path="/historial/:id" element={<Protected><PageTransition><WorkoutDetailPage /></PageTransition></Protected>} />
        <Route path="/progreso" element={<Protected><PageTransition><ProgressPage /></PageTransition></Protected>} />
        <Route path="/perfil" element={<Protected><PageTransition><ProfilePage /></PageTransition></Protected>} />
        <Route path="/configuracion" element={<Protected><PageTransition><SettingsPage /></PageTransition></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
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
      <AppBackground />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
