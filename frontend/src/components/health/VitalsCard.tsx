import React from 'react';

interface VitalsCardProps {
  title: string;
  value: string | number;
  unit: string;
  status?: 'normal' | 'warning' | 'alert';
}

export const VitalsCard: React.FC<VitalsCardProps> = ({ title, value, unit, status = 'normal' }) => {
  const statusColors = {
    normal: 'border-l-4 border-health-500',
    warning: 'border-l-4 border-amber-500',
    alert: 'border-l-4 border-red-500',
  };

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border border-slate-200 ${statusColors[status]}`}>
      <span className="text-xs uppercase text-slate-500 font-semibold">{title}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
    </div>
  );
};
