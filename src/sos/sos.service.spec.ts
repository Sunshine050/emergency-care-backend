import { Test, TestingModule } from '@nestjs/testing';
import { SosService } from './sos.service';
import { SupabaseService } from '../supabase/supabase.service';
import { HttpStatus } from '@nestjs/common';

describe('SosService', () => {
  let service: SosService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };

  const mockSupabaseService = {
    client: mockSupabaseClient,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SosService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<SosService>(SosService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // เพิ่ม test case อื่น ๆ ตามต้องการ
});