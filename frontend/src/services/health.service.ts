import { apiClient } from './api';
import {
  HealthRecordCreate,
  HealthRecordResponse,
  HealthRecordListResponse,
} from '../types/health';

export const healthService = {
  async createHealthRecord(data: HealthRecordCreate): Promise<HealthRecordResponse> {
    const response = await apiClient.post<HealthRecordResponse>('/health/records', data);
    return response.data;
  },

  async uploadHealthRecord(file: File, symptoms?: string): Promise<HealthRecordResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (symptoms) {
      formData.append('symptoms', symptoms);
    }
    const response = await apiClient.post<HealthRecordResponse>('/health/records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async listHealthRecords(page: number = 1, pageSize: number = 20): Promise<HealthRecordListResponse> {
    const response = await apiClient.get<HealthRecordListResponse>('/health/records', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  async getHealthRecord(recordId: string): Promise<HealthRecordResponse> {
    const response = await apiClient.get<HealthRecordResponse>(`/health/records/${recordId}`);
    return response.data;
  },

  async deleteHealthRecord(recordId: string): Promise<void> {
    await apiClient.delete(`/health/records/${recordId}`);
  },
};
