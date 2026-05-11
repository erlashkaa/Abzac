import axios, { type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AUTH_LOST_EVENT = 'biblioteka:auth-lost';

// Request interceptor: attach JWT token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth:token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Response interceptor: handle 401 and HTML fallbacks
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      return Promise.reject(new Error('API returned HTML instead of JSON. Backend might be down.'));
    }
    return response;
  },
  (error) => {
    // 401 — токен недействителен / истёк. 403 — чаще «нет прав» (например не admin);
    // не очищаем сессию на 403, иначе после первого 403 все запросы уходят без Bearer.
    if (error.response?.status === 401) {
      const path = (error.config?.url ?? '').replace(/^\//, '');
      // Неверный пароль при логине тоже 401 — не трогаем storage, иначе сбросим валидную сессию.
      if (path.startsWith('auth/login')) {
        return Promise.reject(error);
      }

      // Сессию сбрасываем только если сервер прямо говорит, что мы "не залогинены"
      // (проверка профиля). Иначе (например, покупка) не должны выбивать пользователя.
      if (path.startsWith('auth/me')) {
        localStorage.removeItem('auth:token');
        localStorage.removeItem('auth:user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(AUTH_LOST_EVENT));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
