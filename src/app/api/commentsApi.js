import api from './client';
export const commentsApi = {
    getComments: (bookId) => api.get(`books/${bookId}/comments`),
    createComment: (bookId, data) => api.post(`books/${bookId}/comments`, data),
    deleteComment: (commentId) => api.delete(`comments/${commentId}`),
    reactToComment: (commentId, reactionType) => api.post(`comments/${commentId}/react`, { reaction_type: reactionType }),
    reportComment: (commentId, reason) => api.post('reports', { target_type: 'comment', target_id: commentId, reason }),
};
