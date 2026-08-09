// Tipos centrales del dominio. Mantener aquí para reutilizar en toda la app.

export type Sex = 'masculino' | 'femenino' | 'otro' | 'no_especifica';
export type Goal =
  | 'fuerza'
  | 'resistencia'
  | 'acondicionamiento'
  | 'casa'
  | 'salud_general';
export type Level = 'principiante' | 'intermedio' | 'avanzado';
export type Units = 'kg' | 'lb';
export type Theme = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  nombre: string;
  email: string;
  // Nota: la contraseña NO se guarda en Profile. Se gestiona aparte con hash.
  edad: number;
  sexo: Sex;
  altura_cm: number;
  peso_inicial_kg: number;
  peso_actual_kg: number;
  objetivo: Goal;
  nivel: Level;
  xp: number;
  units: Units;
  theme: Theme;
  notifications_enabled: boolean;
  created_at: string; // ISO
}

// Ejercicio base del catálogo
export interface Exercise {
  id: string;
  nombre: string;
  descripcion: string;
  instrucciones: string[];
  musculos: string[];
  nivel: Level;
  tipo: 'repeticiones' | 'duracion';
  imagen?: string; // URL o data-uri opcional
}

export interface RoutineExercise {
  exercise_id: string;
  orden: number;
  series: number;
  repeticiones?: number;
  duracion_seg?: number;
  descanso_seg: number;
}

export interface Routine {
  id: string;
  nombre: string;
  objetivo: Goal;
  nivel: Level;
  duracion_estimada_min: number;
  descripcion: string;
  ejercicios: RoutineExercise[];
}

// Sesion de entrenamiento en curso / finalizada
export type WorkoutState = 'en_curso' | 'completado' | 'cancelado';

export interface SetLog {
  numero: number;
  repeticiones: number;
  peso_kg: number;
  duracion_seg?: number;
  completado: boolean;
}

export interface WorkoutExerciseLog {
  exercise_id: string;
  orden: number;
  sets: SetLog[];
}

export interface Workout {
  id: string;
  user_id: string;
  routine_id: string;
  routine_name: string;
  fecha_inicio: string; // ISO
  fecha_fin?: string; // ISO
  duracion_seg: number;
  estado: WorkoutState;
  xp_ganado: number;
  ejercicios: WorkoutExerciseLog[];
}

export interface WeightEntry {
  id: string;
  user_id: string;
  fecha: string; // ISO
  peso_kg: number;
}

export type GoalType = 'entrenamientos_semana' | 'entrenamientos_total' | 'mejorar_repeticiones';

export interface UserGoal {
  id: string;
  user_id: string;
  tipo: GoalType;
  objetivo_valor: number;
  fecha_inicio: string;
  fecha_objetivo?: string;
  estado: 'activa' | 'completada' | 'cancelada';
}

export interface Achievement {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string; // emoji
  condicion: {
    tipo: 'entrenamientos_total' | 'racha_dias' | 'repeticiones_total' | 'xp_total';
    valor: number;
  };
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  fecha: string;
}
