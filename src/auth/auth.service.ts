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

    const { data, error }: { data: User[] | null; error: any } = await supabase
      .from('users')
      .insert([
        {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
        },
      ])
      .select();

    if (error || !data || data.length === 0) {
      console.error('Register error:', error);
      throw new HttpException('Failed to register user', HttpStatus.BAD_REQUEST);
    }

    const user: User = data[0];
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
      },
      { expiresIn: '1h' },
    );

    return { token };
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const supabase = this.supabaseService.getClient();

    const { data, error }: { data: User | null; error: any } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (error || !data) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const user: User = data;

    if (!user.password) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
      },
      { expiresIn: '1h' },
    );

    return { token };
  }

  // ✅ ฟังก์ชันเข้าสู่ระบบด้วย Google OAuth
  async loginWithGoogle(profile: any): Promise<{ token: string }> {
    const supabase = this.supabaseService.getClient();

    console.log('Google Profile:', profile); // Log ข้อมูลที่ได้รับจาก Google

    // ตรวจสอบว่าผู้ใช้นี้มีอยู่ในฐานข้อมูลหรือยัง
    const { data: user, error }: { data: User | null; error: any } = await supabase
      .from('users')
      .select('*')
      .eq('email', profile.email)
      .single();

    let finalUser: User;

    if (!user || error) {
      // ถ้ายังไม่มี, ให้สร้างใหม่
      console.log('Creating new user for email:', profile.email); // Log การสร้างผู้ใช้ใหม่
      const { data: newUserData, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: profile.email,
            name: profile.name || profile.email,
            password: '', // ไม่มีรหัสผ่าน
            role: 'user',
          },
        ])
        .select()
        .single();

      if (insertError || !newUserData) {
        console.error('Error creating user:', insertError); // Log ข้อผิดพลาดในการสร้างผู้ใช้
        throw new HttpException('Failed to create user via Google login', HttpStatus.BAD_REQUEST);
      }

      finalUser = newUserData;
    } else {
      finalUser = user;
      console.log('User found:', finalUser); // Log ข้อมูลผู้ใช้ที่พบในฐานข้อมูล
    }

    // ออก JWT token
    const token = await this.jwtService.signAsync(
      {
        id: finalUser.id,
        role: finalUser.role,
      },
      { expiresIn: '1h' },
    );

    console.log('Generated JWT Token for user:', finalUser.id); // Log การออก JWT token

    return { token };
  }
}
