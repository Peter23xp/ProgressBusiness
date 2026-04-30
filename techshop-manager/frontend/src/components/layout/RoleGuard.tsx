import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  minRole: Role;
}

export function RoleGuard({ children, minRole }: RoleGuardProps) {
  const { hasRole } = useAuthStore();

  if (!hasRole(minRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
