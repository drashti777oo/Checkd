export function formatBloodPressure(systolic?: number, diastolic?: number): string {
  if (!systolic || !diastolic) return 'N/A';
  return `${systolic}/${diastolic} mmHg`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
