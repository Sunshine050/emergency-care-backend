// register.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsIn(['user', '1669', 'hospital', 'rescue_team']) // ✅ จำกัด role
  role: string;
}
