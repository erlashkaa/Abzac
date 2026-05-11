import api from './client';

export interface Review {
  id: number;
  book_id: number;
  book_title?: string;
  user_id: number;
  user_name: string;
  user_avatar: string;
  rating: number;
  text: string;
  likes: number;
  dislikes: number;
  liked_by_user: boolean;
  disliked_by_user: boolean;
  created_at: string;
}

export const reviewsApi = {
  getReviews: (bookId: number) =>
    api.get<Review[]>(`books/${bookId}/reviews`),

  createReview: (bookId: number, data: { rating: number; text: string }) =>
    api.post<Review>(`books/${bookId}/reviews`, data),

  deleteReview: (reviewId: number) =>
    api.delete(`reviews/${reviewId}`),

  reactToReview: (reviewId: number, reactionType: 'like' | 'dislike') =>
    api.post<{ likes: number; dislikes: number }>(`reviews/${reviewId}/react`, { reaction_type: reactionType }),

  reportReview: (reviewId: number, reason: string) =>
    api.post('reports', { target_type: 'review', target_id: reviewId, reason }),
};
