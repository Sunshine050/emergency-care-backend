import { Test, TestingModule } from '@nestjs/testing';
import { SosController } from './sos.controller';
import { SosService } from './sos.service';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSOSDto } from './dto/create-sos.dto';
import { HttpStatus } from '@nestjs/common';

// Mock SupabaseService
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

describe('SosController', () => {
  let controller: SosController;
  let service: SosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SosController],
      providers: [
        SosService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock JwtAuthGuard
      .compile();

    controller = module.get<SosController>(SosController);
    service = module.get<SosService>(SosService);
  });

  describe('createSOS', () => {
    it('should create an SOS alert successfully', async () => {
      const userId = '9b660a10-6700-4335-a684-64d213c34fe0';
      const createSosDto: CreateSOSDto = {
        severitygrade: 3,
        emergencytype: 'รถชน',
        description: 'มีคนบาดเจ็บ',
        latitude: 19.908764,
        longitude: 99.831345,
        contactinfo: 'ติดต่อ 123-456-7890',
        phonenumber: '123-456-7890',
        priority: 2,
      };

      const mockSosAlert = {
        id: 'some-sos-id',
        userid: userId,
        severitygrade: 3,
        emergencytype: 'รถชน',
        description: 'มีคนบาดเจ็บ',
        latitude: 19.908764,
        longitude: 99.831345,
        status: 'pending',
        createdat: new Date(),
        updatedat: new Date(),
        contactinfo: 'ติดต่อ 123-456-7890',
        phonenumber: '123-456-7890',
        priority: 2,
      };

      const mockUser = {
        id: userId,
        email: 'qq@example.com',
        name: 'qq',
        role: 'user',
      };

      // Mock Supabase calls
      mockSupabaseClient.single
        .mockReturnValueOnce({ data: mockUser, error: null }) // For user check
        .mockReturnValueOnce({ data: mockSosAlert, error: null }); // For SOS insert

      const req = { user: { id: userId } };
      const result = await controller.createSOS(createSosDto, req);

      expect(result).toEqual({ ...mockSosAlert, user: mockUser });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('SOSAlert');
    });

    it('should throw an error if user not found', async () => {
      const userId = 'invalid-user-id';
      const createSosDto: CreateSOSDto = {
        severitygrade: 3,
        emergencytype: 'รถชน',
        description: 'มีคนบาดเจ็บ',
        latitude: 19.908764,
        longitude: 99.831345,
      };

      mockSupabaseClient.single.mockReturnValueOnce({ data: null, error: new Error('User not found') });

      const req = { user: { id: userId } };
      await expect(controller.createSOS(createSosDto, req)).rejects.toThrowError(
        `User with ID ${userId} not found`,
      );
    });
  });

  describe('getAll', () => {
    it('should return all SOS alerts', async () => {
      const mockSosAlerts = [
        {
          id: 'some-sos-id',
          userid: '9b660a10-6700-4335-a684-64d213c34fe0',
          severitygrade: 3,
          emergencytype: 'รถชน',
          description: 'มีคนบาดเจ็บ',
          latitude: 19.908764,
          longitude: 99.831345,
          status: 'pending',
          createdat: new Date(),
          updatedat: new Date(),
        },
      ];

      const mockUsers = [
        { id: '9b660a10-6700-4335-a684-64d213c34fe0', email: 'qq@example.com', name: 'qq', role: 'user' },
      ];

      // ปรับการ mock ให้ครอบคลุม chain และคืนค่าที่ถูกต้อง
      mockSupabaseClient.select
        .mockImplementationOnce(() => ({
          data: mockSosAlerts,
          error: null,
        })) // For SOSAlert fetch
        .mockImplementationOnce(() => ({
          in: jest.fn().mockReturnValue({ data: mockUsers, error: null }), // Mock chain สำหรับ .in()
        })); // For users fetch

      const result = await controller.getAll();
      expect(result).toEqual([
        {
          ...mockSosAlerts[0],
          user: mockUsers[0],
        },
      ]);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('SOSAlert');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });

    it('should throw an error if fetch fails', async () => {
      mockSupabaseClient.select.mockImplementationOnce(() => ({
        data: null,
        error: new Error('Failed to fetch'),
      }));

      await expect(controller.getAll()).rejects.toThrowError('Failed to fetch SOS alerts');
    });
  });

  describe('updateStatus', () => {
    it('should update SOS alert status successfully', async () => {
      const id = 'some-sos-id';
      const status = 'resolved';
      const mockUpdatedSosAlert = {
        id,
        userid: '9b660a10-6700-4335-a684-64d213c34fe0',
        severitygrade: 3,
        emergencytype: 'รถชน',
        status: 'resolved',
        updatedat: new Date(),
      };

      mockSupabaseClient.single
        .mockReturnValueOnce({ data: mockUpdatedSosAlert, error: null }) // For fetch
        .mockReturnValueOnce({ data: mockUpdatedSosAlert, error: null }); // For update

      const result = await controller.updateStatus(id, { status });
      expect(result).toEqual(mockUpdatedSosAlert);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('SOSAlert');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ status, updatedat: expect.any(Date) });
    });

    it('should throw an error if SOS alert not found', async () => {
      const id = 'invalid-sos-id';
      mockSupabaseClient.single.mockReturnValueOnce({ data: null, error: new Error('Not found') });

      await expect(controller.updateStatus(id, { status: 'resolved' })).rejects.toThrowError('SOS Alert not found');
    });
  });
});