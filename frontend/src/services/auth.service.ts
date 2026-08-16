import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name,
      avatarUrl: user.user_metadata?.avatar_url,
      createdAt: user.created_at,
    };
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_token');
  },
};
