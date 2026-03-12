import * as yup from 'yup';

export const CreateEventSchema = yup.object({
  title: yup.string().required('Назва є обовʼязковою'),
  description: yup.string().nullable().default(''),
  date: yup.date()
    .min(new Date(), 'Неможливо створити подію в минулому часі')
    .required('Дата та час є обовʼязковими'),
  location: yup.string().required('Локація є обовʼязковою'),
  capacity: yup.number().nullable().positive('Місткість має бути додатнім числом'),
  isPublic: yup.boolean().default(true),
});

export type CreateEventDto = yup.InferType<typeof CreateEventSchema>;

// Для оновлення робимо всі поля необов'язковими, але зберігаємо правила валідації
export const UpdateEventSchema = yup.object({
  title: yup.string().optional(),
  description: yup.string().nullable().optional(),
  date: yup.date().min(new Date(), 'Неможливо перенести подію в минуле').optional(),
  location: yup.string().optional(),
  capacity: yup.number().nullable().positive().optional(),
  isPublic: yup.boolean().optional(),
});

export type UpdateEventDto = yup.InferType<typeof UpdateEventSchema>;