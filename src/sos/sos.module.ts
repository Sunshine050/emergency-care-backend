// src/sos/sos.module.ts
import { Module } from '@nestjs/common';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  controllers: [SosController],
  providers: [SosService, SupabaseService],
})
export class SosModule {}
