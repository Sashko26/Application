import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

import type { RegisterDto, LoginDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Перевіряємо, чи email вже зайнятий
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Користувач з таким email вже існує');
    }

    // 2. Хешуємо пароль (сіль 10 раундів — стандарт для bcrypt)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // 3. Зберігаємо користувача в БД
    const newUser = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // 4. Генеруємо та повертаємо JWT токен
    return this.generateToken(newUser.id, newUser.email);
  }

  async login(dto: LoginDto) {
    // 1. Шукаємо користувача
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    // 2. Порівнюємо паролі
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    // 3. Якщо все ок — видаємо токен
    return this.generateToken(user.id, user.email);
  }

  // Допоміжний метод для створення токена
  private generateToken(userId: string, email: string) {
    const payload = { sub: userId, email }; // sub (subject) - стандартне поле для ID в JWT
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: userId, email } // Також зручно повернути базові дані юзера на фронт
    };
  }
}