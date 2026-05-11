import api from './client';
import type { UserProfile } from './authApi';

export interface StatsResponse {
  total_books: number;
  total_users: number;
  total_comments: number;
  total_readings: number;
}

export interface ReportItem {
  id: number;
  reporter_id: number;
  reporter_name: string;
  target_type: string;
  target_id: number;
  target_content_preview: string;
  reason: string;
  status: string;
  created_at: string;
}

export const adminApi = {
  getStats: () =>
    api.get<StatsResponse>('admin/stats'),

  getUsers: () =>
    api.get<UserProfile[]>('admin/users'),

  createUser: (data: { username: string; email: string; password: string }) =>
    api.post<UserProfile>('admin/users', data),

  blockUser: (userId: number) =>
    api.put(`admin/users/${userId}/block`),

  unblockUser: (userId: number) =>
    api.put(`admin/users/${userId}/unblock`),

  getReports: () =>
    api.get<ReportItem[]>('admin/reports'),

  resolveReport: (reportId: number) =>
    api.put(`admin/reports/${reportId}/resolve`),

  dismissReport: (reportId: number) =>
    api.put(`admin/reports/${reportId}/dismiss`),
};
