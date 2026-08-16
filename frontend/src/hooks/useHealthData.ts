import { useState, useEffect } from 'react';
import { HealthRecord } from '../types/health';
import { healthService } from '../services/health.service';

export function useHealthData() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await healthService.getRecords();
      setRecords(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return { records, loading, error, refresh: fetchRecords };
}
