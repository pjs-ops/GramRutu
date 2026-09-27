import { ChevronRight, X, Layers, Sparkles } from 'lucide-react';
import type { MapLayer, Panchayat, PanchayatWeather } from '../../types';
import { formatLayerValue } from '../../services/weatherMapService';
import { useLanguage } from '../../context/LanguageContext';

interface MapToolbarProps {
  selectedLayer: MapLayer;
  selectedPanchayat: Panchayat | null;
  selectedWeather?: PanchayatWeather | null;
  onClearSelection: () => void;
  blockName?: string;
  blockTemperature?: number;
  className?: string;
}

const LAYER_LABELS_EN: Record<MapLayer, string> = {
  temperature: 'Temperature (°C)',
  rainfall: 'Rainfall (mm)',
  humidity: 'Humidity (%)',
  wind: 'Wind (km/h)',
  risk: 'Crop Weather Risk',
  downscalingDiff: 'Downscaling Difference (Δ vs IMD)',
};

const LAYER_LABELS_MR: Record<MapLayer, string> = {
  temperature: 'तापमान (°C)',
  rainfall: 'पाऊस (mm)',
  humidity: 'हवेतील आर्द्रता (%)',
  wind: 'वाऱ्याचा वेग (km/h)',
  risk: 'पिकांचा धोका (Risk)',
  downscalingDiff: 'स्थानिक तापमान फरक (Δ IMD)',
};

export function MapToolbar({
  selectedLayer,
  selectedPanchayat,
  selectedWeather,
  onClearSelection,
  blockName = 'Junnar',
  blockTemperature = 31.0,
  className = '',
}: MapToolbarProps) {
  const { language } = useLanguage();

  return (
    <div
      className={`bg-white border border-slate-200 rounded-t-lg px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap select-none ${className}`}
    >
      {/* Visual story pipeline indicator */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {language === 'mr'
              ? `${blockName} तालुका अंदाज`
              : `${blockName.toUpperCase()} BLOCK FORECAST`}
          </span>
          <span className="font-mono text-[10px] text-slate-500">({blockTemperature}°C)</span>
        </span>

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        <span className="font-semibold text-violet-700 bg-violet-50 border border-violet-200/60 px-2 py-1 rounded">
          {language === 'mr' ? '१-किमी जाळी' : '1-KM GRID'}
        </span>

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded">
          {language === 'mr' ? 'गाव पातळीवरील हवामान' : 'PANCHAYAT-LEVEL WEATHER'}
        </span>
      </div>

      {/* Right controls: Active Layer indicator & Selected Panchayat badge */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span className="text-slate-500">{language === 'mr' ? 'स्तर:' : 'Layer:'}</span>
          <span className="font-semibold text-slate-800">
            {language === 'mr' ? LAYER_LABELS_MR[selectedLayer] : LAYER_LABELS_EN[selectedLayer]}
          </span>
        </div>

        {selectedPanchayat ? (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-md text-xs font-medium animate-fadeIn">
            <span>
              {language === 'mr' ? 'निवडलेले गाव: ' : 'Selected: '}
              <strong className="font-semibold text-emerald-950">
                {selectedPanchayat.name}
              </strong>{' '}
              ({formatLayerValue(selectedLayer, selectedWeather)})
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/80 rounded p-0.5 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic hidden sm:inline">
            Click any Panchayat or Grid cell
          </span>
        )}
      </div>
    </div>
  );
}
