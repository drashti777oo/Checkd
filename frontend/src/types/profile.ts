export interface HealthProfile {
  id: string;
  user_id: string;
  date_of_birth?: string | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  health_conditions?: string[] | null;
  health_goals?: string[] | null;
  medications?: string[] | null;
  supplements?: string[] | null;
  cycle_tracking_enabled: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingCompleteRequest {
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  health_conditions?: string[];
  health_goals?: string[];
  medications?: string[];
  supplements?: string[];
  cycle_tracking_enabled: boolean;
}

export interface HealthProfileUpdate {
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  health_conditions?: string[];
  health_goals?: string[];
  medications?: string[];
  supplements?: string[];
  cycle_tracking_enabled?: boolean;
  onboarding_completed?: boolean;
}
