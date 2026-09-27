import { useState, useEffect } from 'react';
import { Search, Sliders } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { MetricCard } from '../components/MetricCard';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/LoadingState';
import { MapContainerComponent } from '../components/map/MapContainerComponent';
import { PanchayatLayer } from '../components/map/PanchayatLayer';
import { MapLegend, LayerControl } from '../components/map/MapLegend';
import { PanchayatDetailDrawer } from '../components/PanchayatDetailDrawer';
import { computeSimpleRisk } from '../services/weatherMapService';
import { getPanchayats, getAllPanchayatWeather, getPanchayatWeather } from '../services/panchayatService';
import { useLanguage } from '../context/LanguageContext';
import type { Panchayat, PanchayatWeather, MapLayer, RiskLevel } from '../types';

export function PanchayatExplorerPage() {
  const { language, formatCrop, formatStage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [allWeather, setAllWeather] = useState<Record<string, PanchayatWeather>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPanchayat, setSelectedPanchayat] = useState<Panchayat | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<PanchayatWeather | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('temperature');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const p = await getPanchayats();
      setPanchayats(p);
      setAllWeather(getAllPanchayatWeather());
      setLoading(false);
    }
    load();
  }, []);

  const handleSelectPanchayat = async (p: Panchayat) => {
    setSelectedPanchayat(p);
    const w = await getPanchayatWeather(p.id);
    setSelectedWeather(w ?? null);
  };

  const filteredPanchayats = searchQuery.trim()
    ? panchayats.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.block.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : panchayats;

  if (loading) {
    return <LoadingState message={language === 'mr' ? 'माहिती लोड होत आहे...' : 'Loading panchayat data...'} />;
  }

  const chartData = selectedWeather
    ? [
        {
          period: language === 'mr' ? 'सध्या' : 'Current',
          temp: selectedWeather.temperature,
          rainfall: selectedWeather.rainfall,
          humidity: selectedWeather.humidity,
        },
        ...selectedWeather.forecasts.map((f) => ({
          period:
            language === 'mr'
              ? f.period === '24h'
                ? '२४ तास'
                : f.period === '48h'
                ? '४८ तास'
                : '५ दिवस'
              : f.label.replace('Next ', '').replace(' Outlook', ''),
          temp: f.temperature,
          rainfall: f.rainfall,
          humidity: f.humidity,
        })),
      ]
    : [];

  // Compute risks for selected panchayat
  const risks: { type: string; level: RiskLevel; detail: string }[] = [];
  if (selectedWeather) {
    const w = selectedWeather;
    risks.push({
      type: language === 'mr' ? 'उष्णता ताण' : 'Heat Stress',
      level: w.temperature > 33 ? 'High' : w.temperature > 30 ? 'Moderate' : 'Low',
      detail: `${w.temperature}°C`,
    });
    risks.push({
      type: language === 'mr' ? 'स्थानिक पर्जन्य' : 'Rainfall',
      level: w.rainfall > 50 ? 'High' : w.rainfall > 25 ? 'Moderate' : 'Low',
      detail: `${w.rainfall} mm`,
    });
    risks.push({
      type: language === 'mr' ? 'पाणी साचणे (Waterlogging)' : 'Waterlogging',
      level: w.rainfall > 60 ? 'Severe' : w.rainfall > 35 ? 'Moderate' : 'Low',
      detail:
        w.rainfall > 35
          ? language === 'mr'
            ? 'पाण्याचा निचरा तपासा'
            : 'Monitor drainage'
          : language === 'mr'
          ? 'धोका नाही'
          : 'No concern',
    });
    risks.push({
      type: language === 'mr' ? 'एकत्रित पीक जोखीम' : 'Crop Weather Risk',
      level: w.risk ?? computeSimpleRisk(w),
      detail: language === 'mr' ? 'एकूण मूल्यांकन' : 'Combined assessment',
    });
  }

  return (
    <div>
      <PageHeader
        title={language === 'mr' ? 'ग्रामपंचायत हवामान दर्शक' : 'Panchayat Explorer'}
        subtitle={
          language === 'mr'
            ? 'प्रत्येक गावातील सूक्ष्म हवामान, पीक स्थिती आणि धोक्यांची सविस्तर पाहणी'
            : 'Explore localized weather at Panchayat level'
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left — Search + List */}
        <div>
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'ग्रामपंचायत शोधा...' : 'Search panchayats...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {filteredPanchayats.map((p) => {
              const w = allWeather[p.id];
              const isSelected = selectedPanchayat?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPanchayat(p)}
                  className={`w-full text-left border rounded-md px-3 py-2.5 transition-all duration-150 ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50/30 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">{p.name}</p>
                    {w && <RiskBadge level={w.risk ?? computeSimpleRisk(w)} />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.elevation}m · {p.landCover}
                  </p>
                  {w && (
                    <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                      <span>
                        {w.temperature}°C · {w.rainfall}mm · {w.humidity}%
                      </span>
                      {w.crop && (
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-medium">
                          {formatCrop(w.crop)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
            {filteredPanchayats.length === 0 && (
              <EmptyState
                title={language === 'mr' ? 'ग्रामपंचायत आढळली नाही' : 'No panchayats found'}
                description={language === 'mr' ? 'दुसरा शब्द शोधून पाहा' : 'Try a different search query'}
              />
            )}
          </div>
        </div>

        {/* Center/Right — Map & Analysis */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <LayerControl activeLayer={activeLayer} onLayerChange={setActiveLayer} />
            {selectedPanchayat && selectedWeather && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === 'mr' ? 'फरक व सिम्युलेटर दालन' : 'Why Different & What-If'}
                </span>
              </button>
            )}
          </div>

          <MapContainerComponent height="350px">
            <PanchayatLayer
              panchayats={panchayats}
              weatherData={allWeather}
              selectedId={selectedPanchayat?.id}
              onSelect={handleSelectPanchayat}
              activeLayer={activeLayer}
            />
          </MapContainerComponent>

          <div className="mt-2">
            <MapLegend layer={activeLayer} />
          </div>

          {/* Detail Panel */}
          {selectedPanchayat && selectedWeather ? (
            <div className="mt-5 space-y-5">
              {/* Weather Summary Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <SectionHeader
                  title={`${selectedPanchayat.name} — ${language === 'mr' ? 'हवामान तपशील' : 'Weather'}`}
                  description={`${selectedPanchayat.block} Block · ${selectedPanchayat.district}`}
                />
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <Sliders className="w-3 h-3" />
                  <span>
                    {language === 'mr'
                      ? 'तपशील दालन उघडा ("Why Different" & "What-If")'
                      : 'Open Detailed Drawer & Simulator'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <MetricCard
                  label={language === 'mr' ? 'तापमान' : 'Temperature'}
                  value={selectedWeather.temperature}
                  unit="°C"
                  icon="temperature"
                  accent="orange"
                />
                <MetricCard
                  label={language === 'mr' ? 'पाऊस' : 'Rainfall'}
                  value={selectedWeather.rainfall}
                  unit="mm"
                  icon="rainfall"
                  accent="blue"
                />
                <MetricCard
                  label={language === 'mr' ? 'आर्द्रता' : 'Humidity'}
                  value={selectedWeather.humidity}
                  unit="%"
                  icon="humidity"
                  accent="green"
                />
                <MetricCard
                  label={language === 'mr' ? 'वारा' : 'Wind'}
                  value={selectedWeather.wind ?? selectedWeather.windSpeed}
                  unit="km/h"
                  icon="wind"
                />
              </div>

              {/* Forecast Chart */}
              <SectionHeader
                title={language === 'mr' ? 'हवामान अंदाज' : 'Forecast'}
                description={
                  language === 'mr'
                    ? 'पुढील दिवसांतील तापमान व पाऊस अंदाज'
                    : 'Temperature and rainfall outlook'
                }
              />
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis yAxisId="temp" tick={{ fontSize: 12, fill: '#64748b' }} unit="°C" />
                    <YAxis
                      yAxisId="rain"
                      orientation="right"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      unit="mm"
                    />
                    <RechartsTooltip
                      contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="temp"
                      name={language === 'mr' ? 'तापमान (°C)' : 'Temperature (°C)'}
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: '#f97316', r: 3 }}
                    />
                    <Line
                      yAxisId="rain"
                      type="monotone"
                      dataKey="rainfall"
                      name={language === 'mr' ? 'पाऊस (mm)' : 'Rainfall (mm)'}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Local Factors & Risk Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SectionHeader title={language === 'mr' ? 'स्थानिक घटक' : 'Local Factors'} />
                  <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {language === 'mr' ? 'उंची' : 'Elevation'}
                      </span>
                      <span className="font-medium text-slate-700">
                        {selectedPanchayat.elevation} m
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {language === 'mr' ? 'प्रमुख पीक' : 'Primary Crop'}
                      </span>
                      <span className="font-medium text-slate-700">
                        {formatCrop(selectedWeather.crop ?? 'Tomato')} (
                        {formatStage(selectedWeather.growthStage ?? 'Flowering')})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {language === 'mr' ? 'जमिनीचे आच्छादन' : 'Land Cover'}
                      </span>
                      <span className="font-medium text-slate-700">
                        {selectedPanchayat.landCover}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        {language === 'mr' ? 'क्षेत्रफळ' : 'Area'}
                      </span>
                      <span className="font-medium text-slate-700">
                        {selectedPanchayat.area} km²
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader title={language === 'mr' ? 'धोका सारांश' : 'Risk Summary'} />
                  <div className="bg-white border border-gray-200 rounded-md p-4 space-y-2.5">
                    {risks.map((r) => (
                      <div key={r.type} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600">{r.type}</p>
                          <p className="text-xs text-slate-400">{r.detail}</p>
                        </div>
                        <RiskBadge level={r.level} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title={language === 'mr' ? 'ग्रामपंचायत निवडा' : 'Select a Panchayat'}
                description={
                  language === 'mr'
                    ? 'सविस्तर हवामान व पीक माहिती पाहण्यासाठी नकाशावर किंवा डाव्या यादीत क्लिक करा'
                    : 'Click on the map or select from the list to view detailed weather information'
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Drawer */}
      <PanchayatDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        panchayat={selectedPanchayat}
        weather={selectedWeather}
        blockTemp={31.0}
        blockRain={12.4}
      />
    </div>
  );
}
