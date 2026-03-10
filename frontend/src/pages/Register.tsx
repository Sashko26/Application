import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { apiClient } from '../api/axios';
import { setCredentials } from '../store/authSlice';

const registerSchema = yup.object({
  firstName: yup.string().required('Введіть імʼя'),
  lastName: yup.string().required('Введіть прізвище'),
  email: yup.string().email('Невірний формат email').required('Введіть email'),
  password: yup.string().min(6, 'Мінімум 6 символів').required('Введіть пароль'),
});

type RegisterForm = yup.InferType<typeof registerSchema>;

export default function Register() {
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setApiError('');
      const response = await apiClient.post('/auth/register', data);
      
      dispatch(setCredentials({
        token: response.data.accessToken,
        user: response.data.user
      }));
      
      navigate('/');
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Помилка реєстрації.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Реєстрація</h2>
      
      {apiError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
            <input {...register('firstName')} className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Прізвище</label>
            <input {...register('lastName')} className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email')} type="email" className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input {...register('password')} type="password" className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
          {isSubmitting ? 'Створення...' : 'Зареєструватися'}
        </button>
      </form>
    </div>
  );
}