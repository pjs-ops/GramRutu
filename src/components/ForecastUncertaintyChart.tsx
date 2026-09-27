import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import type { UncertaintyPoint } from '../types';

const mockUncertaintyData: UncertaintyPoint[] = [
  { time: '06:00', rainfall: 2, lower: 0, upper: 4 },
  { time: '09:00', rainfall: 5, lower: 2, upper: 8 },
  { time: '12:00', rainfall: 10, lower: 5, upper: 15 },
  { time: '15:00', rainfall: 18, lower: 10, upper: 26 },
  { time: '18:00', rainfall: 12, lower: 6, upper: 18 },
  { time: '21:00', rainfall: 4, lower: 1, upper: 7 },
];

interface ForecastUncertaintyChartProps {
  rainfall?: number;
}

export function ForecastUncertaintyChart({ rainfall }: ForecastUncertaintyChartProps) {
  const { t } = useLanguage();

  const scale = rainfall !== undefined && rainfall > 0 ? rainfall / 42 : 1;

  // Reshape data for Recharts Area band: dynamically scaled to panchayat rainfall
  const chartData = mockUncertaintyData.map((d) => {
    const scaledRain = Math.round(d.rainfall * scale * 10) / 10;
    const scaledLower = Math.max(0, Math.round(d.lower * scale * 10) / 10);
    const scaledUpper = Math.round(d.upper * scale * 10) / 10;
    return {
      time: d.time,
      rainfall: scaledRain,
      lower: scaledLower,
      upper: scaledUpper,
      band: [scaledLower, scaledUpper] as [number, number],
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-700">{t('uncertainty.title')}</p>
        <p className="text-xs text-slate-400 mt-0.5">{t('uncertainty.subtitle')}</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            unit=" mm"
            domain={[0, 'auto']}
          />
          <RechartsTooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {/* Uncertainty band */}
          <Area
            type="monotone"
            dataKey="band"
            name="Uncertainty Range"
            fill="#3b82f6"
            fillOpacity={0.12}
            stroke="none"
          />
          {/* Upper bound line */}
          <Line
            type="monotone"
            dataKey="upper"
            name="Upper Bound"
            stroke="#93c5fd"
            strokeWidth={1}
            strokeDasharray="4 3"
            dot={false}
          />
          {/* Lower bound line */}
          <Line
            type="monotone"
            dataKey="lower"
            name="Lower Bound"
            stroke="#93c5fd"
            strokeWidth={1}
            strokeDasharray="4 3"
            dot={false}
          />
          {/* Main forecast line */}
          <Line
            type="monotone"
            dataKey="rainfall"
            name="Forecast (mm)"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ fill: '#2563eb', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
