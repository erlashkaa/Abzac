import api from './client';
import type { UserProfile } from './authApi';
import type { Book } from './booksApi';
import type { Review } from './reviewsApi';
import type { Comment } from './commentsApi';
import type { ForumTopic } from './forumApi';

export interface ReadingHistoryItem {
  book_id: number;
  book_title: string;
  book_cover: string;
  progress_percent: number;
  current_page: number;
  last_read_at: string;
}

export interface UserPublicProfile {
  id: number;
  username: string;
  avatar: string | null;
  banner: string | null;
  about: string | null;
  role: string;
  created_at: string;
}

export interface UserProfileResponse {
  user: UserPublicProfile;
  reviews: Review[];
  comments: Comment[];
  topics: ForumTopic[];
}

export const usersApi = {
  getProfile: () =>
    api.get<UserProfile>('users/me'),

  updateProfile: (data: { username?: string; email?: string; about?: string; avatar?: string; banner?: string }) =>
    api.put<UserProfile>('users/me', data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('users/me/password', data),

  getFavorites: () =>
    api.get<Book[]>('favorites'),

  addFavorite: (bookId: number) =>
    api.post(`favorites/${bookId}`),

  removeFavorite: (bookId: number) =>
    api.delete(`favorites/${bookId}`),

  checkFavorite: (bookId: number) =>
    api.get<{ is_favorite: boolean }>(`favorites/check/${bookId}`),

  getReadingHistory: () =>
    api.get<ReadingHistoryItem[]>('reading-history'),

  updateReadingProgress: (bookId: number, data: { progress_percent: number; current_page: number }) =>
    api.put<ReadingHistoryItem>(`reading-history/${bookId}`, data),

  getReviews: () =>
    api.get<Review[]>('users/me/reviews'),

  getComments: () =>
    api.get<Comment[]>('users/me/comments'),

  getTopics: () =>
    api.get<ForumTopic[]>('users/me/topics'),

  getMyPurchases: () =>
    api.get<Book[]>('users/me/purchases'),

  getUserProfile: (userId: number) =>
    api.get<UserProfileResponse>(`users/${userId}`),
};
