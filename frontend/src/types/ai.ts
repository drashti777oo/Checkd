export interface MLAnalysisPayload {
  features: number[];
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface MLAnalysisResult {
  riskScore: number;
  riskCategory: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  extractedFeatures?: Record<string, number>;
  timestamp: string;
}

export interface LLMExplanationRequest {
  metrics: Record<string, unknown>;
  query?: string;
}

export interface LLMExplanationResponse {
  summary: string;
  recommendations: string[];
  disclaimer: string;
}
