import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';

const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 6,
  DIRECTEUR_REGIONAL: 5,
  GERANT: 4,
  AGENT: 3,
  FORMATEUR: 2,
  CLIENT: 1,
};

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isOfflineMode = useAuthStore((s) => s.isOfflineMode);
  const loginAttempts = useAuthStore((s) => s.loginAttempts);
  const lockedUntil = useAuthStore((s) => s.lockedUntil);
  const logout = useAuthStore((s) => s.logout);

  const isLocked = useMemo(
    () => lockedUntil !== null && lockedUntil > new Date(),
    [lockedUntil],
  );

  const canAccess = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasRole = (role: Role) => {
    if (!user) return false;
    return (ROLE_LEVEL[user.role] ?? 0) >= (ROLE_LEVEL[role] ?? 0);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isOfflineMode,
    loginAttempts,
    lockedUntil,
    isLocked,
    logout,
    canAccess,
    hasRole,
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
    currentSiteId: user?.siteId ?? null,
  };
}
