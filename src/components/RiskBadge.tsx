import type { RiskLevel } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

const colors: Record<RiskLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Severe: 'bg-red-50 text-red-700 border-red-200',
};

const dots: Record<RiskLevel, string> = {
  Low: 'bg-emerald-500',
  Moderate: 'bg-amber-500',
  High: 'bg-orange-500',
  Severe: 'bg-red-500',
};

export function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const { formatRisk } = useLanguage();
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-medium ${colors[level] ?? colors.Low} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[level] ?? dots.Low}`} />
      {formatRisk(level)}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const statusColors = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${statusColors[variant]}`}
    >
      {status}
    </span>
  );
}
