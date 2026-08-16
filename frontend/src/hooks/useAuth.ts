import { useState, useEffect } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  return { user, loading, isAuthenticated: !!user, refreshProfile: fetchProfile };
}
