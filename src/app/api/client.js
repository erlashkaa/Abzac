import axios from 'axios';
const api = axios.create({
    baseURL: '/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth:token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Response interceptor: handle 401 and HTML fallbacks
api.interceptors.response.use((response) => {
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
        return Promise.reject(new Error('API returned HTML instead of JSON. Backend might be down.'));
    }
    return response;
}, (error) => {
    // 401 — токен недействителен / истёк. 403 — чаще «нет прав» (например не admin);
    // не очищаем сессию на 403, иначе после первого 403 все запросы уходят без Bearer.
    if (error.response?.status === 401) {
        localStorage.removeItem('auth:token');
        localStorage.removeItem('auth:user');
    }
    return Promise.reject(error);
});
export default api;
