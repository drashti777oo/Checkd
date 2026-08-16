export interface HealthRecordCreate {
  record_type: string;
  recorded_at?: string;
  data: Record<string, any>;
}

export interface HealthRecordResponse {
  id: string;
  record_type: string;
  recorded_at: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HealthRecordListResponse {
  items: HealthRecordResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
