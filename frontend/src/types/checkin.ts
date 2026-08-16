export interface DailyCheckInCreate {
  mood: number;
  energy: number;
  stress: number;
  sleep_hours?: number;
  sleep_quality?: string;
  exercise_minutes?: number;
  water_intake_ml?: number;
  symptoms?: string[];
  notes?: string;
}

export interface DailyCheckInResponse {
  id: string;
  user_id: string;
  checkin_date: string;
  mood: number;
  energy: number;
  stress: number;
  sleep_hours?: number | null;
  sleep_quality?: string | null;
  exercise_minutes?: number | null;
  water_intake_ml?: number | null;
  symptoms?: string[] | null;
  notes?: string | null;
  created_at: string;
}

export interface DailyCheckInListResponse {
  items: DailyCheckInResponse[];
  total: number;
}
