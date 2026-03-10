import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔒 Приватний роут: Отримання подій поточного користувача (для календаря)
  @UseGuards(JwtAuthGuard)
  @Get('me/events')
  getMyEvents(@CurrentUser() user: { id: string }) {
    return this.usersService.getUserEvents(user.id);
  }
}