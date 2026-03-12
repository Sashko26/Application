import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/axios';

const editEventSchema = yup.object({
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

type EditEventForm = yup.InferType<typeof editEventSchema>;

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditEventForm>({
    resolver: yupResolver(editEventSchema) as any,
  });

  // Завантажуємо поточні дані події
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await apiClient.get(`/events/${id}`);
        const event = response.data;
        
        // Підставляємо дані у форму. Зверни увагу на форматування дати для input type="datetime-local"
        reset({
          title: event.title,
          description: event.description,
          // datetime-local очікує формат YYYY-MM-DDThh:mm
          date: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"), 
          location: event.location,
          capacity: event.capacity,
          isPublic: event.isPublic,
        });
      } catch (error) {
        setApiError('Не вдалося завантажити дані події');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, reset]);

  const onSubmit = async (data: EditEventForm) => {
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

      await apiClient.patch(`/events/${id}`, formattedPayload);
      navigate(`/events/${id}`); // Повертаємось на сторінку деталей
    } catch (error: any) {
      const detailedErrors = error.response?.data?.errors?.join(' | ');
      setApiError(detailedErrors ? `Деталі: ${detailedErrors}` : (error.response?.data?.message || 'Помилка збереження.'));
    }
  };

  if (loading) return <div className="text-center mt-10">Завантаження...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Link to={`/events/${id}`} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Скасувати і повернутися
      </Link>

      <div className="bg-white p-8 border rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Редагувати подію</h1>

        {apiError && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Назва події *</label>
            <input {...register('title')} className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
            <textarea {...register('description')} rows={4} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата та час *</label>
              <input {...register('date')} type="datetime-local" className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Локація *</label>
              <input {...register('location')} className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Кількість місць</label>
              <input {...register('capacity')} type="number" min="1" className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.capacity ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>

            <div className="flex items-center h-full pt-6">
              <input {...register('isPublic')} id="isPublic" type="checkbox" className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">Публічна подія (видима для всіх)</label>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium text-lg disabled:bg-indigo-400">
              {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}