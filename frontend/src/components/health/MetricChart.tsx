import React from 'react';

export const MetricChart: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 h-48 flex items-center justify-center text-slate-400">
      <span>[{label} Metric Time-Series Chart Placeholder]</span>
    </div>
  );
};
