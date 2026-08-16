import { apiClient } from './api';
import { AIExplanationRequest, AIExplanationResponse } from '../types/ai';
import { Recommendation } from '../types/health';

export const aiService = {
  async getExplanation(data: AIExplanationRequest): Promise<AIExplanationResponse> {
    const response = await apiClient.post<AIExplanationResponse>('/llm-explain', data);
    return response.data;
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const response = await apiClient.get<Recommendation[]>('/recommendations');
    return response.data;
  }
};
