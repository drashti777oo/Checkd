import { apiClient } from './api';
import { MLAnalysisPayload, MLAnalysisResult, LLMExplanationRequest, LLMExplanationResponse } from '../types/ai';

export const aiService = {
  async runMLAnalysis(payload: MLAnalysisPayload): Promise<MLAnalysisResult> {
    const response = await apiClient.post<MLAnalysisResult>('/analysis/assess', payload);
    return response.data;
  },

  async generateLLMExplanation(payload: LLMExplanationRequest): Promise<LLMExplanationResponse> {
    const response = await apiClient.post<LLMExplanationResponse>('/explain/generate', payload);
    return response.data;
  },
};
