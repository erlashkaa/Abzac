import api from './client';
export const usersApi = {
    getProfile: () => api.get('users/me'),
    updateProfile: (data) => api.put('users/me', data),
    changePassword: (data) => api.put('users/me/password', data),
    getFavorites: () => api.get('favorites'),
    addFavorite: (bookId) => api.post(`favorites/${bookId}`),
    removeFavorite: (bookId) => api.delete(`favorites/${bookId}`),
    checkFavorite: (bookId) => api.get(`favorites/check/${bookId}`),
    getReadingHistory: () => api.get('reading-history'),
    updateReadingProgress: (bookId, data) => api.put(`reading-history/${bookId}`, data),
    getReviews: () => api.get('users/me/reviews'),
    getComments: () => api.get('users/me/comments'),
    getTopics: () => api.get('users/me/topics'),
    getUserProfile: (userId) => api.get(`users/${userId}`),
};
