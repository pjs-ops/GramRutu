import type { ReactNode } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  temperature: Thermometer,
  thermometer: Thermometer,
  rainfall: CloudRain,
  rain: CloudRain,
  humidity: Droplets,
  droplets: Droplets,
  wind: Wind,
  panchayats: MapPin,
  mappin: MapPin,
  chart: BarChart3,
  barchart: BarChart3,
};

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  accent?: 'default' | 'green' | 'blue' | 'orange' | 'red';
  children?: ReactNode;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  trend,
  description,
  accent = 'default',
  children,
}: MetricCardProps) {
  const IconComp = icon ? iconMap[icon.toLowerCase()] : null;

  const accentColors = {
    default: 'border-gray-200',
    green: 'border-l-emerald-500 border-l-2',
    blue: 'border-l-blue-500 border-l-2',
    orange: 'border-l-orange-500 border-l-2',
    red: 'border-l-red-500 border-l-2',
  };

  const iconBgColors = {
    default: 'bg-gray-100 text-slate-600',
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div
      className={`bg-white border ${accentColors[accent]} rounded-md px-4 py-3 hover:shadow-sm transition-shadow duration-150`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-slate-800">{value}</span>
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
            {trend && (
              <span className="ml-1">
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-red-500 inline" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-blue-500 inline" />}
                {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400 inline" />}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
        </div>
        {IconComp && (
          <div className={`w-9 h-9 rounded-md flex items-center justify-center ${iconBgColors[accent]}`}>
            <IconComp className="w-[18px] h-[18px]" />
          </div>
        )}
      </div>
      {children && <div className="mt-2 pt-2 border-t border-gray-100">{children}</div>}
    </div>
  );
}
