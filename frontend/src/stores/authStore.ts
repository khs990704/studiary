import { create } from 'zustand';
import type { User } from '../types/auth';
import * as authApi from '../api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('token', data.access_token);
    set({
      token: data.access_token,
      user: { ...data.user, created_at: '' },
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
}));
