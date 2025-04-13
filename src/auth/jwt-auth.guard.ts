import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { CanActivate, ExecutionContext } from '@nestjs/common';

// ใช้ JwtStrategy เพื่อป้องกันการเข้าถึง Route
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //   canActivate(context: ExecutionContext) {
  //     const req = context.switchToHttp().getRequest();
  //     console.log('🔒 Checking token from header:', req.headers.authorization);
  //     return super.canActivate(context);
  //   }
}
