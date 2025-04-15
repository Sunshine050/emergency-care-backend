// src/sos/dto/create-sos-log.dto.ts

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSosLogDto {
  @IsUUID()
  @IsNotEmpty()
  sosId: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsUUID()
  @IsNotEmpty()
  updatedBy: string; // คือ userId ของคนที่อัปเดต
}
