import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ ให้ ConfigModule ใช้งานได้ทั่วทั้งแอป
    }),
    PrismaModule,
    UserModule,
    AuthModule, // นำเข้า AuthModule ถูกต้องแล้ว
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
