export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  gender?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  full_name?: string;
  gender?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}
