import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import * as passport from 'passport'; // เพิ่ม passport

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เพิ่ม session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'some-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // ใช้ passport สำหรับการจัดการ session
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
