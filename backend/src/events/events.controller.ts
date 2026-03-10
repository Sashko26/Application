import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateEventSchema, UpdateEventSchema } from './dto/event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: Request, @CurrentUser() user: { id: string }) {
    try {
      // 1. Беремо СИРІ дані прямо із запиту, обходячи настирливого охоронця NestJS!
      const body = req.body;
      
      // 2. Валідуємо їх нашим Yup
      const validData = CreateEventSchema.validateSync(body, { abortEarly: false, stripUnknown: true });
      
      // 3. Зберігаємо в базу
      return this.eventsService.create(validData as any, user.id);
    } catch (error: any) {
      // Відправляємо помилки на фронтенд у правильному форматі, якщо юзер щось не заповнив
      throw new BadRequestException({ message: 'Помилка валідації даних', errors: error.errors });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: Request, @CurrentUser() user: { id: string }) {
    try {
      const body = req.body;
      const validData = UpdateEventSchema.validateSync(body, { abortEarly: false, stripUnknown: true });
      return this.eventsService.update(id, validData as any, user.id);
    } catch (error: any) {
      throw new BadRequestException({ message: 'Помилка валідації даних', errors: error.errors });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventsService.remove(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventsService.join(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leave(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventsService.leave(id, user.id);
  }
}