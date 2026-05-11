import api from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar: string;
  banner: string;
  about: string;
  role: string;
  is_active: boolean;
  violation_count: number;
  created_at: string;
}

export const authApi = {
  login: (data: LoginData) =>
    api.post<AuthResponse>('auth/login', data),

  register: (data: RegisterData) =>
    api.post<AuthResponse>('auth/register', data),

  getMe: () =>
    api.get<UserProfile>('auth/me'),
};
