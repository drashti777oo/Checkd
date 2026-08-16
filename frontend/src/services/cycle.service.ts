import { apiClient } from './api';
import {
  CycleLogCreate,
  CycleLogResponse,
  CycleLogListResponse,
  CyclePredictionResponse,
} from '../types/cycle';

export const cycleService = {
  async logCycle(data: CycleLogCreate): Promise<CycleLogResponse> {
    const response = await apiClient.post<CycleLogResponse>('/cycle/log', data);
    return response.data;
  },

  async listCycleLogs(): Promise<CycleLogListResponse> {
    const response = await apiClient.get<CycleLogListResponse>('/cycle/logs');
    return response.data;
  },

  async getCyclePrediction(): Promise<CyclePredictionResponse> {
    const response = await apiClient.get<CyclePredictionResponse>('/cycle/prediction');
    return response.data;
  },

  async deleteCycleLog(logId: string): Promise<void> {
    await apiClient.delete(`/cycle/log/${logId}`);
  },
};
