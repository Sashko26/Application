import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>,
  ) {}

  // Цей метод автоматично запуститься при старті бекенду
  async onApplicationBootstrap() {
    await this.seed();
  }

  private async seed() {
    // Перевіряємо, чи є вже дані в базі. Якщо є — нічого не робимо, щоб не зламати твої тести
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      this.logger.log('База даних вже містить інформацію. Наповнення (seeding) пропущено.');
      return;
    }

    this.logger.log('Починаємо автоматичне наповнення бази даних (seeding)...');

    // 1. Створюємо 2-х користувачів
    const passwordHash = await bcrypt.hash('password123', 10);


   

    const user1 = this.userRepository.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      passwordHash: passwordHash, // <-- Змінили password на passwordHash
    });

    const user2 = this.userRepository.create({
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      passwordHash: passwordHash, // <-- Змінили password на passwordHash
    });

    await this.userRepository.save([user1, user2]);
    this.logger.log('Створено тестових користувачів: alice@example.com та bob@example.com (пароль: password123)');

    // 2. Створюємо 3 події у майбутньому
    const date1 = new Date(); date1.setDate(date1.getDate() + 5);
    const date2 = new Date(); date2.setDate(date2.getDate() + 10);
    const date3 = new Date(); date3.setDate(date3.getDate() + 15);

    const event1 = this.eventRepository.create({
      title: 'JavaScript Conference 2026',
      description: 'Найбільша JS конференція цього року.',
      date: date1,
      location: 'Kyiv Expo Center',
      capacity: 100,
      isPublic: true,
      organizer: user1,
      participants: [user2], // Боб бере участь у події Аліси
    });

    const event2 = this.eventRepository.create({
      title: 'React Native Workshop',
      description: 'Вчимося створювати мобільні додатки.',
      date: date2,
      location: 'Online (Zoom)',
      capacity: 50,
      isPublic: true,
      organizer: user2,
      participants: [user1], // Аліса бере участь у події Боба
    });

    const event3 = this.eventRepository.create({
      title: 'Local Tech Meetup',
      description: 'Нетворкінг та піца для розробників.',
      date: date3,
      location: 'Lviv IT Hub',
      capacity: null, // Безліміт
      isPublic: true,
      organizer: user1,
      participants: [],
    });

    await this.eventRepository.save([event1, event2, event3]);
    this.logger.log('Створено 3 тестові події.');
    this.logger.log('Наповнення бази даних успішно завершено!');
  }
}