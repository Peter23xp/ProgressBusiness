import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 6,
  DIRECTEUR_REGIONAL: 5,
  GERANT: 4,
  AGENT: 3,
  FORMATEUR: 2,
  CLIENT: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException({ code: 'ERR_FORBIDDEN', message: 'Rôle insuffisant' });

    const userLevel = ROLE_HIERARCHY[user.role as Role] ?? 0;
    const hasRole = requiredRoles.some((r) => ROLE_HIERARCHY[r] <= userLevel);

    if (!hasRole) {
      throw new ForbiddenException({ code: 'ERR_FORBIDDEN', message: 'Rôle insuffisant' });
    }

    return true;
  }
}
