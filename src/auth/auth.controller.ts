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
  async register(@Body() dto: RegisterDto): Promise<Omit<User, 'password'>> {
    try {
      console.log('Attempting to register user:', dto);
      const user = await this.authService.register(dto);
      console.log('User registered successfully:', user);
      return user;
    } catch (error) {
      console.error('Error during registration:', error);
      throw new Error('Failed to register user');
    }
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    try {
      console.log('Attempting to login user:', dto);
      const { access_token, user } = await this.authService.login(dto);
      console.log('User logged in successfully:', user);
      return { access_token, user };
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Failed to login user');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfileWithAuth(
    @Req() req: Request,
  ): Promise<Omit<User, 'password'>> {
    const user = req.user as { sub: string } | undefined;
    if (!user) {
      console.error('User information is missing in the request.');
      throw new Error('User information is missing in the request.');
    }
    const userId = user.sub;
    console.log('Fetching profile for userId:', userId);
    try {
      const profile = await this.authService.getProfile(userId);
      console.log('User profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  @Get('profile/:id')
  async getProfile(
    @Param('id') userId: string,
  ): Promise<Omit<User, 'password'>> {
    console.log('Fetching profile for userId:', userId);
    try {
      const profile = await this.authService.getProfile(userId);
      console.log('User profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    console.log('Redirecting user to Google for authentication');
    // redirect ไปยัง google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('Google authentication callback received');

      const { token } = await this.authService.validateOrCreateGoogleUser();
      console.log(
        'User successfully authenticated via Google, token generated:',
        token,
      );

      // ตรวจสอบว่า token ถูกสร้างขึ้นมาไหม
      if (!token) {
        console.error('Token generation failed');
        return res.status(500).json({ message: 'Token generation failed' });
      }

      // ส่งกลับไปยัง frontend พร้อม token
      const redirectUrl = `http://localhost:5173/dashboard?token=${token}`;
      console.log('Redirecting user to frontend with token:', redirectUrl);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error during Google authentication callback:', error);
      return res.status(500).json({
        message: 'Google authentication failed',
        error: error.message,
      });
    }
  }
}
