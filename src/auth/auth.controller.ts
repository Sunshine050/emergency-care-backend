import { Body, Controller, Post, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // เพิ่มการเข้าสู่ระบบด้วย Google
  @Get('google')
  @UseGuards(GoogleAuthGuard) // ใช้ Guard สำหรับ Google OAuth
  googleAuth() {
    console.log('Redirecting to Google OAuth...');
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req) {
    console.log('Google Auth Callback:', req.user); // Log ข้อมูลของผู้ใช้ที่ได้รับจาก Google

    // หลังจากผู้ใช้เข้าสู่ระบบกับ Google แล้ว, จะทำการ login และส่ง JWT token กลับไป
    return this.authService.loginWithGoogle(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('req.user =', req.user); // Log ข้อมูลของผู้ใช้ที่เข้าสู่ระบบแล้ว
    return req.user;
  }
}
