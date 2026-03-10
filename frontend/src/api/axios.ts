import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Адреса нашого NestJS бекенду
});

// Інтерцептор запитів (відпрацьовує ПЕРЕД кожним відправленням на сервер)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Інтерцептор відповідей (наприклад, якщо токен протермінувався і бекенд повернув 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Якщо сервер каже "Не авторизовано", чистимо локальне сховище
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Можна також зробити примусовий редирект на логін
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);