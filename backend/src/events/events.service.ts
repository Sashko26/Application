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

  async findAll() {
    return this.eventsRepository.find({
      where: { isPublic: true },
      relations: ['organizer', 'participants'],
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });
    if (!event) throw new NotFoundException('Подію не знайдено');
    return event;
  }

 async create(dto: CreateEventDto, userId: string) {
    const newEvent = this.eventsRepository.create({
      ...dto,
      description: dto.description || '', 
      capacity: dto.capacity ?? undefined, // <-- Виправляємо конфлікт із null для місткості
      organizer: { id: userId },
    });
    return this.eventsRepository.save(newEvent);
  }

 async update(id: string, dto: UpdateEventDto, userId: string) {
    const event = await this.findOne(id);
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('Тільки організатор може редагувати цю подію');
    }
    
    const updateData = { 
      ...dto, 
      description: dto.description || '',
      capacity: dto.capacity ?? undefined, // <-- Виправляємо конфлікт із null
    };
    Object.assign(event, updateData);
    
    return this.eventsRepository.save(event);
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id);
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('Тільки організатор може видалити цю подію');
    }
    await this.eventsRepository.remove(event);
    return { message: 'Подію успішно видалено' };
  }

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

  async leave(eventId: string, userId: string) {
    const event = await this.findOne(eventId);
    const isAlreadyJoined = event.participants.some(p => p.id === userId);
    if (!isAlreadyJoined) throw new BadRequestException('Ви не є учасником цієї події');
    event.participants = event.participants.filter(p => p.id !== userId);
    await this.eventsRepository.save(event);
    return { message: 'Ви покинули подію' };
  }
}