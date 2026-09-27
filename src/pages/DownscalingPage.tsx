import { useState, useEffect } from 'react';
import {
  Play,
  Loader2,
  Check,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Clock,
  Mountain,
  Gauge,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { DataTable, type Column } from '../components/DataTable';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { MapContainerComponent } from '../components/map/MapContainerComponent';
import { PanchayatLayer } from '../components/map/PanchayatLayer';
import { GridLayer } from '../components/map/GridLayer';
import { computeSimpleRisk } from '../services/weatherMapService';
import { getBlockWeather } from '../services/weatherService';
import { getPanchayats, getAllPanchayatWeather } from '../services/panchayatService';
import { getGridPrediction } from '../services/modelService';
import type {
  WeatherForecast,
  Panchayat,
  PanchayatWeather,
  GridCell,
} from '../types';

type DownscalingState = 'idle' | 'running' | 'complete';

interface PanchayatRow {
  id: string;
  name: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  risk: string;
  confidence: number;
}

export function DownscalingPage() {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [panchayatWeather, setPanchayatWeather] = useState<Record<string, PanchayatWeather>>({});
  const [dsState, setDsState] = useState<DownscalingState>('idle');
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [w, p] = await Promise.all([getBlockWeather(), getPanchayats()]);
      setWeather(w);
      setPanchayats(p);
      setPanchayatWeather(getAllPanchayatWeather());
      setLoading(false);
    }
    load();
  }, []);

  const handleRunDownscaling = async () => {
    setDsState('running');
    setSelectedCell(null);
    const result = await getGridPrediction('junnar-01');
    setGridCells(result.cells);
    setDsState('complete');
  };

  if (loading || !weather) return <LoadingState message="Loading forecast data..." />;

  const panchayatRows: PanchayatRow[] = panchayats.map((p) => {
    const w = panchayatWeather[p.id];
    return {
      id: p.id,
      name: p.name,
      temperature: w?.temperature ?? 0,
      rainfall: w?.rainfall ?? 0,
      humidity: w?.humidity ?? 0,
      risk: w ? computeSimpleRisk(w) : 'Low',
      confidence: w?.confidence ?? 0,
    };
  });

  const tableColumns: Column<PanchayatRow>[] = [
    { key: 'name', header: 'Panchayat', sortable: true },
    {
      key: 'temperature',
      header: 'Temp (°C)',
      sortable: true,
      align: 'right',
      render: (row) => <span className="font-medium">{row.temperature.toFixed(1)}</span>,
    },
    {
      key: 'rainfall',
      header: 'Rainfall (mm)',
      sortable: true,
      align: 'right',
      render: (row) => <span>{row.rainfall.toFixed(1)}</span>,
    },
    {
      key: 'risk',
      header: 'Risk',
      render: (row) => (
        <RiskBadge level={row.risk as 'Low' | 'Moderate' | 'High' | 'Severe'} />
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      align: 'right',
      render: (row) => (
        <span className="text-slate-500">{(row.confidence * 100).toFixed(0)}%</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Weather Downscaling"
        subtitle="Block Forecast → 1 km Grid → Panchayat Forecast"
      />

      {/* Step 1: Block Forecast */}
      <SectionHeader
        title="Step 1 — Block Forecast"
        description="Coarse forecast from IMD for Junnar Block"
        badge="Input"
      />
      <div className="bg-white border border-gray-200 rounded-md p-5 mb-6">
        <div className="grid grid-cols-5 gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-xs text-slate-400">Temperature</p>
              <p className="text-sm font-semibold text-slate-700">{weather.temperature}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-slate-400">Rainfall</p>
              <p className="text-sm font-semibold text-slate-700">{weather.rainfall} mm</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <div>
              <p className="text-xs text-slate-400">Humidity</p>
              <p className="text-sm font-semibold text-slate-700">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Wind</p>
              <p className="text-sm font-semibold text-slate-700">
                {weather.windSpeed} km/h {weather.windDirection}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Forecast Time</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date(weather.timestamp).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRunDownscaling}
          disabled={dsState === 'running'}
          className={`flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-all duration-200 ${
            dsState === 'complete'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : dsState === 'running'
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          {dsState === 'idle' && (
            <>
              <Play className="w-4 h-4" /> Run Downscaling
            </>
          )}
          {dsState === 'running' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </>
          )}
          {dsState === 'complete' && (
            <>
              <Check className="w-4 h-4" /> Downscaling Complete — Run Again
            </>
          )}
        </button>
      </div>

      {/* Step 2 & 3: Grid Map + Cell Details */}
      {dsState !== 'idle' && (
        <>
          <SectionHeader
            title="Step 2 — 1 km Grid"
            description={
              dsState === 'running'
                ? 'Computing grid predictions...'
                : 'Click a grid cell to view local weather details'
            }
            badge="Output"
          />
          {dsState === 'running' ? (
            <div className="mb-6">
              <LoadingState message="Running downscaling model on 3×3 grid..." />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="col-span-2">
                <MapContainerComponent height="380px">
                  <PanchayatLayer
                    panchayats={panchayats}
                    weatherData={panchayatWeather}
                    activeLayer="temperature"
                  />
                  <GridLayer
                    cells={gridCells}
                    selectedCellId={selectedCell?.id}
                    onCellClick={setSelectedCell}
                  />
                </MapContainerComponent>
              </div>

              {/* Cell details panel */}
              <div>
                {selectedCell ? (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Grid Cell Details
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Cell ID: {selectedCell.id}</p>
                    <div className="space-y-3">
                      <DetailRow
                        icon={<Thermometer className="w-4 h-4 text-orange-500" />}
                        label="Temperature"
                        value={`${selectedCell.temperature}°C`}
                      />
                      <DetailRow
                        icon={<CloudRain className="w-4 h-4 text-blue-500" />}
                        label="Rainfall"
                        value={`${selectedCell.rainfall} mm`}
                      />
                      <DetailRow
                        icon={<Droplets className="w-4 h-4 text-cyan-500" />}
                        label="Humidity"
                        value={`${selectedCell.humidity}%`}
                      />
                      <DetailRow
                        icon={<Mountain className="w-4 h-4 text-slate-500" />}
                        label="Elevation"
                        value={`${selectedCell.elevation} m`}
                      />
                      <DetailRow
                        icon={<Gauge className="w-4 h-4 text-emerald-500" />}
                        label="Confidence"
                        value={`${(selectedCell.confidence * 100).toFixed(0)}%`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-md p-8 flex flex-col items-center justify-center text-center h-full">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Thermometer className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Click a grid cell on the map</p>
                    <p className="text-xs text-slate-400 mt-1">to view local weather details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Step 4: Panchayat Aggregation Table */}
      {dsState === 'complete' && (
        <>
          <SectionHeader
            title="Step 3 — Panchayat Aggregation"
            description="Grid predictions aggregated to Panchayat boundaries"
          />
          <div className="mb-6">
            <DataTable
              columns={tableColumns}
              data={panchayatRows}
              rowKey={(r) => r.id}
              compact
            />
          </div>
        </>
      )}

      {/* Step 5: Comparison */}
      {dsState === 'complete' && (
        <>
          <SectionHeader
            title="Step 4 — Forecast Comparison"
            description="Block-level forecast vs localized Panchayat-level forecasts"
          />
          <div className="bg-white border border-gray-200 rounded-md p-5">
            <div className="grid grid-cols-2 gap-8">
              {/* Block */}
              <div className="border-r border-gray-100 pr-8">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Block Forecast (Coarse)
                </p>
                <p className="text-4xl font-bold text-slate-300">{weather.temperature}°C</p>
                <p className="text-xs text-slate-400 mt-1">
                  Single value for entire Junnar Block
                </p>
              </div>
              {/* Panchayats */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Panchayat Forecasts (Localized)
                </p>
                <div className="space-y-1.5">
                  {panchayatRows.map((p) => {
                    const diff = p.temperature - weather.temperature;
                    const diffStr =
                      diff > 0
                        ? `+${diff.toFixed(1)}°C`
                        : diff < 0
                        ? `${diff.toFixed(1)}°C`
                        : '0.0°C';
                    const diffColor =
                      diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-slate-400';
                    return (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{p.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-800">
                            {p.temperature.toFixed(1)}°C
                          </span>
                          <span className={`text-xs font-medium ${diffColor}`}>{diffStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}
