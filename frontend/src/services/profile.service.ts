import { apiClient } from './api';
import { HealthProfile, HealthProfileUpdate, OnboardingCompleteRequest } from '../types/profile';

export const profileService = {
  async getHealthProfile(): Promise<HealthProfile> {
    const response = await apiClient.get<HealthProfile>('/profile/health');
    return response.data;
  },

  async updateHealthProfile(data: HealthProfileUpdate): Promise<HealthProfile> {
    const response = await apiClient.patch<HealthProfile>('/profile/health', data);
    return response.data;
  },

  async completeOnboarding(data: OnboardingCompleteRequest): Promise<HealthProfile> {
    const response = await apiClient.post<HealthProfile>('/profile/health/onboarding/complete', data);
    return response.data;
  },
};
