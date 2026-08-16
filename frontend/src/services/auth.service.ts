import { apiClient } from './api';
import { supabase } from '../lib/supabase';
import { User, UserUpdate } from '../types/auth';

export const authService = {
  async signup(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    if (data.session?.access_token) {
      localStorage.setItem('token', data.session.access_token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.session?.access_token) {
      localStorage.setItem('token', data.session.access_token);
    }
    return data;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  async updateProfile(data: UserUpdate): Promise<User> {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },
};
