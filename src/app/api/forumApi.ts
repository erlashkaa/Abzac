import api from './client';

export interface ForumTopic {
  id: number;
  title: string;
  author_id: number;
  author_name: string;
  is_pinned: boolean;
  is_locked: boolean;
  tag: string;
  replies_count: number;
  last_activity: string;
  created_at: string;
}

export interface ForumMessage {
  id: number;
  topic_id: number;
  author_id: number;
  author_name: string;
  author_avatar: string;
  author_role: string;
  content: string;
  likes: number;
  dislikes: number;
  liked_by_user: boolean;
  disliked_by_user: boolean;
  parent_id: number | null;
  created_at: string;
}

export interface TopicDetailResponse {
  topic: ForumTopic;
  messages: ForumMessage[];
}

/** Spring Data Page shape (snake_case from backend) */
interface TopicsPageResponse {
  content: ForumTopic[];
  last: boolean;
  total_pages: number;
  total_elements: number;
}

export const forumApi = {
  getTopics: async (params?: { search?: string; tag?: string; page?: number; per_page?: number }) => {
    const response = await api.get<TopicsPageResponse>('forum/topics', {
      params: {
        page: params?.page ? params.page - 1 : 0,
        size: params?.per_page || 20,
        search: params?.search || undefined,
        tag: params?.tag || undefined,
      },
    });
    return {
      data: response.data.content,
      last: response.data.last,
      total_pages: response.data.total_pages,
    };
  },

  getTopic: (id: number) =>
    api.get<TopicDetailResponse>(`forum/topics/${id}`),

  createTopic: (data: { title: string; content: string; tag?: string }) =>
    api.post<ForumTopic>('forum/topics', data),

  deleteTopic: (id: number) =>
    api.delete(`forum/topics/${id}`),

  getTags: () =>
    api.get<string[]>('forum/tags'),

  togglePin: (id: number) =>
    api.put<{ is_pinned: boolean }>(`forum/topics/${id}/pin`),

  createMessage: (topicId: number, data: { content: string; parent_id?: number }) =>
    api.post<ForumMessage>(`forum/topics/${topicId}/messages`, data),

  deleteMessage: (messageId: number) =>
    api.delete(`forum/messages/${messageId}`),

  reactToMessage: (messageId: number, reactionType: 'like' | 'dislike') =>
    api.post<{ likes: number; dislikes: number }>(`forum/messages/${messageId}/react`, { reaction_type: reactionType }),

  reportTopic: (topicId: number, reason: string) =>
    api.post('reports', { target_type: 'forum_topic', target_id: topicId, reason }),

  reportMessage: (messageId: number, reason: string) =>
    api.post('reports', { target_type: 'forum_message', target_id: messageId, reason }),
};
