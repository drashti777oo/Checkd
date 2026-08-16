import { apiClient } from './api';
import { DailyCheckInCreate, DailyCheckInResponse, DailyCheckInListResponse } from '../types/checkin';

export const checkinService = {
  async submitCheckIn(data: DailyCheckInCreate): Promise<DailyCheckInResponse> {
    const response = await apiClient.post<DailyCheckInResponse>('/checkin', data);
    return response.data;
  },

  async getTodayCheckIn(): Promise<DailyCheckInResponse | null> {
    const response = await apiClient.get<DailyCheckInResponse | null>('/checkin/today');
    return response.data;
  },

  async getCheckInHistory(limit: number = 30): Promise<DailyCheckInListResponse> {
    const response = await apiClient.get<DailyCheckInListResponse>('/checkin/history', {
      params: { limit },
    });
    return response.data;
  },
};
