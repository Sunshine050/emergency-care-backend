import { Module } from '@nestjs/common';
import { SosLogService } from './sos-log.service';
import { SosLogController } from './sos-log.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SosLogController],
  providers: [SosLogService, PrismaService],
})
export class SosLogModule {}
