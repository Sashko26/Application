

import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from './dto/auth.dto';
import type { RegisterDto, LoginDto } from './dto/auth.dto';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new YupValidationPipe(RegisterSchema)) // Підключаємо нашу yup-валідацію
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new YupValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}