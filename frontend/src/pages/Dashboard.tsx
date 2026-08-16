import React from 'react';
import { VitalsCard } from '../components/health/VitalsCard';
import { MetricChart } from '../components/health/MetricChart';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Health Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VitalsCard title="Heart Rate" value={72} unit="BPM" status="normal" />
        <VitalsCard title="Blood Pressure" value="120/80" unit="mmHg" status="normal" />
        <VitalsCard title="SpO2" value={98} unit="%" status="normal" />
      </div>
      <MetricChart label="Heart Rate Trend" />
    </div>
  );
};
