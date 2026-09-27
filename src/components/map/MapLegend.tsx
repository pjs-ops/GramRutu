import type { MapLayer } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface MapLegendProps {
  layer: MapLayer;
  compact?: boolean;
  className?: string;
}

interface LegendConfig {
  titleEn: string;
  titleMr: string;
  unit: string;
  summaryEn: string;
  summaryMr: string;
  gradient: string;
  minLabelEn: string;
  minLabelMr: string;
  midLabelEn: string;
  midLabelMr: string;
  maxLabelEn: string;
  maxLabelMr: string;
  steps: { color: string; labelEn: string; labelMr: string }[];
}

const legendConfigs: Record<MapLayer, LegendConfig> = {
  temperature: {
    titleEn: 'Temperature',
    titleMr: 'तापमान',
    unit: '°C',
    summaryEn: '28°C ─── 30°C ─── 32°C',
    summaryMr: '२८°से ─── ३०°से ─── ३२°से',
    gradient: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)',
    minLabelEn: '28°C',
    minLabelMr: '२८°से',
    midLabelEn: '30°C',
    midLabelMr: '३०°से',
    maxLabelEn: '32°C+',
    maxLabelMr: '३२°से+',
    steps: [
      { color: '#22c55e', labelEn: '< 29°', labelMr: '< २९°' },
      { color: '#84cc16', labelEn: '29–30°', labelMr: '२९–३०°' },
      { color: '#eab308', labelEn: '30–31°', labelMr: '३०–३१°' },
      { color: '#f97316', labelEn: '31–32°', labelMr: '३१–३२°' },
      { color: '#ef4444', labelEn: '> 32°', labelMr: '> ३२°' },
    ],
  },
  rainfall: {
    titleEn: 'Rainfall',
    titleMr: 'पाऊस',
    unit: 'mm',
    summaryEn: '20 mm ─── 50 mm ─── 80 mm',
    summaryMr: '२० मिमी ─── ५० मिमी ─── ८० मिमी',
    gradient: 'linear-gradient(to right, #93c5fd, #60a5fa, #3b82f6, #2563eb, #1e40af)',
    minLabelEn: '20 mm',
    minLabelMr: '२० मिमी',
    midLabelEn: '50 mm',
    midLabelMr: '५० मिमी',
    maxLabelEn: '80 mm+',
    maxLabelMr: '८० मिमी+',
    steps: [
      { color: '#93c5fd', labelEn: '< 25', labelMr: '< २५' },
      { color: '#60a5fa', labelEn: '25–40', labelMr: '२५–४०' },
      { color: '#3b82f6', labelEn: '40–55', labelMr: '४०–५५' },
      { color: '#2563eb', labelEn: '55–70', labelMr: '५५–७०' },
      { color: '#1e40af', labelEn: '> 70', labelMr: '> ७०' },
    ],
  },
  humidity: {
    titleEn: 'Relative Humidity',
    titleMr: 'हवेतील आर्द्रता',
    unit: '%',
    summaryEn: '55% ─── 75% ─── 95%',
    summaryMr: '५५% ─── ७५% ─── ९५%',
    gradient: 'linear-gradient(to right, #c4b5fd, #a78bfa, #8b5cf6, #7c3aed, #5b21b6)',
    minLabelEn: '55%',
    minLabelMr: '५५%',
    midLabelEn: '75%',
    midLabelMr: '७५%',
    maxLabelEn: '95%',
    maxLabelMr: '९५%',
    steps: [
      { color: '#c4b5fd', labelEn: '< 65%', labelMr: '< ६५%' },
      { color: '#a78bfa', labelEn: '65–75%', labelMr: '६५–७५%' },
      { color: '#8b5cf6', labelEn: '75–85%', labelMr: '७५–८५%' },
      { color: '#7c3aed', labelEn: '85–90%', labelMr: '८५–९०%' },
      { color: '#5b21b6', labelEn: '> 90%', labelMr: '> ९०%' },
    ],
  },
  wind: {
    titleEn: 'Wind Speed',
    titleMr: 'वाऱ्याचा वेग',
    unit: 'km/h',
    summaryEn: '5 km/h ─── 15 km/h ─── 25 km/h',
    summaryMr: '५ किमी ─── १५ किमी ─── २५ किमी',
    gradient: 'linear-gradient(to right, #a5f3fc, #38bdf8, #0284c7, #0f766e, #042f2e)',
    minLabelEn: '5 km/h',
    minLabelMr: '५ किमी',
    midLabelEn: '15 km/h',
    midLabelMr: '१५ किमी',
    maxLabelEn: '25 km/h+',
    maxLabelMr: '२५ किमी+',
    steps: [
      { color: '#a5f3fc', labelEn: '< 10', labelMr: '< १०' },
      { color: '#38bdf8', labelEn: '10–13', labelMr: '१०–१३' },
      { color: '#0284c7', labelEn: '13–16', labelMr: '१३–१६' },
      { color: '#0f766e', labelEn: '16–20', labelMr: '१६–२०' },
      { color: '#042f2e', labelEn: '> 20', labelMr: '> २०' },
    ],
  },
  risk: {
    titleEn: 'Crop Weather Risk',
    titleMr: 'पिकांचा धोका',
    unit: 'Risk Level',
    summaryEn: 'LOW → MODERATE → HIGH → CRITICAL',
    summaryMr: 'कमी → मध्यम → जास्त → अति तीव्र',
    gradient: 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)',
    minLabelEn: 'LOW',
    minLabelMr: 'कमी',
    midLabelEn: 'HIGH',
    midLabelMr: 'जास्त',
    maxLabelEn: 'CRITICAL',
    maxLabelMr: 'अति तीव्र',
    steps: [
      { color: '#22c55e', labelEn: 'Low', labelMr: 'कमी' },
      { color: '#eab308', labelEn: 'Moderate', labelMr: 'मध्यम' },
      { color: '#f97316', labelEn: 'High', labelMr: 'जास्त' },
      { color: '#ef4444', labelEn: 'Critical', labelMr: 'अति तीव्र' },
    ],
  },
  downscalingDiff: {
    titleEn: 'Downscaling Difference',
    titleMr: 'स्थानिक तापमान फरक',
    unit: 'Δ vs IMD',
    summaryEn: 'LOWER ← 0 → HIGHER',
    summaryMr: 'कमी (-४°) ← ० → जास्त (+२°)',
    gradient: 'linear-gradient(to right, #2563eb, #38bdf8, #94a3b8, #f97316, #ef4444)',
    minLabelEn: 'LOWER (-4°C)',
    minLabelMr: 'कमी (-४°)',
    midLabelEn: '0 (Block IMD)',
    midLabelMr: '० (तालुका)',
    maxLabelEn: 'HIGHER (+2°C)',
    maxLabelMr: 'जास्त (+२°)',
    steps: [
      { color: '#2563eb', labelEn: '< -2°C', labelMr: '< -२°' },
      { color: '#38bdf8', labelEn: '-2 to -0.5°', labelMr: '-२ ते -०.५°' },
      { color: '#94a3b8', labelEn: '±0.5°', labelMr: '±०.५°' },
      { color: '#f97316', labelEn: '+0.5 to +2°', labelMr: '+०.५ ते +२°' },
      { color: '#ef4444', labelEn: '> +2°C', labelMr: '> +२°' },
    ],
  },
};

export function MapLegend({ layer, compact = false, className = '' }: MapLegendProps) {
  const { language } = useLanguage();
  const config = legendConfigs[layer] || legendConfigs.temperature;

  return (
    <div
      className={`bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-lg p-3 shadow-md transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-800 tracking-tight">
          {language === 'mr' ? config.titleMr : config.titleEn}
        </span>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {config.unit}
        </span>
      </div>

      {/* Visual story scale text */}
      <p className="text-[10px] font-medium text-slate-500 tracking-wider mb-2 font-mono">
        {language === 'mr' ? config.summaryMr : config.summaryEn}
      </p>

      {/* Continuous gradient ramp */}
      <div
        className="w-full h-2 rounded-full mb-1 border border-slate-200/60"
        style={{ background: config.gradient }}
      />
      <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-2.5">
        <span>{language === 'mr' ? config.minLabelMr : config.minLabelEn}</span>
        {config.midLabelEn && (
          <span>{language === 'mr' ? config.midLabelMr : config.midLabelEn}</span>
        )}
        <span>{language === 'mr' ? config.maxLabelMr : config.maxLabelEn}</span>
      </div>

      {/* Discrete chips */}
      {!compact && (
        <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-100">
          {config.steps.map((step) => (
            <div key={step.labelEn} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm border border-black/10 shrink-0"
                style={{ backgroundColor: step.color }}
              />
              <span className="text-[10px] text-slate-600 font-medium">
                {language === 'mr' ? step.labelMr : step.labelEn}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface LayerControlProps {
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
  className?: string;
}

export function LayerControl({ activeLayer, onLayerChange, className = '' }: LayerControlProps) {
  const layers: { key: MapLayer; label: string }[] = [
    { key: 'temperature', label: 'Temperature' },
    { key: 'rainfall', label: 'Rainfall' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'wind', label: 'Wind' },
    { key: 'risk', label: 'Crop Risk' },
    { key: 'downscalingDiff', label: 'Difference' },
  ];

  return (
    <div
      className={`flex items-center flex-wrap gap-1 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-md p-1 shadow-sm ${className}`}
    >
      {layers.map((l) => (
        <button
          key={l.key}
          onClick={() => onLayerChange(l.key)}
          className={`text-xs px-2.5 py-1 rounded font-medium transition-all duration-150 ${
            activeLayer === l.key
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
