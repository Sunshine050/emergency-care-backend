import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Request } from 'express';
import { GoogleUser } from '../google-user.interface';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly supabaseService: SupabaseService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });

    console.log('Google Callback URL:', process.env.GOOGLE_CALLBACK_URL);
    console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET);
    console.log('Google Strategy initialized');
    console.log('Supabase Client:', !!this.supabaseService?.client); // ตรวจสอบการเชื่อมต่อ
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<GoogleUser> {
    const name = profile.name;
    const emails = profile.emails;
    const photos = profile.photos;

    // ข้อมูลที่ใช้จาก profile ของ Google
    const email = emails?.[0]?.value || '';
    const firstName = name?.givenName || '';
    const lastName = name?.familyName || '';
    const picture = photos?.[0]?.value || '';

    // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
    const { data: existingUser, error: selectError } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      console.error('Error fetching user from Supabase:', selectError.message);
      throw new Error('Failed to fetch user from Supabase');
    }

    // ถ้าผู้ใช้ยังไม่มีในฐานข้อมูล Supabase ก็ให้เพิ่มใหม่
    if (!existingUser) {
      const { error: insertError } = await this.supabaseService.client.from('users').insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: picture,
          provider: 'google',
          role: 'user', // กำหนด role ให้กับผู้ใช้ใหม่
        },
      ]);

      if (insertError) {
        console.error('Error inserting user into Supabase:', insertError.message);
        throw new Error('Failed to insert user into Supabase');
      }
    }

    // สร้าง JWT payload และคืนค่า user
    const user: GoogleUser = {
      email,
      firstName,
      lastName,
      picture,
      accessToken,
      refreshToken,
    };

    // ส่งข้อมูล user กลับไป
    done(null, user);
    return user;
  }
}
