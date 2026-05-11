import api from './client';
export const forumApi = {
    getTopics: async (params) => {
        const response = await api.get('forum/topics', {
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
    getTopic: (id) => api.get(`forum/topics/${id}`),
    createTopic: (data) => api.post('forum/topics', data),
    deleteTopic: (id) => api.delete(`forum/topics/${id}`),
    getTags: () => api.get('forum/tags'),
    togglePin: (id) => api.put(`forum/topics/${id}/pin`),
    createMessage: (topicId, data) => api.post(`forum/topics/${topicId}/messages`, data),
    deleteMessage: (messageId) => api.delete(`forum/messages/${messageId}`),
    reactToMessage: (messageId, reactionType) => api.post(`forum/messages/${messageId}/react`, { reaction_type: reactionType }),
    reportTopic: (topicId, reason) => api.post('reports', { target_type: 'forum_topic', target_id: topicId, reason }),
    reportMessage: (messageId, reason) => api.post('reports', { target_type: 'forum_message', target_id: messageId, reason }),
};
