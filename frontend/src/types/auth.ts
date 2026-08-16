export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
