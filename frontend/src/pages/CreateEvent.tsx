import { useState } from 'react';
import { useForm} from 'react-hook-form';
import type{ SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';

// Схема валідації (прибрали .optional(), залишили тільки .nullable())
const createEventSchema = yup.object({
  title: yup.string().required('Введіть назву події'),
  description: yup.string().nullable(), 
  date: yup.string().required('Оберіть дату та час'),
  location: yup.string().required('Введіть локацію'),
  capacity: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .min(1, 'Мінімум 1 місце')
    .typeError('Повинно бути числом'),
  isPublic: yup.boolean().default(true),
});

type CreateEventForm = yup.InferType<typeof createEventSchema>;

export default function CreateEvent() {
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventForm>({
    resolver: yupResolver(createEventSchema) as any,
    defaultValues: {
      isPublic: true,
      description: '',
    },
  });

  const onSubmit: SubmitHandler<CreateEventForm> = async (data) => {
    try {
      setApiError('');
      
      const formattedPayload = {
        title: data.title,
        description: data.description || '',
        date: new Date(data.date).toISOString(),
        location: data.location,
        capacity: data.capacity ? Number(data.capacity) : null,
        isPublic: !!data.isPublic,
      };

      const response = await apiClient.post('/events', formattedPayload);
      navigate(`/events/${response.data.id}`);
    } catch (error: any) {
      console.error("Помилка від бекенду:", error.response?.data);
      
      const detailedErrors = error.response?.data?.errors?.join(' | ');
      setApiError(detailedErrors ? `Деталі: ${detailedErrors}` : (error.response?.data?.message || 'Помилка валідації даних.'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-8 border rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Створити нову подію</h1>

      {apiError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Назва події *</label>
          <input
            {...register('title')}
            className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Наприклад: Ранкова пробіжка в парку"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Розкажіть детальніше про вашу подію..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата та час *</label>
            <input
              {...register('date')}
              type="datetime-local"
              className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Локація *</label>
            <input
              {...register('location')}
              className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Онлайн або адреса"
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Кількість місць</label>
            <input
              {...register('capacity')}
              type="number"
              min="1"
              className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.capacity ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Залиште пустим для безліміту"
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
          </div>

          <div className="flex items-center h-full pt-6">
            <input
              {...register('isPublic')}
              id="isPublic"
              type="checkbox"
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Публічна подія (видима для всіх)
            </label>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium text-lg disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Створення...' : 'Створити подію'}
          </button>
        </div>
      </form>
    </div>
  );
}