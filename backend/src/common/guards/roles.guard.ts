import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 3,
  MANAGER: 2,
  MEMBER: 1,
  CUSTOMER: 0,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Unauthorized');

    // ADMIN は常に通す
    if (user.role === 'ADMIN') return true;

    // 最低ロールレベルを計算（最も低いレベルを要件とする）
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r] ?? 0));
    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;

    if (userLevel < minRequired) {
      throw new ForbiddenException(
        `権限が不足しています（必要: ${requiredRoles.join(' または ')}）`,
      );
    }
    return true;
  }
}
