export interface VitalMetrics {
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  temperature?: number;
  stepsCount?: number;
  recordedAt: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  recordType: 'vitals' | 'symptom_scan' | 'lab_report';
  metrics: VitalMetrics;
  notes?: string;
  createdAt: string;
}
