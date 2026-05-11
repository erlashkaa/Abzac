import api from './client';
export const bookmarksApi = {
    getBookmarks: (bookId) => api.get(`bookmarks/${bookId}`),
    createBookmark: (data) => api.post('bookmarks', data),
    deleteBookmark: (id) => api.delete(`bookmarks/${id}`),
};
