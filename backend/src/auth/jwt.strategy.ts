import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Вказуємо, що токен треба шукати в заголовку Authorization
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Відхиляємо прострочені токени
      secretOrKey: configService.get<string>('JWT_SECRET') as string, // Беремо секрет з .env
    });
  }

  // Цей метод викликається автоматично, якщо токен валідний
  async validate(payload: any) {
    // Те, що ми повернемо тут, автоматично запишеться в об'єкт request.user
    return { id: payload.sub, email: payload.email };
  }
}