import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { CreateEventSchema, UpdateEventSchema } from './dto/event.dto';
import type { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // 🌍 Публічний роут: Отримання списку всіх публічних подій
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // 🌍 Публічний роут: Отримання деталей конкретної події
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  // 🔒 Приватний роут: Створення події
  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new YupValidationPipe(CreateEventSchema))
  create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: { id: string }) {
    return this.eventsService.create(createEventDto, user.id);
  }

  // 🔒 Приватний роут: Редагування події
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(new YupValidationPipe(UpdateEventSchema))
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventsService.update(id, updateEventDto, user.id);
  }

  // 🔒 Приватний роут: Видалення події
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventsService.remove(id, user.id);
  }

  // 🔒 Приватний роут: Приєднання до події
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventsService.join(id, user.id);
  }

  // 🔒 Приватний роут: Відписка від події
  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leave(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.eventsService.leave(id, user.id);
  }
}