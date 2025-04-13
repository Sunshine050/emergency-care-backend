import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
