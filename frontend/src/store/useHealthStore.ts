import { create } from 'zustand';
import { HealthRecordResponse } from '../types/health';
import { MLAnalysisResponse, ExplanationResponse, RecommendationResponse } from '../types/ai';

interface HealthState {
  activeRecord: HealthRecordResponse | null;
  activeAnalysis: MLAnalysisResponse | null;
  activeExplanation: ExplanationResponse | null;
  activeRecommendations: RecommendationResponse[];
  setActiveRecord: (record: HealthRecordResponse | null) => void;
  setActiveAnalysis: (analysis: MLAnalysisResponse | null) => void;
  setActiveExplanation: (explanation: ExplanationResponse | null) => void;
  setActiveRecommendations: (recs: RecommendationResponse[]) => void;
  resetState: () => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  activeRecord: null,
  activeAnalysis: null,
  activeExplanation: null,
  activeRecommendations: [],
  setActiveRecord: (record) => set({ activeRecord: record }),
  setActiveAnalysis: (analysis) => set({ activeAnalysis: analysis }),
  setActiveExplanation: (explanation) => set({ activeExplanation: explanation }),
  setActiveRecommendations: (recs) => set({ activeRecommendations: recs }),
  resetState: () => set({
    activeRecord: null,
    activeAnalysis: null,
    activeExplanation: null,
    activeRecommendations: [],
  }),
}));
