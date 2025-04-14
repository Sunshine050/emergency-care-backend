import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, User } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { Response } from 'express';

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirect ไปยัง google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { token } = await this.authService.validateOrCreateGoogleUser();

    // redirect ไปยัง frontend พร้อม token
    const redirectUrl = `http://localhost:5173/dashboard?token=${token}`;
    return res.redirect(redirectUrl);
  }
}
