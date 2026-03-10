import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import type { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  // Отримання всіх публічних подій
  async findAll() {
    return this.eventsRepository.find({
      where: { isPublic: true },
      relations: ['organizer', 'participants'],
      order: { date: 'ASC' }, // Сортуємо від найближчих
    });
  }

  // Отримання деталей конкретної події
  async findOne(id: string) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });
    if (!event) throw new NotFoundException('Подію не знайдено');
    return event;
  }

  // Створення події
  async create(dto: CreateEventDto, userId: string) {
    const newEvent = this.eventsRepository.create({
      ...dto,
      organizer: { id: userId }, // Прив'язуємо поточного користувача як організатора
    });
    return this.eventsRepository.save(newEvent);
  }

  // Оновлення події
  async update(id: string, dto: UpdateEventDto, userId: string) {
    const event = await this.findOne(id);
    
    // Тільки організатор може редагувати
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('Тільки організатор може редагувати цю подію');
    }

    Object.assign(event, dto);
    return this.eventsRepository.save(event);
  }

  // Видалення події
  async remove(id: string, userId: string) {
    const event = await this.findOne(id);
    
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('Тільки організатор може видалити цю подію');
    }

    await this.eventsRepository.remove(event);
    return { message: 'Подію успішно видалено' };
  }

  // Приєднання до події
  async join(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    const isAlreadyJoined = event.participants.some(p => p.id === userId);
    if (isAlreadyJoined) throw new BadRequestException('Ви вже є учасником цієї події');

    if (event.capacity && event.participants.length >= event.capacity) {
      throw new BadRequestException('На жаль, усі місця вже зайняті');
    }

    event.participants.push({ id: userId } as any);
    await this.eventsRepository.save(event);
    return { message: 'Ви успішно приєдналися до події' };
  }

  // Відписка від події
  async leave(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    const isAlreadyJoined = event.participants.some(p => p.id === userId);
    if (!isAlreadyJoined) throw new BadRequestException('Ви не є учасником цієї події');

    event.participants = event.participants.filter(p => p.id !== userId);
    await this.eventsRepository.save(event);
    return { message: 'Ви покинули подію' };
  }
}