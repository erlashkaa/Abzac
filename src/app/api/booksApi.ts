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
}

export const booksApi = {
  getBooks: (params?: { search?: string; genre?: string; sort?: string; page?: number; per_page?: number }) =>
    api.get<BookListResponse>('books', { params }),

  getBook: (id: number) =>
    api.get<Book>(`books/${id}`),

  getBookContent: (id: number) =>
    api.get<{ content: string; title: string }>(`books/${id}/content`),

  createBook: (data: BookCreateData) =>
    api.post<Book>('books', data),

  updateBook: (id: number, data: Partial<BookCreateData>) =>
    api.put<Book>(`books/${id}`, data),

  /** Тело — сырой UTF-8 текст, без JSON (меньше размер, стабильнее для больших книг) */
  updateBookContent: (id: number, content: string) =>
    api.put<void>(`books/${id}/content`, content, {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    }),

  deleteBook: (id: number) =>
    api.delete(`books/${id}`),

  getGenres: () =>
    api.get<string[]>('books/genres'),
};
