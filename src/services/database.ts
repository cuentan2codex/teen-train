import type {
  Profile,
  Workout,
  WeightEntry,
  UserGoal,
  UserAchievement,
} from '../types';
import { db } from './storage';

// Usuario interno con credenciales. La contraseña se guarda hasheada.
interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
}

function getUsers(): UserRecord[] {
  return db.read<UserRecord[]>(db.keys.users, []);
}
function setUsers(u: UserRecord[]) {
  db.write(db.keys.users, u);
}

function getProfiles(): Profile[] {
  return db.read<Profile[]>(db.keys.profiles, []);
}
function setProfiles(p: Profile[]) {
  db.write(db.keys.profiles, p);
}

export const auth = {
  async register(input: {
    nombre: string;
    email: string;
    password: string;
    edad: number;
    sexo: Profile['sexo'];
    altura_cm: number;
    peso_inicial_kg: number;
    objetivo: Profile['objetivo'];
  }): Promise<Profile> {
    const email = input.email.trim().toLowerCase();
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }
    if (input.edad < 10 || input.edad > 19) {
      // Aplicación dirigida a adolescentes (10-19 años).
      throw new Error('Esta app está pensada para adolescentes (10-19 años).');
    }
    const salt = db.genSalt();
    const password_hash = await db.hashPassword(input.password, salt);
    const id = db.genId();
    const created_at = new Date().toISOString();
    const newUser: UserRecord = { id, email, password_hash, salt, created_at };
    users.push(newUser);
    setUsers(users);

    const profile: Profile = {
      id,
      nombre: input.nombre.trim(),
      email,
      edad: input.edad,
      sexo: input.sexo,
      altura_cm: input.altura_cm,
      peso_inicial_kg: input.peso_inicial_kg,
      peso_actual_kg: input.peso_inicial_kg,
      objetivo: input.objetivo,
      nivel: 'principiante',
      xp: 0,
      units: 'kg',
      theme: 'system',
      notifications_enabled: true,
      created_at,
    };
    const profiles = getProfiles();
    profiles.push(profile);
    setProfiles(profiles);

    // Crear primer registro de peso
    db.write<WeightEntry[]>(db.keys.weights(id), [
      { id: db.genId(), user_id: id, fecha: created_at, peso_kg: input.peso_inicial_kg },
    ]);

    // Crear objetivo semanal por defecto (3 entrenamientos/semana)
    db.write<UserGoal[]>(db.keys.goals(id), [
      {
        id: db.genId(),
        user_id: id,
        tipo: 'entrenamientos_semana',
        objetivo_valor: 3,
        fecha_inicio: created_at,
        estado: 'activa',
      },
    ]);

    return profile;
  },

  async login(email: string, password: string): Promise<Profile> {
    const e = email.trim().toLowerCase();
    const users = getUsers();
    const user = users.find((u) => u.email === e);
    if (!user) throw new Error('Correo o contraseña incorrectos.');
    const hash = await db.hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
      throw new Error('Correo o contraseña incorrectos.');
    }
    const profile = getProfiles().find((p) => p.id === user.id);
    if (!profile) throw new Error('Perfil no encontrado.');
    db.write(db.keys.session, { user_id: user.id, ts: Date.now() });
    return profile;
  },

  logout() {
    localStorage.removeItem(db.keys.session);
  },

  currentSession(): { user_id: string } | null {
    return db.read<{ user_id: string } | null>(db.keys.session, null);
  },

  getProfile(userId: string): Profile | null {
    return getProfiles().find((p) => p.id === userId) ?? null;
  },

  updateProfile(userId: string, patch: Partial<Profile>): Profile {
    const profiles = getProfiles();
    const idx = profiles.findIndex((p) => p.id === userId);
    if (idx < 0) throw new Error('Perfil no encontrado.');
    profiles[idx] = { ...profiles[idx], ...patch, id: userId };
    setProfiles(profiles);
    return profiles[idx];
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx < 0) throw new Error('Usuario no encontrado.');
    const hash = await db.hashPassword(oldPassword, users[idx].salt);
    if (hash !== users[idx].password_hash) {
      throw new Error('La contraseña actual no es correcta.');
    }
    const salt = db.genSalt();
    users[idx].salt = salt;
    users[idx].password_hash = await db.hashPassword(newPassword, salt);
    setUsers(users);
  },

  // "Recuperación" local: en un backend real se enviaría un email.
  // Aquí permitimos resetear vía verificación local si el usuario recuerda el email.
  // En producción con Supabase, esto se reemplaza por supabase.auth.resetPasswordForEmail().
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const e = email.trim().toLowerCase();
    const users = getUsers();
    const idx = users.findIndex((u) => u.email === e);
    if (idx < 0) throw new Error('No existe una cuenta con ese correo.');
    const salt = db.genSalt();
    users[idx].salt = salt;
    users[idx].password_hash = await db.hashPassword(newPassword, salt);
    setUsers(users);
  },

  deleteAccount(userId: string) {
    const users = getUsers().filter((u) => u.id !== userId);
    setUsers(users);
    const profiles = getProfiles().filter((p) => p.id !== userId);
    setProfiles(profiles);
    localStorage.removeItem(db.keys.workouts(userId));
    localStorage.removeItem(db.keys.weights(userId));
    localStorage.removeItem(db.keys.goals(userId));
    localStorage.removeItem(db.keys.achievements(userId));
    localStorage.removeItem(db.keys.session);
  },
};

// --- Datos de entrenamiento ---

export const workoutsRepo = {
  list(userId: string): Workout[] {
    return db.read<Workout[]>(db.keys.workouts(userId), []);
  },
  save(userId: string, workout: Workout) {
    const all = workoutsRepo.list(userId);
    const idx = all.findIndex((w) => w.id === workout.id);
    if (idx >= 0) all[idx] = workout;
    else all.push(workout);
    db.write(db.keys.workouts(userId), all);
  },
  get(userId: string, id: string): Workout | undefined {
    return workoutsRepo.list(userId).find((w) => w.id === id);
  },
  remove(userId: string, id: string) {
    const all = workoutsRepo.list(userId).filter((w) => w.id !== id);
    db.write(db.keys.workouts(userId), all);
  },
};

export const weightsRepo = {
  list(userId: string): WeightEntry[] {
    return db.read<WeightEntry[]>(db.keys.weights(userId), []).sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
    );
  },
  add(userId: string, peso_kg: number, fecha?: string): WeightEntry {
    const all = weightsRepo.list(userId);
    const entry: WeightEntry = {
      id: db.genId(),
      user_id: userId,
      fecha: fecha ?? new Date().toISOString(),
      peso_kg,
    };
    all.push(entry);
    db.write(db.keys.weights(userId), all);
    return entry;
  },
};

export const goalsRepo = {
  list(userId: string): UserGoal[] {
    return db.read<UserGoal[]>(db.keys.goals(userId), []);
  },
  save(userId: string, goal: UserGoal) {
    const all = goalsRepo.list(userId);
    const idx = all.findIndex((g) => g.id === goal.id);
    if (idx >= 0) all[idx] = goal;
    else all.push(goal);
    db.write(db.keys.goals(userId), all);
  },
  remove(userId: string, id: string) {
    const all = goalsRepo.list(userId).filter((g) => g.id !== id);
    db.write(db.keys.goals(userId), all);
  },
};

export const achievementsRepo = {
  list(userId: string): UserAchievement[] {
    return db.read<UserAchievement[]>(db.keys.achievements(userId), []);
  },
  unlock(userId: string, achievement_id: string): boolean {
    const all = achievementsRepo.list(userId);
    if (all.find((a) => a.achievement_id === achievement_id)) return false;
    all.push({ user_id: userId, achievement_id, fecha: new Date().toISOString() });
    db.write(db.keys.achievements(userId), all);
    return true;
  },
};
