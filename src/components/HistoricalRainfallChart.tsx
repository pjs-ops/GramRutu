import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import historicalData from '../data/historicalRainfall.json';
import type { SeasonRainfallComparison } from '../types';

export function HistoricalRainfallChart() {
  const { t, language } = useLanguage();

  const chartData: SeasonRainfallComparison[] = historicalData.historical.map((h, i) => ({
    month: h.month,
    historical: h.rainfall,
    current: historicalData.currentSeason[i]?.rainfall ?? 0,
  }));

  // Calculate overall anomaly
  const totalHistorical = historicalData.historical.reduce((sum, h) => sum + h.rainfall, 0);
  const totalCurrent = historicalData.currentSeason.reduce((sum, c) => sum + c.rainfall, 0);
  const anomalyPct = ((totalCurrent - totalHistorical) / totalHistorical) * 100;
  const anomalySign = anomalyPct >= 0 ? '+' : '';
  const isAbove = anomalyPct >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">{t('historical.title')}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t('historical.subtitle')}</p>
        </div>
        {/* Anomaly badge */}
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            {t('historical.anomaly')}
          </p>
          <p className={`text-lg font-bold ${isAbove ? 'text-blue-700' : 'text-amber-700'}`}>
            {anomalySign}{anomalyPct.toFixed(0)}%
          </p>
          <p className="text-[10px] text-slate-500">
            {isAbove ? t('historical.above') : t('historical.below')}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" mm" />
          <RechartsTooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="historical"
            name={language === 'mr' ? 'ऐतिहासिक सरासरी' : 'Historical Avg'}
            fill="#94a3b8"
            radius={[3, 3, 0, 0]}
            barSize={20}
          />
          <Bar
            dataKey="current"
            name={language === 'mr' ? 'चालू हंगाम' : 'Current Season'}
            fill="#3b82f6"
            radius={[3, 3, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-slate-400 mt-2 italic text-right">
        {t('historical.prototype')}
      </p>
    </div>
  );
}
