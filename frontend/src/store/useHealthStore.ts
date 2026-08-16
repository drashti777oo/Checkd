import { create } from 'zustand';
import { VitalMetrics } from '../types/health';

interface HealthState {
  activeMetrics: VitalMetrics | null;
  setActiveMetrics: (metrics: VitalMetrics | null) => void;
  resetState: () => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  activeMetrics: null,
  setActiveMetrics: (metrics) => set({ activeMetrics: metrics }),
  resetState: () => set({ activeMetrics: null }),
}));
