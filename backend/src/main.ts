import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // <-- Імпортуємо Swagger
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Дозволяємо запити з нашого фронтенду (CORS)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Глобальний пайп валідації (залишаємо як було)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- НАЛАШТУВАННЯ SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Event Management API')
    .setDescription('Документація REST API для системи управління подіями')
    .setVersion('1.0')
    .addBearerAuth() // Додаємо кнопку авторизації через токен
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  // Документація буде доступна за адресою /api/docs
  SwaggerModule.setup('api/docs', app, document); 
  // -----------------------------

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();