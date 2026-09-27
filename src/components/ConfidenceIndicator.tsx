import { useLanguage } from '../context/LanguageContext';

interface ConfidenceIndicatorProps {
  confidence: number; // 0 to 1
  panchayatName?: string;
  elevation?: number;
}

export function ConfidenceIndicator({ confidence, panchayatName, elevation }: ConfidenceIndicatorProps) {
  const { t, language } = useLanguage();
  const pct = Math.round(confidence * 100);

  let level: string;
  let levelKey: string;
  let barColor: string;
  if (pct >= 75) {
    level = 'high';
    levelKey = 'confidence.high';
    barColor = 'bg-emerald-500';
  } else if (pct >= 50) {
    level = 'moderate';
    levelKey = 'confidence.moderate';
    barColor = 'bg-amber-500';
  } else {
    level = 'low';
    levelKey = 'confidence.low';
    barColor = 'bg-red-500';
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {t('confidence.title')}
          </p>
          {panchayatName && (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {panchayatName}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-semibold text-slate-800">{pct}%</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            level === 'high'
              ? 'bg-emerald-50 text-emerald-700'
              : level === 'moderate'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {t(levelKey)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
          <div
            className={`${barColor} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {t('confidence.terrainNote')}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>{language === 'mr' ? 'भूप्रदेश उंची' : 'Terrain Elevation'}</span>
        <span className="font-semibold text-slate-700">
          {elevation ? `${elevation} m ASL` : '625 m ASL'}
        </span>
      </div>
    </div>
  );
}
