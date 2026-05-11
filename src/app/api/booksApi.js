import api from './client';
export const booksApi = {
    getBooks: (params) => api.get('books', { params }),
    getBook: (id) => api.get(`books/${id}`),
    getBookContent: (id) => api.get(`books/${id}/content`),
    /** Не используем POST /api/books/... — там же createBook только для admin (риск 403 из‑за маршрутизации). */
    purchaseBook: (id) => api.post(`purchases/books/${id}`),
    createBook: (data) => api.post('books', data),
    updateBook: (id, data) => api.put(`books/${id}`, data),
    updateBookContent: (id, content) => api.put(`books/${id}/content`, content, {
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    }),
    deleteBook: (id) => api.delete(`books/${id}`),
    getGenres: () => api.get('books/genres'),
};
