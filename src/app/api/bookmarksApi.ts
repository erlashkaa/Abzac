import api from './client';

export interface Bookmark {
  id: number;
  book_id: number;
  paragraph_index: number;
  name: string;
  description: string;
  created_at: string;
}

export interface BookmarkCreateData {
  book_id: number;
  paragraph_index: number;
  name: string;
  description?: string;
}

export const bookmarksApi = {
  getBookmarks: (bookId: number) =>
    api.get<Bookmark[]>(`bookmarks/${bookId}`),

  createBookmark: (data: BookmarkCreateData) =>
    api.post<Bookmark>('bookmarks', data),

  deleteBookmark: (id: number) =>
    api.delete(`bookmarks/${id}`),
};
