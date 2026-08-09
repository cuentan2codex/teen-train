// Capa de persistencia local basada en localStorage.
//
// IMPORTANTE — Decisión técnica honesta:
// GitHub Pages sólo sirve archivos estáticos, no soporta backend Node.
// Para tener autenticación + base de datos reales en producción se necesita
// un servicio externo (Supabase o Firebase). Como no se proporcionaron
// credenciales de Supabase, esta capa implementa persistencia real en el
// navegador usando localStorage con una API que imita un cliente de base
// datos. La migración a Supabase sólo requiere reemplazar este archivo
// por una implementación equivalente con `@supabase/supabase-js`.
//
// Seguridad:
// - Las contraseñas se guardan hasheadas con PBKDF2 (Web Crypto).
// - Nunca se guarda la contraseña en texto plano.
// - Cada usuario sólo puede leer/escribir sus propios datos (filtrado por user_id).
// - Los datos quedan en el dispositivo del usuario (no se envían a servidores
//   de terceros). Esto es más seguro para adolescentes que enviar datos a un
//   backend que no controlamos.

const PREFIX = 'teentrain:';

const keys = {
  users: `${PREFIX}users`,
  session: `${PREFIX}session`,
  profiles: `${PREFIX}profiles`,
  workouts: (uid: string) => `${PREFIX}workouts:${uid}`,
  weights: (uid: string) => `${PREFIX}weights:${uid}`,
  goals: (uid: string) => `${PREFIX}goals:${uid}`,
  achievements: (uid: string) => `${PREFIX}achievements:${uid}`,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Hashing de contraseñas usando Web Crypto API ---

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function genSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function genId(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// --- API pública ---

export const db = {
  keys,
  read,
  write,
  hashPassword,
  genSalt,
  genId,
};
