import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async getProfile(userId: string): Promise<User> {
    console.log('📌 [getProfile] Called with userId:', userId);

    const supabase = this.supabaseService.client;

    const { data, error }: { data: User | null; error: any } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('❌ [getProfile] User not found or error:', error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    console.log('✅ [getProfile] Found user:', {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    });

    return data;
  }

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    console.log('📌 [register] Called with:', {
      email: dto.email,
      name: dto.name,
      role: dto.role,
    });

    const supabase = this.supabaseService.client;

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existingUser) {
      console.warn('⚠️ [register] Email already in use:', dto.email);
      throw new HttpException('Email already registered', HttpStatus.CONFLICT);
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ [register] Error checking existing email:', checkError);
      throw new HttpException(
        'Failed to check existing user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const validRoles = ['user', '1669', 'hospital', 'rescue_team'];
    if (!validRoles.includes(dto.role)) {
      console.warn('⚠️ [register] Invalid role:', dto.role);
      throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
    }

    const { data, error }: { data: User[] | null; error: any } = await supabase
      .from('users')
      .insert([
        {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
        },
      ])
      .select();

    if (error || !data || data.length === 0 || !data[0]) {
      console.error('❌ [register] Register error:', error);
      throw new HttpException(
        'Failed to register user',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = data[0];
    console.log('✅ [register] Registered user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const { ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    console.log('📌 [login] Called with email:', dto.email);

    const supabase = this.supabaseService.client;

    const { data, error }: { data: User | null; error: any } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (error || !data) {
      console.warn('⚠️ [login] Email not found or error:', error);
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = data;

    if (!user.password) {
      console.error('❌ [login] User has no password set');
      throw new HttpException(
        'Password not found for user',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) {
      console.warn('⚠️ [login] Incorrect password');
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    console.log('✅ [login] Login successful:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async validateOrCreateGoogleUser() {
    const token = this.jwtService.sign({ sub: 'googleUserId' });
    return { token };
  }
}
