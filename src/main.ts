import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import * as passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global Validation (ตรวจสอบ DTO)
  app.useGlobalPipes(new ValidationPipe());

  // ✅ Enable CORS ให้ React Native เรียกใช้ API ได้
  app.enableCors({
    origin: 'http://192.168.198.1:8081', // หรือระบุ origin เฉพาะ เช่น 'http://localhost:8081'
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // ✅ Session Middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'some-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // ✅ ใช้ passport
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());

  // ✅ Run server
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
void bootstrap();
