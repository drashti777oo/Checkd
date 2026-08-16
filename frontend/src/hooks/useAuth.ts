import { useState, useEffect } from 'react';
import { UserProfile } from '../types/auth';
import { authService } from '../services/auth.service';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
