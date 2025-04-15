import { IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSOSDto {
  @IsNumber()
  severitygrade: number; // เปลี่ยนจาก severityGrade เป็น severitygrade

  @IsString()
  emergencytype: string; // เปลี่ยนจาก emergencyType เป็น emergencytype

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  contactinfo?: string;

  @IsOptional()
  @IsString()
  responsetime?: Date;

  @IsOptional()
  @IsString()
  additionalnotes?: string;

  @IsOptional()
  @IsUUID()
  handledby?: string;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsString()
  phonenumber?: string;

  @IsOptional()
  @IsString()
  incidentstarttime?: Date;
}
