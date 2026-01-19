
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; isUp: boolean };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, color = 'purple' }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <div className={`h-1 w-full bg-${color}-100 mt-4 rounded-full overflow-hidden`}>
        <div className={`h-full bg-${color}-600 w-2/3`}></div>
      </div>
    </div>
  );
};

export default StatCard;
