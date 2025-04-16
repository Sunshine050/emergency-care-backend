// src/sos-log/sos-log.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SosLogService {
  constructor(private prisma: PrismaService) {}

  async createLog(sosId: string, status: string, updatedBy: string) {
    return this.prisma.sOSLog.create({
      data: {
        sosId,
        status,
        updatedBy,
      },
    });
  }

  async getLogsBySosId(sosId: string) {
    return this.prisma.sOSLog.findMany({
      where: { sosId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
