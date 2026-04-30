import { create } from 'zustand';
import type { AuthUser, Role } from '@/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null; // memory only — never persisted
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAttempts: number;
  lockedUntil: Date | null;
  isOfflineMode: boolean;
  lastSyncAt: Date | null;

  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  hasRole: (minRole: Role) => boolean;
  setLoading: (loading: boolean) => void;
  incrementAttempts: () => void;
  resetAttempts: () => void;
  setLockedUntil: (date: Date | null) => void;
  setOfflineMode: (offline: boolean) => void;
  setLastSyncAt: (date: Date) => void;
}

const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 6,
  DIRECTEUR_REGIONAL: 5,
  GERANT: 4,
  AGENT: 3,
  FORMATEUR: 2,
  CLIENT: 1,
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  loginAttempts: 0,
  lockedUntil: null,
  isOfflineMode: false,
  lastSyncAt: null,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, loginAttempts: 0, lockedUntil: null }),

  setAccessToken: (accessToken) => set({ accessToken }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  hasRole: (minRole) => {
    const user = get().user;
    if (!user) return false;
    return (ROLE_LEVEL[user.role] ?? 0) >= (ROLE_LEVEL[minRole] ?? 0);
  },

  setLoading: (isLoading) => set({ isLoading }),
  incrementAttempts: () => set((s) => ({ loginAttempts: s.loginAttempts + 1 })),
  resetAttempts: () => set({ loginAttempts: 0, lockedUntil: null }),
  setLockedUntil: (lockedUntil) => set({ lockedUntil }),
  setOfflineMode: (isOfflineMode) => set({ isOfflineMode }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
}));
