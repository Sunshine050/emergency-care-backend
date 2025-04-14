import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService, User } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<Omit<User, 'password'>> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfileWithAuth(
    @Req() req: Request,
  ): Promise<Omit<User, 'password'>> {
    const user = req.user as { sub: string } | undefined;
    if (!user) {
      throw new Error('User information is missing in the request.');
    }
    const userId = user.sub;
    return this.authService.getProfile(userId);
  }

  @Get('profile/:id')
  getProfile(@Param('id') userId: string): Promise<Omit<User, 'password'>> {
    return this.authService.getProfile(userId);
  }
}
