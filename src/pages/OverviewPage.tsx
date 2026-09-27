import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, MapPin, Wheat, Sliders } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { MetricCard } from '../components/MetricCard';
import { LocationSelector } from '../components/LocationSelector';
import { SectionHeader } from '../components/SectionHeader';
import { WeatherMap } from '../components/map/WeatherMap';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { PanchayatDetailDrawer } from '../components/PanchayatDetailDrawer';
import { computeSimpleRisk } from '../services/weatherMapService';
import { getBlockWeather } from '../services/weatherService';
import { getPanchayats, getAllPanchayatWeather } from '../services/panchayatService';
import { useLanguage } from '../context/LanguageContext';
import type { WeatherForecast, Panchayat, PanchayatWeather, UserRole } from '../types';

// New feature components
import { RoleToggle } from '../components/RoleToggle';
import { VoiceForecastButton } from '../components/VoiceForecastButton';
import { FeedbackVerificationCard } from '../components/FeedbackVerificationCard';
import { WaterloggingReport } from '../components/WaterloggingReport';
import { CommunityFeedbackMetrics } from '../components/CommunityFeedbackMetrics';
import { ConfidenceIndicator } from '../components/ConfidenceIndicator';
import { ForecastUncertaintyChart } from '../components/ForecastUncertaintyChart';
import { HistoricalRainfallChart } from '../components/HistoricalRainfallChart';
import { OfficerRiskOverview } from '../components/OfficerRiskOverview';

export function OverviewPage() {
  const navigate = useNavigate();
  const { language, t, formatCrop, formatStage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [panchayatWeather, setPanchayatWeather] = useState<Record<string, PanchayatWeather>>({});
  const [selectedPanchayat, setSelectedPanchayat] = useState<Panchayat | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [role, setRole] = useState<UserRole>('farmer');

  // Location state
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [block, setBlock] = useState('Junnar');

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

  if (loading || !weather) return <LoadingState message="Loading overview..." />;

  const pipelineSteps = [
    {
      label: language === 'mr' ? 'तालुका अंदाज' : 'Block Forecast',
      desc: language === 'mr' ? 'IMD अंदाज (३१.०°से)' : 'IMD coarse forecast (31.0°C)',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      label: language === 'mr' ? '१-किमी जाळी' : '1 km Downscaling',
      desc: language === 'mr' ? 'सूक्ष्म पृथक्करण मॉडेल' : 'Spatial refinement mesh',
      color: 'bg-violet-100 text-violet-700 border-violet-200',
    },
    {
      label: language === 'mr' ? 'गाव अंदाज' : 'Panchayat Forecast',
      desc: language === 'mr' ? 'स्थानिक हवामान तपशील' : 'Localized boundary weather',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      label: language === 'mr' ? 'पिकांचा धोका' : 'Crop Risk',
      desc: language === 'mr' ? 'वाढ व हवामान जोखीम' : 'Stage-based vulnerability',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      label: language === 'mr' ? 'शेती सल्ला' : 'Advisory',
      desc: language === 'mr' ? 'तातडीचे शेती मार्गदर्शन' : 'Actionable guidance',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
    },
  ];

  const selectedW = selectedPanchayat ? panchayatWeather[selectedPanchayat.id] : null;
  const activePanchayat = selectedPanchayat ?? panchayats[0];
  const activeW = selectedW ?? (panchayats[0] ? panchayatWeather[panchayats[0].id] : null);

  const handlePanchayatSelect = (p: Panchayat | null) => {
    setSelectedPanchayat(p);
    if (p) {
      setIsDrawerOpen(true);
    }
  };

  return (
    <div>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-emerald-600">Gram</span>
              <span className="text-sky-600">Rutu</span>
            </span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              1-km Micro-Climate
            </span>
          </div>
        }
        subtitle={t('app.subtitle')}
        actions={<RoleToggle role={role} onRoleChange={setRole} />}
      />

      {/* Location Selector */}
      <div className="bg-white border border-gray-200 rounded-md px-5 py-4 mb-6">
        <LocationSelector
          state={state}
          district={district}
          block={block}
          onStateChange={setState}
          onDistrictChange={setDistrict}
          onBlockChange={setBlock}
        />
      </div>

      {/* ========== OFFICER MODE ========== */}
      {role === 'officer' ? (
        <>
          {/* Map still visible in officer mode */}
          <div className="mb-6">
            <SectionHeader
              title={language === 'mr' ? 'आधुनिक हवामान नकाशा' : 'Advanced Weather Map'}
              description={
                language === 'mr'
                  ? '१-किमी जाळी आणि गाव सीमांवर आधारित स्थानिक हवामान चल आणि जोखीम'
                  : 'Interactive downscaled weather variables at 1-km grid and Panchayat boundary levels'
              }
            />
            <div className="mt-3">
              <WeatherMap
                initialLayer="risk"
                initialShowGrid={false}
                initialShowPanchayats={true}
                selectedPanchayatId={selectedPanchayat?.id}
                onPanchayatSelect={handlePanchayatSelect}
                height="400px"
              />
            </div>
          </div>

          {/* Officer Risk Overview */}
          <OfficerRiskOverview
            panchayats={panchayats}
            panchayatWeather={panchayatWeather}
          />
        </>
      ) : (
        <>
          {/* ========== FARMER MODE (existing + enhancements) ========== */}

          {/* Block Coarse Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label={language === 'mr' ? 'तालुका तापमान' : 'Block Temperature'}
              value={weather.temperature}
              unit="°C"
              icon="temperature"
              accent="orange"
              description={
                language === 'mr'
                  ? `IMD अंदाज · किमान ${weather.temperatureMin}°C · कमाल ${weather.temperatureMax}°C`
                  : `IMD Coarse · Min ${weather.temperatureMin}°C · Max ${weather.temperatureMax}°C`
              }
            />
            <MetricCard
              label={language === 'mr' ? 'अपेक्षित पाऊस' : 'Expected Rainfall'}
              value={weather.rainfall}
              unit="mm"
              icon="rainfall"
              accent="blue"
              description={
                language === 'mr' && weather.condition === 'Partly Cloudy'
                  ? 'अंशतः ढगाळ वातावरण'
                  : weather.condition
              }
            />
            <MetricCard
              label={language === 'mr' ? 'आर्द्रता व वारा' : 'Humidity & Wind'}
              value={weather.humidity}
              unit="%"
              icon="humidity"
              accent="green"
              description={
                language === 'mr'
                  ? `वारा ${weather.windSpeed} किमी/तास (${weather.windDirection})`
                  : `Wind ${weather.windSpeed} km/h ${weather.windDirection}`
              }
            />
            <MetricCard
              label={language === 'mr' ? 'विश्लेषित ग्रामपंचायती' : 'Panchayats Analyzed'}
              value={panchayats.length}
              icon="panchayats"
              accent="green"
              description={
                language === 'mr'
                  ? `${block} तालुका · १-किमी सूक्ष्म जाळी`
                  : `${block} Block · 1-km Mesh`
              }
            />
          </div>

          {/* Voice Forecast Button */}
          <div className="mb-6">
            <VoiceForecastButton
              weather={activeW}
              panchayatName={activePanchayat?.name ?? 'Junnar'}
            />
          </div>

          {/* Advanced Weather Map (Centerpiece Geospatial Application) */}
          <div className="mb-6">
            <SectionHeader
              title={language === 'mr' ? 'आधुनिक हवामान नकाशा' : 'Advanced Weather Map'}
              description={
                language === 'mr'
                  ? '१-किमी जाळी आणि गाव सीमांवर आधारित स्थानिक हवामान चल आणि जोखीम'
                  : 'Interactive downscaled weather variables at 1-km grid and Panchayat boundary levels'
              }
            />

            <div className="mt-3">
              <WeatherMap
                initialLayer="temperature"
                initialShowGrid={true}
                initialShowPanchayats={true}
                selectedPanchayatId={selectedPanchayat?.id}
                onPanchayatSelect={handlePanchayatSelect}
                height="560px"
              />
            </div>
          </div>

          {/* Contextual Selected Panchayat Strip (When clicked) */}
          {selectedPanchayat && selectedW && (
            <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-6 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span>{selectedPanchayat.name}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({selectedPanchayat.block} Block, {selectedPanchayat.district})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'mr'
                        ? `उंची ${selectedPanchayat.elevation} मी · क्षेत्र ${selectedPanchayat.area} चौ.किमी · लोकसंख्या ${selectedPanchayat.population.toLocaleString()}`
                        : `Elevation ${selectedPanchayat.elevation}m · Area ${selectedPanchayat.area} km² · Population ${selectedPanchayat.population.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <RiskBadge level={selectedW.risk ?? computeSimpleRisk(selectedW)} />

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {language === 'mr' ? 'तपशील दालन व सिम्युलेटर' : 'Open Detail Drawer & What-If'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/panchayats')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                  >
                    <span>{language === 'mr' ? 'संपूर्ण माहिती' : 'Panchayat Explorer'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'mr' ? 'स्थानिक तापमान' : 'Localized Temp'}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{selectedW.temperature}°C</span>
                  <span className="text-[10px] text-slate-500 block">
                    {selectedW.downscalingDiff !== undefined
                      ? `${selectedW.downscalingDiff > 0 ? '+' : ''}${selectedW.downscalingDiff.toFixed(1)}° vs Block`
                      : ''}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'mr' ? 'स्थानिक पाऊस' : 'Precipitation'}
                  </span>
                  <span className="text-sm font-bold text-blue-700">{selectedW.rainfall} mm</span>
                  <span className="text-[10px] text-slate-500 block">{selectedW.condition}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'mr' ? 'आर्द्रता' : 'Humidity'}
                  </span>
                  <span className="text-sm font-bold text-violet-700">{selectedW.humidity}%</span>
                  <span className="text-[10px] text-slate-500 block">RH Level</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'mr' ? 'वारा' : 'Wind'}
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {selectedW.wind ?? selectedW.windSpeed} km/h
                  </span>
                  <span className="text-[10px] text-slate-500 block">{selectedW.windDirection}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'mr' ? 'प्रमुख पीक' : 'Primary Crop'}
                  </span>
                  <span className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                    <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatCrop(selectedW.crop ?? 'Tomato')}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {formatStage(selectedW.growthStage ?? 'Flowering')}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">
                    {language === 'mr' ? 'मॉडेल अचूकता' : 'Model Confidence'}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    {(selectedW.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Spatial Refinement</span>
                </div>
              </div>
            </div>
          )}

          {/* Uncertainty & Confidence Row */}
          {activeW && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <ForecastUncertaintyChart rainfall={activeW.rainfall} />
              </div>
              <ConfidenceIndicator
                confidence={activeW.confidence}
                panchayatName={activePanchayat?.name}
                elevation={activePanchayat?.elevation}
              />
            </div>
          )}

          {/* Community Verification Section */}
          {activePanchayat && activeW && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <FeedbackVerificationCard
                  key={activePanchayat.id}
                  panchayatId={activePanchayat.id}
                />
                <WaterloggingReport />
              </div>
              <CommunityFeedbackMetrics
                panchayatId={activePanchayat.id}
                confidence={activeW.confidence}
              />
            </div>
          )}

          {/* Historical Rainfall */}
          <div className="mb-6">
            <HistoricalRainfallChart />
          </div>

          {/* How It Works Pipeline */}
          <SectionHeader
            title={language === 'mr' ? 'प्रणाली कशी कार्य करते?' : 'How It Works'}
            description={
              language === 'mr'
                ? 'हवामान पृथक्करण आणि शेती सल्ला टप्पे'
                : 'The downscaling and advisory pipeline'
            }
          />
          <div className="bg-white border border-gray-200 rounded-md px-6 py-5">
            <div className="flex items-center justify-between overflow-x-auto gap-2">
              {pipelineSteps.map((step, i) => (
                <div key={step.label} className="flex items-center shrink-0">
                  <div
                    className={`border rounded-md px-4 py-3 text-center min-w-[145px] ${step.color}`}
                  >
                    <p className="text-sm font-semibold">{step.label}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">{step.desc}</p>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <ChevronDown className="w-5 h-5 text-slate-300 mx-3 rotate-[-90deg] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Detailed Slide-out Drawer */}
      <PanchayatDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        panchayat={selectedPanchayat}
        weather={selectedW}
        blockTemp={weather.temperature}
        blockRain={weather.rainfall}
      />
    </div>
  );
}
