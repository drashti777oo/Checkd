import { useState, useEffect } from 'react';
import { HealthRecordResponse } from '../types/health';
import { healthService } from '../services/health.service';

export function useHealthData() {
  const [records, setRecords] = useState<HealthRecordResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async (page: number = 1, pageSize: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthService.listHealthRecords(page, pageSize);
      setRecords(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return { records, total, loading, error, refresh: fetchRecords };
}
