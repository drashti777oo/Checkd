import { apiClient } from './api';
import {
  MLAnalysisRequest,
  MLAnalysisResponse,
  MLAnalysisListResponse,
  ExplanationRequest,
  ExplanationResponse,
  RecommendationRequest,
  RecommendationResponse,
  RecommendationUpdate,
  RecommendationListResponse,
} from '../types/ai';

export const aiService = {
  // ML Analysis Endpoints
  async createMLAnalysis(healthRecordId: string): Promise<MLAnalysisResponse> {
    const payload: MLAnalysisRequest = { health_record_id: healthRecordId };
    const response = await apiClient.post<MLAnalysisResponse>('/analysis/assess', payload);
    return response.data;
  },

  async listMLAnalyses(page: number = 1, pageSize: number = 20): Promise<MLAnalysisListResponse> {
    const response = await apiClient.get<MLAnalysisListResponse>('/analysis', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async getMLAnalysis(analysisId: string): Promise<MLAnalysisResponse> {
    const response = await apiClient.get<MLAnalysisResponse>(`/analysis/${analysisId}`);
    return response.data;
  },

  // LLM Explanation Endpoints
  async generateExplanation(analysisId: string): Promise<ExplanationResponse> {
    const payload: ExplanationRequest = { analysis_id: analysisId };
    const response = await apiClient.post<ExplanationResponse>('/explain/generate', payload);
    return response.data;
  },

  async getExplanation(explanationId: string): Promise<ExplanationResponse> {
    const response = await apiClient.get<ExplanationResponse>(`/explain/${explanationId}`);
    return response.data;
  },

  async getExplanationByAnalysisId(analysisId: string): Promise<ExplanationResponse> {
    const response = await apiClient.get<ExplanationResponse>(`/explain/analysis/${analysisId}`);
    return response.data;
  },

  // Recommendation Endpoints
  async generateRecommendations(analysisId: string): Promise<RecommendationListResponse> {
    const payload: RecommendationRequest = { analysis_id: analysisId };
    const response = await apiClient.post<RecommendationListResponse>('/recommendations/generate', payload);
    return response.data;
  },

  async listRecommendations(statusFilter?: string, page: number = 1, pageSize: number = 20): Promise<RecommendationListResponse> {
    const response = await apiClient.get<RecommendationListResponse>('/recommendations', {
      params: { status: statusFilter, page, page_size: pageSize },
    });
    return response.data;
  },

  async getRecommendation(recommendationId: string): Promise<RecommendationResponse> {
    const response = await apiClient.get<RecommendationResponse>(`/recommendations/${recommendationId}`);
    return response.data;
  },

  async updateRecommendationStatus(recommendationId: string, newStatus: 'active' | 'dismissed' | 'completed'): Promise<RecommendationResponse> {
    const payload: RecommendationUpdate = { status: newStatus };
    const response = await apiClient.patch<RecommendationResponse>(`/recommendations/${recommendationId}`, payload);
    return response.data;
  },
};
