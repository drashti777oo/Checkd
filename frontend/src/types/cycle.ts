export interface CycleLogCreate {
  start_date: string;
  end_date?: string;
  flow_intensity?: string;
  symptoms?: string[];
  notes?: string;
}

export interface CycleLogResponse {
  id: string;
  user_id: string;
  start_date: string;
  end_date?: string | null;
  flow_intensity: string;
  symptoms?: string[] | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CycleLogListResponse {
  items: CycleLogResponse[];
  total: number;
}

export interface CyclePredictionResponse {
  last_period_start?: string | null;
  next_predicted_start?: string | null;
  next_predicted_end?: string | null;
  predicted_ovulation_date?: string | null;
  average_cycle_length_days: number;
  average_period_length_days: number;
}
