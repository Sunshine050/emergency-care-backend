// src/sos-log/sos-log.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { SosLogService } from './sos-log.service';

@Controller('sos-log')
export class SosLogController {
  constructor(private readonly sosLogService: SosLogService) {}

  @Get(':sosId')
  getLogs(@Param('sosId') sosId: string) {
    return this.sosLogService.getLogsBySosId(sosId);
  }
}
