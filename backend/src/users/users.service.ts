import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Пошук користувача за email (потрібно для логіну та перевірки дублікатів)
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Створення нового користувача
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

// Отримання подій користувача (де він організатор або учасник)
  async getUserEvents(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organizedEvents', 'participatingEvents'],
    });

    if (!user) return { organized: [], participating: [] };

    return {
      organized: user.organizedEvents,
      participating: user.participatingEvents,
    };
  }

}