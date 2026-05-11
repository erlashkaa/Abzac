import api from './client';

export interface Comment {
  id: number;
  book_id: number;
  book_title?: string;
  topic_id?: number;
  topic_title?: string;
  user_id: number;
  user_name: string;
  user_avatar: string;
  parent_id: number | null;
  content: string;
  likes: number;
  dislikes: number;
  liked_by_user: boolean;
  disliked_by_user: boolean;
  created_at: string;
  replies: Comment[];
}

export const commentsApi = {
  getComments: (bookId: number) =>
    api.get<Comment[]>(`books/${bookId}/comments`),

  createComment: (bookId: number, data: { content: string; parent_id?: number }) =>
    api.post<Comment>(`books/${bookId}/comments`, data),

  deleteComment: (commentId: number) =>
    api.delete(`comments/${commentId}`),

  reactToComment: (commentId: number, reactionType: 'like' | 'dislike') =>
    api.post<{ likes: number; dislikes: number }>(`comments/${commentId}/react`, { reaction_type: reactionType }),

  reportComment: (commentId: number, reason: string) =>
    api.post('reports', { target_type: 'comment', target_id: commentId, reason }),
};
