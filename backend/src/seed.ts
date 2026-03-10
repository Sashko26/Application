import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Event } from './events/entities/event.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  // Створюємо контекст додатку без запуску HTTP-сервера
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get(getRepositoryToken(User));
  const eventRepository = app.get(getRepositoryToken(Event));

 console.log('🧹 Очищення старої бази даних...');
  
  // Знаходимо всі події та видаляємо їх
  const existingEvents = await eventRepository.find();
  if (existingEvents.length > 0) {
    await eventRepository.remove(existingEvents);
  }

  // Знаходимо всіх користувачів та видаляємо їх
  const existingUsers = await userRepository.find();
  if (existingUsers.length > 0) {
    await userRepository.remove(existingUsers);
  }
  console.log('👤 Створення користувачів...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const user1 = userRepository.create({
    email: 'alice@example.com',
    passwordHash,
    firstName: 'Alice',
    lastName: 'Smith',
  });
  
  const user2 = userRepository.create({
    email: 'bob@example.com',
    passwordHash,
    firstName: 'Bob',
    lastName: 'Johnson',
  });

  await userRepository.save([user1, user2]);

  console.log('📅 Створення публічних подій...');
  
  // Подія 1: Від Alice, обмежена кількість місць
  const event1 = eventRepository.create({
    title: 'JavaScript Meetup',
    description: 'Зустріч розробників JS для обговорення нових фреймворків.',
    date: new Date(Date.now() + 86400000 * 5), // +5 днів від сьогодні
    location: 'Офіс у центрі міста',
    capacity: 50,
    isPublic: true,
    organizer: user1,
  });

  // Подія 2: Від Alice, онлайн, безліміт, Bob уже приєднався
  const event2 = eventRepository.create({
    title: 'Node.js Backend Workshop',
    description: 'Практичний воркшоп зі створення API на NestJS.',
    date: new Date(Date.now() + 86400000 * 10), // +10 днів
    location: 'Онлайн (Zoom)',
    capacity: null, // Безліміт
    isPublic: true,
    organizer: user1,
    participants: [user2], // Bob бере участь
  });

  // Подія 3: Від Bob, велика конференція
  const event3 = eventRepository.create({
    title: 'Frontend Conf 2026',
    description: 'Велика щорічна конференція для фронтенд-розробників.',
    date: new Date(Date.now() + 86400000 * 20), // +20 днів
    location: 'Конференц-зал "Хрещатик"',
    capacity: 500,
    isPublic: true,
    organizer: user2,
  });

  await eventRepository.save([event1, event2, event3]);

  console.log('✅ Сідінг успішно завершено! Дані додано до бази.');
  await app.close();
}

bootstrap();