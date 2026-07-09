# Auth Guard — healthcare-concepts

## Purpose

Add authentication to healthcare-concepts endpoints.

## When to invoke

When creating or modifying any endpoint that should be protected.

## When not to invoke

For the health check endpoint.

## Workflow

1. Create a global `JwtAuthGuard` (copy pattern from `rxsoft-lis-backend`):
   ```typescript
   @Injectable()
   export class JwtAuthGuard implements CanActivate {
     constructor(private jwtService: JwtService) {}
     canActivate(context: ExecutionContext): boolean {
       const request = context.switchToHttp().getRequest();
       const token = request.headers.authorization?.replace('Bearer ', '');
       try {
         const payload = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
         request.user = payload;
         return true;
       } catch { return false; }
     }
   }
   ```
2. Register as `APP_GUARD` in `app.module.ts` with `@Public()` decorator support.
3. Add `@nestjs/jwt` to dependencies.

## Refactoring

This package currently has **no authentication at all**. The `test.http` file shows a JWT token but it is never validated. When adding auth:
- Use the same `JWT_ACCESS_SECRET` as other services
- Add `@Public()` decorator for opt-out on health and swagger endpoints
- Add `@CurrentUser()` to extract JWT payload on protected endpoints