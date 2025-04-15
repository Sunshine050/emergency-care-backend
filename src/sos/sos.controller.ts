// src/sos/sos.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Logger, Req, UseGuards } from '@nestjs/common';
import { SosService } from './sos.service';
import { CreateSOSDto } from './dto/create-sos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sos')
export class SosController {
  private readonly logger = new Logger(SosController.name);

  constructor(private readonly sosService: SosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSOS(@Body() createSosDto: CreateSOSDto, @Req() req: any) {
    const userId = req.user.id;
    try {
      const sosAlert = await this.sosService.create(createSosDto, userId);
      this.logger.log(`SOS Alert created successfully: ${sosAlert.id}`);
      return sosAlert;
    } catch (error) {
      this.logger.error('Failed to create SOS Alert', error.stack);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll() {
    try {
      const sosAlerts = await this.sosService.getAll();
      this.logger.log(`Found ${sosAlerts.length} SOS Alerts`);
      return sosAlerts;
    } catch (error) {
      this.logger.error('Failed to retrieve SOS Alerts', error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    try {
      const updatedSOSAlert = await this.sosService.updateStatus(id, body.status);
      this.logger.log(`SOS Alert with id: ${id} updated successfully`);
      return updatedSOSAlert;
    } catch (error) {
      this.logger.error(`Failed to update status for SOS Alert with id: ${id}`, error.stack);
      throw error;
    }
  }
}
