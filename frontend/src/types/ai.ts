export interface AIExplanationRequest {
  analysisId: string;
}

export interface AIExplanationResponse {
  analysisId: string;
  explanation: string;
  keyTakeaways: string[];
  suggestedNextSteps: string[];
}
