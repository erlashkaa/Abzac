import api from './client';
export const reviewsApi = {
    getReviews: (bookId) => api.get(`books/${bookId}/reviews`),
    createReview: (bookId, data) => api.post(`books/${bookId}/reviews`, data),
    deleteReview: (reviewId) => api.delete(`reviews/${reviewId}`),
    reactToReview: (reviewId, reactionType) => api.post(`reviews/${reviewId}/react`, { reaction_type: reactionType }),
    reportReview: (reviewId, reason) => api.post('reports', { target_type: 'review', target_id: reviewId, reason }),
};
