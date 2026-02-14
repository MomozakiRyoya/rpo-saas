import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });

    // トークンとユーザー情報を保存
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  },

  async register(data: {
    email: string;
    name: string;
    password: string;
    tenantSlug: string;
    tenantName?: string;
    role?: 'ADMIN' | 'MANAGER' | 'MEMBER';
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);

    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
