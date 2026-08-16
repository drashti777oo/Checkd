export interface MLAnalysisRequest {
  health_record_id: string;
}

export interface MLAnalysisResponse {
  id: string;
  health_record_id: string;
  status: string; // 'completed' | 'model_not_configured' | 'failed'
  model_version: string;
  result: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MLAnalysisListResponse {
  items: MLAnalysisResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ExplanationRequest {
  analysis_id: string;
}

export interface ExplanationResponse {
  id: string;
  analysis_id: string;
  status: string;
  model: string;
  summary: string;
  details: string[];
  limitations: string[];
  created_at: string;
  updated_at: string;
}

export interface RecommendationRequest {
  analysis_id: string;
}

export interface RecommendationResponse {
  id: string;
  analysis_id: string;
  category: string;
  priority: string; // 'low' | 'medium' | 'high'
  title: string;
  description: string;
  action: string;
  rationale: string;
  status: 'active' | 'dismissed' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface RecommendationUpdate {
  status: 'active' | 'dismissed' | 'completed';
}

export interface RecommendationListResponse {
  items: RecommendationResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  generation_status: string;
}
