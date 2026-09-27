import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'indigo' | 'slate';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'slate',
  badge,
}) => {
  const styles = {
    emerald: {
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      text: 'text-emerald-700',
      bar: 'bg-emerald-600',
    },
    amber: {
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
    },
    rose: {
      border: 'border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
      text: 'text-rose-700',
      bar: 'bg-rose-600',
    },
    blue: {
      border: 'border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
      text: 'text-blue-700',
      bar: 'bg-blue-600',
    },
    indigo: {
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-700',
      text: 'text-indigo-700',
      bar: 'bg-indigo-600',
    },
    slate: {
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      text: 'text-slate-800',
      bar: 'bg-slate-700',
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-5 border ${styles.border} shadow-2xs hover:shadow-xs transition-all duration-200`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {badge}
              </span>
            )}
          </div>
          <h3 className={`text-2xl font-black font-mono tracking-tight ${styles.text}`}>
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`shrink-0 w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${styles.bar}`} />
    </div>
  );
};
