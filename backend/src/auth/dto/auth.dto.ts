import * as yup from 'yup';

// Схема для реєстрації
export const RegisterSchema = yup.object({
  email: yup.string().email('Невірний формат email').required('Email є обовʼязковим'),
  password: yup.string().min(6, 'Пароль має містити мінімум 6 символів').required('Пароль є обовʼязковим'),
  firstName: yup.string().required('Імʼя є обовʼязковим'),
  lastName: yup.string().required('Прізвище є обовʼязковим'),
});

// Тип DTO, який автоматично генерується зі схеми
export type RegisterDto = yup.InferType<typeof RegisterSchema>;

// Схема для логіну
export const LoginSchema = yup.object({
  email: yup.string().email('Невірний формат email').required('Email є обовʼязковим'),
  password: yup.string().required('Пароль є обовʼязковим'),
});

// Тип DTO для логіну
export type LoginDto = yup.InferType<typeof LoginSchema>;