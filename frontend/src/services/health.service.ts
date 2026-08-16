import { apiClient } from './api';
import { HealthRecord, VitalMetrics } from '../types/health';

export const healthService = {
  async getRecords(): Promise<HealthRecord[]> {
    const response = await apiClient.get<HealthRecord[]>('/health/records');
    return response.data;
  },

  async createRecord(metrics: VitalMetrics, notes?: string): Promise<HealthRecord> {
    const response = await apiClient.post<HealthRecord>('/health/records', { metrics, notes });
    return response.data;
  },
};
