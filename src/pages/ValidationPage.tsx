import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { MetricCard } from '../components/MetricCard';
import { SectionHeader } from '../components/SectionHeader';
import { DataTable, type Column } from '../components/DataTable';
import { StatusBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { getValidationMetrics, getValidationData } from '../services/modelService';
import type { ValidationMetrics, ModelPrediction } from '../types';

export function ValidationPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [data, setData] = useState<ModelPrediction[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [m, d] = await Promise.all([getValidationMetrics(), getValidationData()]);
      setMetrics(m);
      setData(d);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !metrics) return <LoadingState message="Loading validation data..." />;

  const scatterData = data.map((d) => ({
    observed: d.observed,
    predicted: d.downscaledForecast,
    location: d.location,
    date: d.date,
  }));

  // For the line chart - group by unique dates
  const uniqueDates = [...new Set(data.map((d) => d.date))].sort();
  const lineData = uniqueDates.map((date) => {
    const entries = data.filter((d) => d.date === date);
    const avgCoarse = entries.reduce((s, e) => s + e.coarseForecast, 0) / entries.length;
    const avgDown = entries.reduce((s, e) => s + e.downscaledForecast, 0) / entries.length;
    const avgObs = entries.reduce((s, e) => s + e.observed, 0) / entries.length;
    return {
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      coarseForecast: Number(avgCoarse.toFixed(1)),
      downscaled: Number(avgDown.toFixed(1)),
      observed: Number(avgObs.toFixed(1)),
    };
  });

  const tableColumns: Column<ModelPrediction>[] = [
    { key: 'date', header: 'Date', sortable: true, render: (r) => (
      <span>{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    )},
    { key: 'location', header: 'Location', sortable: true },
    { key: 'observed', header: 'Observed (°C)', align: 'right', sortable: true, render: (r) => <span className="font-medium">{r.observed.toFixed(1)}</span> },
    { key: 'coarseForecast', header: 'Coarse Forecast (°C)', align: 'right', render: (r) => <span className="text-slate-500">{r.coarseForecast.toFixed(1)}</span> },
    { key: 'downscaledForecast', header: 'Downscaled (°C)', align: 'right', render: (r) => <span className="font-medium text-emerald-700">{r.downscaledForecast.toFixed(1)}</span> },
    {
      key: 'error',
      header: 'Error (°C)',
      align: 'right',
      sortable: true,
      render: (r) => {
        const abs = Math.abs(r.error);
        const color = abs > 0.7 ? 'text-orange-600' : abs > 0.4 ? 'text-amber-600' : 'text-emerald-600';
        return <span className={`font-medium ${color}`}>{r.error > 0 ? '+' : ''}{r.error.toFixed(1)}</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Model Validation"
        subtitle="Evaluation of downscaling model performance against observed data"
        actions={
          <StatusBadge status="Prototype Values" variant="warning" />
        }
      />

      {/* Prototype Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-6 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">Prototype Evaluation Metrics</p>
          <p className="text-xs text-amber-700 mt-0.5">{metrics.note}</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="MAE"
          value={metrics.mae.toFixed(2)}
          unit="°C"
          icon="chart"
          accent="blue"
          description="Mean Absolute Error"
        />
        <MetricCard
          label="RMSE"
          value={metrics.rmse.toFixed(2)}
          unit="°C"
          icon="chart"
          accent="orange"
          description="Root Mean Square Error"
        />
        <MetricCard
          label="R²"
          value={metrics.r2.toFixed(2)}
          icon="chart"
          accent="green"
          description="Coefficient of Determination"
        />
        <MetricCard
          label="Bias"
          value={metrics.bias > 0 ? `+${metrics.bias.toFixed(2)}` : metrics.bias.toFixed(2)}
          unit="°C"
          icon="chart"
          description={`Sample size: ${metrics.sampleSize}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Observed vs Predicted */}
        <div>
          <SectionHeader
            title="Observed vs Predicted Temperature"
            description="Each point is a location-date pair"
          />
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="observed"
                  name="Observed"
                  unit="°C"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={[23, 36]}
                  label={{ value: 'Observed (°C)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted"
                  unit="°C"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={[23, 36]}
                  label={{ value: 'Predicted (°C)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#94a3b8' }}
                />
                <ReferenceLine
                  segment={[{ x: 23, y: 23 }, { x: 36, y: 36 }]}
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
                <RechartsTooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
                  formatter={(value) => [`${Number(value).toFixed(1)}°C`, '']}
                  labelFormatter={() => ''}
                />
                <Scatter data={scatterData} fill="#16a34a" fillOpacity={0.7} r={4} />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-400 text-center mt-1">
              Dashed line = perfect prediction. Points closer to the line indicate better accuracy.
            </p>
          </div>
        </div>

        {/* Coarse vs Downscaled */}
        <div>
          <SectionHeader
            title="Coarse vs Downscaled Forecast"
            description="Averaged across all locations per date"
          />
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="°C" domain={['auto', 'auto']} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="observed"
                  name="Observed"
                  stroke="#1e293b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#1e293b' }}
                />
                <Line
                  type="monotone"
                  dataKey="coarseForecast"
                  name="Coarse Forecast"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={{ r: 2.5, fill: '#94a3b8' }}
                />
                <Line
                  type="monotone"
                  dataKey="downscaled"
                  name="Downscaled"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#16a34a' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-400 text-center mt-1">
              The downscaled forecast (green) should track observed values (dark) more closely than the coarse forecast (gray).
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <SectionHeader title="Validation Data" description={metrics.period} />
      <div className="mb-6">
        <DataTable
          columns={tableColumns}
          data={data}
          rowKey={(r) => `${r.date}-${r.location}`}
          compact
        />
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-md px-5 py-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Model performance will be evaluated by comparing localized predictions against
          independent observed weather data. The metrics above (MAE, RMSE, R², Bias) measure
          different aspects of prediction accuracy. The goal of downscaling is to produce
          forecasts that are closer to actual observations than the original coarse block-level
          forecast.
        </p>
      </div>
    </div>
  );
}
