import api from './client';
export const booksApi = {
    getBooks: (params) => api.get('books', { params }),
    getBook: (id) => api.get(`books/${id}`),
    getBookContent: (id) => api.get(`books/${id}/content`),
    createBook: (data) => api.post('books', data),
    updateBook: (id, data) => api.put(`books/${id}`, data),
    /** Тело — сырой UTF-8 текст, без JSON (меньше размер, стабильнее для больших книг) */
    updateBookContent: (id, content) => api.put(`books/${id}/content`, content, {
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    }),
    deleteBook: (id) => api.delete(`books/${id}`),
    getGenres: () => api.get('books/genres'),
};
