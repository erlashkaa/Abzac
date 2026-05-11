import api from './client';

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  cover: string;
  genre: string;
  year: number;
  is_free: boolean;
  rating: number;
  reviews_count: number;
  tags: string[];
  content: string;
  created_at: string;
  retail_price?: number | string | null;
  wholesale_price?: number | string | null;
  stock_quantity?: number | null;
  sales_count?: number | null;
  /** null — неизвестно (гость), true/false для авторизованного */
  purchased?: boolean | null;
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  per_page: number;
}

export interface BookCreateData {
  title: string;
  author: string;
  description?: string;
  cover?: string;
  genre?: string;
  year?: number;
  is_free?: boolean;
  tags?: string[];
  content?: string;
  wholesale_price?: number;
  retail_price?: number;
  stock_quantity?: number;
}

export const booksApi = {
  getBooks: (
    params?: { search?: string; genre?: string; author?: string; sort?: string; page?: number; per_page?: number },
  ) => api.get<BookListResponse>('books', { params }),

  getBook: (id: number) => api.get<Book>(`books/${id}`),

  getBookContent: (id: number) =>
    api.get<{ content: string; title: string }>(`books/${id}/content`),

  /** Не используем POST /api/books/... — там же createBook только для admin (риск 403 из‑за маршрутизации). */
  purchaseBook: (id: number) => api.post<Book>(`purchases/books/${id}`),

  createBook: (data: BookCreateData) => api.post<Book>('books', data),

  updateBook: (id: number, data: Partial<BookCreateData>) => api.put<Book>(`books/${id}`, data),

  updateBookContent: (id: number, content: string) =>
    api.put<void>(`books/${id}/content`, content, {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    }),

  deleteBook: (id: number) => api.delete(`books/${id}`),

  getGenres: () => api.get<string[]>('books/genres'),
};
