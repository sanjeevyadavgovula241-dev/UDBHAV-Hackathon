import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col relative">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-500 text-sm font-medium tracking-wide uppercase">{title}</h3>
        {Icon && <div className="text-indigo-500 bg-indigo-50 p-2 rounded-lg"><Icon size={20} /></div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
      </div>
      {(subtitle || trend) && (
        <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
          {trend && (
            <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${trend > 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
