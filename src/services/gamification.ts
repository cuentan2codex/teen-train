import type { Workout, Profile, Achievement } from '../types';
import { SEED_ACHIEVEMENTS } from '../data/seed';
import { achievementsRepo } from './database';

// XP por entrenamiento: 100 base + bonus por series completadas
export function calcWorkoutXP(workout: Workout): number {
  let base = 100;
  const setsCompletados = workout.ejercicios.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completado).length,
    0,
  );
  base += setsCompletados * 5;
  return base;
}

// Rachas: cuenta días consecutivos con al menos un entrenamiento completado.
// La cuenta "rompe" si pasa un día sin entrenar (respecto al último día).
export function calcStreak(workouts: Workout[]): number {
  const completed = workouts.filter((w) => w.estado === 'completado' && w.fecha_fin);
  if (completed.length === 0) return 0;
  const days = new Set<string>();
  for (const w of completed) {
    const d = new Date(w.fecha_fin!);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  // Ordenar días descendente
  const sortedDays = Array.from(days).map((s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m, d).getTime();
  }).sort((a, b) => b - a);

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // Si hoy no entrenó pero ayer sí, la racha sigue contando hasta ayer.
  if (!sortedDays.includes(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!sortedDays.includes(cursor.getTime())) return 0;
  }
  for (const t of sortedDays) {
    if (t === cursor.getTime()) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (t < cursor.getTime()) {
      break;
    }
  }
  return streak;
}

export function calcTotalReps(workouts: Workout[]): number {
  return workouts.reduce((acc, w) => acc + countReps(w), 0);
}

export function countReps(w: Workout): number {
  return w.ejercicios.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completado).reduce((a, s) => a + s.repeticiones, 0),
    0,
  );
}

export function countSets(w: Workout): number {
  return w.ejercicios.reduce((acc, e) => acc + e.sets.filter((s) => s.completado).length, 0);
}

// Entrenamientos esta semana (lunes a domingo)
export function workoutsThisWeek(workouts: Workout[]): Workout[] {
  const now = new Date();
  const day = now.getDay(); // 0=domingo
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return workouts.filter((w) => {
    const d = new Date(w.fecha_inicio);
    return d >= monday && d < nextMonday && w.estado === 'completado';
  });
}

export function levelFromXP(xp: number): { nivel: number; proximo: number; progreso: number } {
  // Cada nivel requiere más XP: 0, 300, 700, 1200, 1800, 2500...
  // formula: nivel n requiere n*(n+1)*150 XP acumulado
  let nivel = 1;
  let acumulado = 0;
  while (true) {
    const requerido = nivel * (nivel + 1) * 150;
    if (xp < acumulado + requerido) {
      const progreso = (xp - acumulado) / requerido;
      return { nivel, proximo: acumulado + requerido, progreso };
    }
    acumulado += requerido;
    nivel++;
    if (nivel > 100) break;
  }
  return { nivel: 100, proximo: xp, progreso: 1 };
}

export function checkAchievements(userId: string, profile: Profile, workouts: Workout[]): string[] {
  const unlocked: string[] = [];
  const streak = calcStreak(workouts);
  const totalReps = calcTotalReps(workouts);
  const totalWorkouts = workouts.filter((w) => w.estado === 'completado').length;
  const totalXP = profile.xp;
  const stats = {
    entrenamientos_total: totalWorkouts,
    racha_dias: streak,
    repeticiones_total: totalReps,
    xp_total: totalXP,
  };
  for (const ach of SEED_ACHIEVEMENTS as Achievement[]) {
    const v = stats[ach.condicion.tipo];
    if (v >= ach.condicion.valor) {
      const wasUnlocked = achievementsRepo.unlock(userId, ach.id);
      if (wasUnlocked) unlocked.push(ach.id);
    }
  }
  return unlocked;
}
