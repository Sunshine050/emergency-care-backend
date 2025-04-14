import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

@Injectable()
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // Logging for debug
    console.log('✅ Supabase URL:', supabaseUrl);
    console.log('✅ Supabase Key exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
      throw new Error('Supabase config missing');
    }

    this.client = createClient(supabaseUrl, supabaseKey);

    console.log('✅ Supabase client created successfully');
  }
}
