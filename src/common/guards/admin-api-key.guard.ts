import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Simple x-api-key guard for admin/ops endpoints.
 * Env: ADMIN_API_KEY (must be set for the guard to enforce).
 * Matches the seed service's service-to-service convention.
 */
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedKey = request.headers['x-api-key'];
    const expectedKey = process.env.ADMIN_API_KEY;

    // If ADMIN_API_KEY is not configured, allow all (dev mode)
    if (!expectedKey) return true;

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing x-api-key');
    }

    return true;
  }
}
