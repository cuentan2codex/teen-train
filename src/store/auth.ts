import { create } from 'zustand';
import type { Profile } from '../types';
import { auth } from '../services/database';

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (input: Parameters<typeof auth.register>[0]) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  refresh: () => void;
  deleteAccount: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  profile: null,
  loading: true,
  error: null,
  init() {
    const session = auth.currentSession();
    if (session) {
      const p = auth.getProfile(session.user_id);
      set({ profile: p, loading: false });
      applyTheme(p?.theme ?? 'system');
    } else {
      set({ profile: null, loading: false });
    }
  },
  async login(email, password) {
    set({ error: null, loading: true });
    try {
      const p = await auth.login(email, password);
      set({ profile: p, loading: false });
      applyTheme(p.theme);
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  async register(input) {
    set({ error: null, loading: true });
    try {
      const p = await auth.register(input);
      set({ profile: p, loading: false });
      applyTheme(p.theme);
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },
  logout() {
    auth.logout();
    set({ profile: null });
  },
  updateProfile(patch) {
    const current = get().profile;
    if (!current) return;
    const updated = auth.updateProfile(current.id, patch);
    set({ profile: updated });
    if (patch.theme) applyTheme(patch.theme);
  },
  refresh() {
    const current = get().profile;
    if (!current) return;
    const p = auth.getProfile(current.id);
    if (p) set({ profile: p });
  },
  deleteAccount() {
    const current = get().profile;
    if (!current) return;
    auth.deleteAccount(current.id);
    set({ profile: null });
  },
}));

export function applyTheme(theme: Profile['theme']) {
  // La app es dark-first por diseño (Liquid Glass premium).
  // Siempre aplicamos dark; el theme del usuario sólo afecta el color-scheme.
  const root = document.documentElement;
  root.classList.add('dark');
  const isDark =
    theme === 'dark' ||
    theme === 'system' ||
    (theme === 'light' && false); // forzamos dark para preservar el diseño
  root.classList.toggle('dark', true);
  void isDark;
}
