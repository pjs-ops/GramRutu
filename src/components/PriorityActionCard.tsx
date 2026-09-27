import { RiskBadge } from './RiskBadge';
import { useLanguage } from '../context/LanguageContext';
import type { RiskLevel } from '../types';

interface PriorityActionCardProps {
  panchayatName: string;
  rainfall: number;
  risk: RiskLevel;
  confidence: number;
  actionEn: string;
  actionMr: string;
}

export function PriorityActionCard({
  panchayatName,
  rainfall,
  risk,
  confidence,
  actionEn,
  actionMr,
}: PriorityActionCardProps) {
  const { language, t } = useLanguage();

  const riskLabels: Record<RiskLevel, string> = {
    Severe: language === 'mr' ? 'तीव्र पाऊस' : 'Severe rainfall',
    High: language === 'mr' ? 'जास्त पाऊस' : 'High rainfall',
    Moderate: language === 'mr' ? 'मध्यम पाऊस' : 'Moderate rainfall',
    Low: language === 'mr' ? 'हलका पाऊस' : 'Light rainfall',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3.5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-800">{panchayatName}</span>
        <RiskBadge level={risk} />
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
        <span>{riskLabels[risk]}</span>
        <span className="font-mono font-semibold text-slate-700">{rainfall} mm</span>
      </div>
      <div className="text-xs text-slate-500 mb-1.5">
        {t('officer.confidence')}: <span className="font-medium text-slate-700">{Math.round(confidence * 100)}%</span>
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded p-2.5 mt-2">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {t('officer.action')}
        </p>
        <p className="text-xs text-slate-700 leading-relaxed">
          {language === 'mr' ? actionMr : actionEn}
        </p>
      </div>
    </div>
  );
}
