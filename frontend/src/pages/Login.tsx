import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { apiClient } from '../api/axios';
import { setCredentials } from '../store/authSlice';

// Схема валідації (майже копія з бекенду)
const loginSchema = yup.object({
  email: yup.string().email('Невірний формат email').required('Введіть email'),
  password: yup.string().required('Введіть пароль'),
});

type LoginForm = yup.InferType<typeof loginSchema>;

export default function Login() {
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setApiError('');
      // Відправляємо запит на наш NestJS
      const response = await apiClient.post('/auth/login', data);
      
      // Зберігаємо токен у Redux та localStorage
      dispatch(setCredentials({
        token: response.data.accessToken,
        user: response.data.user
      }));
      
      // Перекидаємо на головну сторінку
      navigate('/');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Помилка авторизації. Перевірте дані.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Вхід в EventHub</h2>
      
      {apiError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input
            {...register('password')}
            type="password"
            className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Вхід...' : 'Увійти'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Ще немає акаунту? <Link to="/register" className="text-indigo-600 hover:underline">Зареєструватися</Link>
      </p>
    </div>
  );
}