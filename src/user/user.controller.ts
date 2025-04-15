import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/role.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('user')
export class UserController {
  @Get('profile')
  @Roles('user')
  @UseGuards(RolesGuard)
  getProfile() {
    return 'This is your profile';
  }

  @Get('admin')
  @Roles('admin') // ผู้ใช้ต้องเป็น 'admin'
  @UseGuards(RolesGuard)
  getAdminData() {
    return 'This is admin data';
  }
}
