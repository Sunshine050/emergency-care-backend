import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface User {
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

  // ✅ ดึงข้อมูลโปรไฟล์ของผู้ใช้ด้วย userId
  async getProfile(userId: string): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { data, error }: { data: User | null; error: any } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return data;
  }

  async register(dto: RegisterDto): Promise<{ token: string }> {
    const supabase = this.supabaseService.getClient();
    const hashedPassword = await bcrypt.hash(dto.password, 10);
  
    const validRoles = ['user', '1669', 'hospital', 'rescue_team'];
    if (!validRoles.includes(dto.role)) {
      throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
    }
  
    const { data, error } = await supabase
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
  
    if (error || !data || data.length === 0) {
      console.error('Register error:', error);
      throw new HttpException(
        'Failed to register user',
        HttpStatus.BAD_REQUEST,
      );
    }
  
    const user: User = data[0];
    const token = await this.generateJwtToken(user);
    return { token };
  }
  

  // ✅ เข้าสู่ระบบแบบ Email/Password
  async login(dto: LoginDto): Promise<{ token: string }> {
    const supabase = this.supabaseService.getClient();

    const { data, error }: { data: User | null; error: any } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (error || !data || !data.password) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, data.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const token = await this.generateJwtToken(data);
    return { token };
  }

  // ✅ เข้าสู่ระบบด้วยบัญชี Google
  async loginWithGoogle(profile: any): Promise<{ token: string }> {
    const supabase = this.supabaseService.getClient();

    // ค้นหาผู้ใช้จากอีเมล
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', profile.email)
      .single();

    let finalUser: User;

    if (!user || error) {
      // หากไม่พบผู้ใช้ ให้สร้างใหม่
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: profile.email,
            name: profile.name || profile.email,
            password: '', // ไม่มีรหัสผ่านเพราะใช้ Google OAuth
            role: 'user',
          },
        ])
        .select()
        .single();

      if (insertError || !newUser) {
        console.error('Error creating user:', insertError);
        throw new HttpException('Failed to create user via Google login', HttpStatus.BAD_REQUEST);
      }

      finalUser = newUser;
    } else {
      finalUser = user;
    }

    const token = await this.generateJwtToken(finalUser);
    return { token };
  }

  // ✅ ฟังก์ชันช่วยออก JWT Token
  private async generateJwtToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
      },
      { expiresIn: '1h' },
    );
  }
}
