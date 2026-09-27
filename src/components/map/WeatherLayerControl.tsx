import {
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  ShieldAlert,
  GitCompare,
  Grid,
  MapPin,
} from 'lucide-react';
import type { MapLayer } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface WeatherLayerControlProps {
  selectedLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
  showPanchayatBoundaries: boolean;
  onTogglePanchayatBoundaries: (show: boolean) => void;
  className?: string;
}

interface LayerOption {
  key: MapLayer;
  labelEn: string;
  labelMr: string;
  unit: string;
  icon: typeof Thermometer;
}

const LAYER_OPTIONS: LayerOption[] = [
  { key: 'temperature', labelEn: 'Temperature', labelMr: 'तापमान', unit: '°C', icon: Thermometer },
  { key: 'rainfall', labelEn: 'Rainfall', labelMr: 'पाऊस', unit: 'mm', icon: CloudRain },
  { key: 'humidity', labelEn: 'Humidity', labelMr: 'हवेतील आर्द्रता', unit: '%', icon: Droplets },
  { key: 'wind', labelEn: 'Wind', labelMr: 'वाऱ्याचा वेग', unit: 'km/h', icon: Wind },
  { key: 'risk', labelEn: 'Crop Risk', labelMr: 'पिकांचा धोका', unit: 'Risk', icon: ShieldAlert },
  { key: 'downscalingDiff', labelEn: 'Downscaling Difference', labelMr: 'स्थानिक तापमान फरक', unit: 'Δ vs IMD', icon: GitCompare },
];

export function WeatherLayerControl({
  selectedLayer,
  onLayerChange,
  showGrid,
  onToggleGrid,
  showPanchayatBoundaries,
  onTogglePanchayatBoundaries,
  className = '',
}: WeatherLayerControlProps) {
  const { language } = useLanguage();

  return (
    <div
      className={`bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-lg p-3.5 shadow-lg w-64 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          {language === 'mr' ? 'हवामान स्तर (Layers)' : 'Weather Layers'}
        </p>
        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          {language === 'mr' ? 'प्रोटोटाइप' : 'Live Prototype'}
        </span>
      </div>

      {/* Layer Radio Selection */}
      <div className="space-y-1 mb-3">
        {LAYER_OPTIONS.map((opt) => {
          const isSelected = selectedLayer === opt.key;
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onLayerChange(opt.key)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs transition-all duration-150 ${
                isSelected
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'border-white bg-white' : 'border-slate-400 bg-transparent'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{language === 'mr' ? opt.labelMr : opt.labelEn}</span>
              </div>
              <span
                className={`text-[10px] font-mono shrink-0 ml-1 ${
                  isSelected ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {opt.unit}
              </span>
            </button>
          );
        })}
      </div>

      {/* Spatial Overlays Header */}
      <div className="pt-2 border-t border-slate-100 mb-2">
        <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2">
          {language === 'mr' ? 'नकाशा आवरणे (Overlays)' : 'Spatial Overlays'}
        </p>

        {/* Toggles */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between p-2 rounded-md bg-slate-50/80 border border-slate-200/60 hover:bg-slate-100/70 cursor-pointer text-xs transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => onToggleGrid(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <Grid className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-700">
                {language === 'mr' ? '१-किमी सूक्ष्म जाळी' : '1-km Grid'}
              </span>
            </div>
            <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              Mesh
            </span>
          </label>

          <label className="flex items-center justify-between p-2 rounded-md bg-slate-50/80 border border-slate-200/60 hover:bg-slate-100/70 cursor-pointer text-xs transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPanchayatBoundaries}
                onChange={(e) => onTogglePanchayatBoundaries(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-700">
                {language === 'mr' ? 'ग्रामपंचायत सीमा' : 'Panchayat Boundaries'}
              </span>
            </div>
            <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              Boundaries
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
