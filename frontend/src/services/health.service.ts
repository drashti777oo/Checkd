import { apiClient } from './api';
import { HealthDataInput, HealthRecord, MLAnalysisResult } from '../types/health';

export const healthService = {
  async submitHealthData(data: HealthDataInput): Promise<{ id: string }> {
    const response = await apiClient.post<{ id: string }>('/health-data', data);
    return response.data;
  },

  async getHealthHistory(): Promise<HealthRecord[]> {
    const response = await apiClient.get<HealthRecord[]>('/health-data');
    return response.data;
  },

  async getHealthRecord(id: string): Promise<HealthRecord> {
    const response = await apiClient.get<HealthRecord>(`/health-data/${id}`);
    return response.data;
  },

  async runAnalysis(recordId: string): Promise<MLAnalysisResult> {
    const response = await apiClient.post<MLAnalysisResult>('/ml-analysis', { recordId });
    return response.data;
  },

  async getAnalysisResult(id: string): Promise<MLAnalysisResult> {
    const response = await apiClient.get<MLAnalysisResult>(`/ml-analysis/${id}`);
    return response.data;
  },

  async getAnalysisHistory(): Promise<MLAnalysisResult[]> {
    const response = await apiClient.get<MLAnalysisResult[]>('/ml-analysis/history');
    return response.data;
  }
};
