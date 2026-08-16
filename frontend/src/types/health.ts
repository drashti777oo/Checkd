export interface HealthDataInput {
  symptoms?: string;
  fileUrl?: string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  date: string;
  status: 'Healthy' | 'Attention Needed' | 'Critical';
  type: string;
  score: number;
}

export interface AnalysisFinding {
  id: string;
  text: string;
  type: 'positive' | 'neutral' | 'negative';
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  explanation: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface MLAnalysisResult {
  id: string;
  recordId: string;
  score: number;
  status: string;
  findings: AnalysisFinding[];
  recommendations: Recommendation[];
}
