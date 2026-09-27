import { useState } from 'react';
import {
  X,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  ChevronRight,
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Wheat,
} from 'lucide-react';
import type { Panchayat, PanchayatWeather } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { RiskBadge } from './RiskBadge';
import { getContributingFactors, computeScenarioRisk } from '../services/scenarioService';

interface PanchayatDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  panchayat: Panchayat | null;
  weather: PanchayatWeather | null;
  blockTemp?: number;
  blockRain?: number;
}

interface DrawerBodyProps {
  panchayat: Panchayat;
  weather: PanchayatWeather;
  blockTemp: number;
  blockRain: number;
  activeTab: 'whyDifferent' | 'whatIf' | 'overview';
}

function PanchayatDrawerBody({
  panchayat,
  weather,
  blockTemp,
  blockRain,
  activeTab,
}: DrawerBodyProps) {
  const { language, t, formatCrop, formatStage } = useLanguage();

  // Scenario Simulator state (reset automatically on new panchayat via key prop)
  const [sliderRainfall, setSliderRainfall] = useState<number>(Math.round(weather.rainfall));
  const [hasRunScenario, setHasRunScenario] = useState<boolean>(false);

  const diffTemp = weather.downscalingDiff ?? +(weather.temperature - blockTemp).toFixed(1);
  const diffRain = +(weather.rainfall - blockRain).toFixed(1);
  const currentRisk = weather.risk ?? 'Moderate';

  const contributingFactors = getContributingFactors(panchayat, weather, blockTemp, blockRain);
  const scenarioResult = computeScenarioRisk(
    weather.rainfall,
    sliderRainfall,
    currentRisk,
    language === 'mr' ? formatCrop(weather.crop ?? 'Tomato') : weather.crop ?? 'Tomato'
  );

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6">
      {/* ============================================================== */}
      {/* FEATURE 2: WHY IS THIS PANCHAYAT DIFFERENT?                    */}
      {/* ============================================================== */}
      {activeTab === 'whyDifferent' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Visual Story Banner: Block -> 1km Grid -> Local Panchayat */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
              {language === 'mr' ? 'स्थानिकीकरण प्रक्रिया' : 'Downscaling Workflow'}
            </p>
            <div className="flex items-center justify-between text-xs text-center gap-1">
              <div className="bg-white border border-slate-200 rounded px-2.5 py-1.5 flex-1 shadow-xs">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {language === 'mr' ? 'तालुका IMD' : 'Block IMD'}
                </span>
                <span className="font-bold text-slate-700">{blockTemp}°C</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="bg-violet-50 border border-violet-200 rounded px-2.5 py-1.5 flex-1">
                <span className="text-[10px] text-violet-600 block font-medium">
                  {language === 'mr' ? '१-किमी जाळी' : '1-km Grid'}
                </span>
                <span className="font-bold text-violet-900">
                  {language === 'mr' ? 'सूक्ष्म मॉडेल' : 'Micro-Scale'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="bg-emerald-50 border border-emerald-300 rounded px-2.5 py-1.5 flex-1">
                <span className="text-[10px] text-emerald-700 block font-medium">
                  {language === 'mr' ? 'स्थानिक गाव' : 'Local Panchayat'}
                </span>
                <span className="font-bold text-emerald-950">{weather.temperature}°C</span>
              </div>
            </div>
          </div>

          {/* Temperature Difference Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>{t('drawer.whyDifferent')}</span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                Δ {diffTemp > 0 ? '+' : ''}
                {diffTemp}°C
              </span>
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-[11px] text-slate-500 block mb-1">
                  {t('drawer.blockForecast')}
                </span>
                <span className="text-lg font-bold text-slate-600 font-mono">{blockTemp}°C</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Junnar Block</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <span className="text-[11px] text-emerald-800 block mb-1 font-semibold">
                  {t('drawer.localForecast')}
                </span>
                <span className="text-lg font-bold text-emerald-700 font-mono">
                  {weather.temperature}°C
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">{panchayat.name}</span>
              </div>

              <div
                className={`border rounded-lg p-3 text-center ${
                  diffTemp < 0
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : diffTemp > 0
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[11px] block mb-1 font-semibold">
                  {language === 'mr' ? 'स्थानिक फरक' : 'Difference'}
                </span>
                <span className="text-lg font-bold font-mono">
                  {diffTemp > 0 ? `+${diffTemp}` : `${diffTemp}`}°C
                </span>
                <span className="text-[10px] block mt-0.5 opacity-80">
                  {diffTemp < 0
                    ? language === 'mr'
                      ? 'थंड / गारवा'
                      : 'Cooler'
                    : diffTemp > 0
                    ? language === 'mr'
                      ? 'उबदार'
                      : 'Warmer'
                    : 'Equal'}
                </span>
              </div>
            </div>

            {/* Rainfall Comparison Row */}
            <div className="mt-2.5 grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  {language === 'mr' ? 'तालुका पाऊस' : 'Block Rain'}
                </span>
                <span className="text-sm font-bold text-slate-600 font-mono">{blockRain} mm</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                <span className="text-[10px] text-emerald-700 block mb-0.5 font-medium">
                  {language === 'mr' ? 'स्थानिक पाऊस' : 'Local Rain'}
                </span>
                <span className="text-sm font-bold text-emerald-800 font-mono">
                  {weather.rainfall} mm
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">
                  {language === 'mr' ? 'पाऊस तफावत' : 'Rain Diff'}
                </span>
                <span className="text-sm font-bold text-slate-700 font-mono">
                  {diffRain > 0 ? `+${diffRain}` : `${diffRain}`} mm
                </span>
              </div>
            </div>
          </div>

          {/* Contributing Factors Breakdown */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              {t('drawer.contributingFactors')}
            </p>
            <div className="space-y-2.5">
              {contributingFactors.map((factor) => (
                <div
                  key={factor.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      {language === 'mr' ? factor.nameMr : factor.nameEn}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {language === 'mr' ? factor.valueMr : factor.valueEn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'mr' ? factor.effectMr : factor.effectEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prototype notice */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-normal">{t('drawer.disclaimer')}</p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FEATURE 3: "WHAT-IF" SCENARIO SIMULATOR                        */}
      {/* ============================================================== */}
      {activeTab === 'whatIf' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header info */}
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('whatif.title')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('whatif.subtitle')}</p>
          </div>

          {/* Interactive Slider Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {t('whatif.currentRain')}
                </span>
                <span className="text-base font-bold text-slate-700">
                  {weather.rainfall.toFixed(1)} mm
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-700 block font-semibold">
                  {t('whatif.scenarioRain')}
                </span>
                <span className="text-xl font-bold text-emerald-700 font-mono">
                  {sliderRainfall} mm
                </span>
              </div>
            </div>

            {/* Slider Component */}
            <div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={sliderRainfall}
                onChange={(e) => {
                  setSliderRainfall(Number(e.target.value));
                  setHasRunScenario(false);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0 mm</span>
                <span>40 mm</span>
                <span>80 mm</span>
                <span>120 mm</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setHasRunScenario(true)}
                className="flex-1 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('whatif.runButton')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSliderRainfall(Math.round(weather.rainfall));
                  setHasRunScenario(false);
                }}
                className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium py-2 px-3 rounded-md flex items-center justify-center gap-1 transition-colors"
                title={t('whatif.resetButton')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('whatif.resetButton')}</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          {hasRunScenario ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Risk comparison row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 block mb-1">
                    {t('whatif.currentRisk')}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      {weather.rainfall.toFixed(0)} mm
                    </span>
                    <RiskBadge level={scenarioResult.currentRisk} />
                  </div>
                </div>

                <div className="bg-white border border-emerald-300 rounded-lg p-3 shadow-2xs">
                  <span className="text-[11px] text-emerald-800 font-semibold block mb-1">
                    {t('whatif.scenarioRisk')}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 font-mono">
                      {scenarioResult.scenarioRainfall} mm
                    </span>
                    <RiskBadge level={scenarioResult.scenarioRisk} />
                  </div>
                </div>
              </div>

              {/* Risk Shift Status Badge */}
              <div
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                  scenarioResult.riskDiff === 'increased'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : scenarioResult.riskDiff === 'decreased'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>{t('whatif.riskChange')}:</span>
                <span className="font-bold">
                  {scenarioResult.riskDiff === 'increased'
                    ? language === 'mr'
                      ? '▲ धोका वाढला'
                      : '▲ Risk Increased'
                    : scenarioResult.riskDiff === 'decreased'
                    ? language === 'mr'
                      ? '▼ धोका कमी झाला'
                      : '▼ Risk Decreased'
                    : language === 'mr'
                    ? '● धोका कायम आहे'
                    : '● Risk Unchanged'}
                </span>
              </div>

              {/* Explanation Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                  {t('whatif.explanation')}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {language === 'mr' ? scenarioResult.explanationMr : scenarioResult.explanationEn}
                </p>
              </div>

              {/* Farmer Action Message */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('whatif.actionTitle')}</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  {language === 'mr'
                    ? scenarioResult.actionMessageMr
                    : scenarioResult.actionMessageEn}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
              <Sliders className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-500">
                {language === 'mr'
                  ? "स्लायडर फिरवून 'Run Scenario' वर क्लिक करा"
                  : 'Adjust the rainfall slider above and click "Run Scenario"'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'mr'
                  ? 'पिकाच्या वाढीच्या अवस्थेवर होणारा परिणाम तात्काळ दिसेल'
                  : 'Instant feedback on crop saturation and risk shift'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: OVERVIEW & CROP INFORMATION                             */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Primary Crop Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    {language === 'mr' ? 'प्रमुख पीक' : 'Primary Crop'}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCrop(weather.crop ?? 'Tomato')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  {language === 'mr' ? 'सध्याची अवस्था' : 'Growth Stage'}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  {formatStage(weather.growthStage ?? 'Flowering')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 text-[11px] block">
                  {language === 'mr' ? 'जमिनीचा प्रकार' : 'Land Cover'}
                </span>
                <span className="font-medium text-slate-700">{panchayat.landCover}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">
                  {language === 'mr' ? 'एकूण क्षेत्र' : 'Area'}
                </span>
                <span className="font-medium text-slate-700">{panchayat.area} km²</span>
              </div>
            </div>
          </div>

          {/* Localized Weather Metrics Grid */}
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              {language === 'mr' ? 'स्थानिक हवामान तपशील' : 'Localized Weather Parameters'}
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {t('weather.temperature')}
                  </span>
                  <span className="font-bold text-slate-800">{weather.temperature}°C</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="text-slate-400 text-[10px] block">{t('weather.rainfall')}</span>
                  <span className="font-bold text-slate-800">{weather.rainfall} mm</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <div>
                  <span className="text-slate-400 text-[10px] block">{t('weather.humidity')}</span>
                  <span className="font-bold text-slate-800">{weather.humidity}%</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center gap-2">
                <Wind className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-slate-400 text-[10px] block">{t('weather.wind')}</span>
                  <span className="font-bold text-slate-800">
                    {weather.wind ?? weather.windSpeed} km/h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PanchayatDetailDrawer({
  isOpen,
  onClose,
  panchayat,
  weather,
  blockTemp = 31.0,
  blockRain = 12.4,
}: PanchayatDetailDrawerProps) {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'whyDifferent' | 'whatIf'>('whyDifferent');

  if (!isOpen || !panchayat || !weather) return null;

  return (
    <aside
      aria-label="Panchayat Detail Drawer"
      className="fixed inset-y-0 right-0 z-[1100] w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out select-none animate-slideLeft"
    >
      {/* Header */}
      <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              {panchayat.name}
            </h2>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              {panchayat.block} Block
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'mr'
              ? `${panchayat.district} जिल्हा, महाराष्ट्र · उंची ${panchayat.elevation} मी`
              : `${panchayat.district} District, Maharashtra · Elev ${panchayat.elevation}m`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* In-drawer Language Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                language === 'mr'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              मराठी
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-md transition-colors"
            title={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('whyDifferent')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'whyDifferent'
              ? 'border-emerald-600 text-emerald-800 font-semibold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{language === 'mr' ? 'फरक का आहे?' : 'Why Different?'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatIf')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'whatIf'
              ? 'border-emerald-600 text-emerald-800 font-semibold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{language === 'mr' ? "'जर-तर' सिम्युलेटर" : 'What-If Simulator'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-800 font-semibold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wheat className="w-3.5 h-3.5" />
          <span>{language === 'mr' ? 'हवामान व पीक' : 'Weather & Crop'}</span>
        </button>
      </div>

      {/* Keyed Subcomponent: automatically resets state cleanly when selecting a different panchayat */}
      <PanchayatDrawerBody
        key={panchayat.id}
        panchayat={panchayat}
        weather={weather}
        blockTemp={blockTemp}
        blockRain={blockRain}
        activeTab={activeTab}
      />

      {/* Drawer Footer with Quick Switch and Status */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>GramRutu Mesh · Junnar Block</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </aside>
  );
}
