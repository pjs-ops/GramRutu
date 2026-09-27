import { useLanguage } from '../context/LanguageContext';
import feedbackData from '../data/feedback.json';
import validationData from '../data/validation.json';
import type { ForecastFeedback } from '../types';

interface CommunityFeedbackMetricsProps {
  panchayatId: string;
  confidence: number; // 0-1
}

export function CommunityFeedbackMetrics({ panchayatId, confidence }: CommunityFeedbackMetricsProps) {
  const { t } = useLanguage();

  const fb: ForecastFeedback | undefined = (feedbackData.feedbackData as ForecastFeedback[])
    .find((f) => f.panchayatId === panchayatId);

  if (!fb) return null;

  const accuracyPct = Math.round((fb.accurate / fb.total) * 100);
  const metrics = validationData.metrics;
  const confPct = Math.round(confidence * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{t('feedback.communityTitle')}</p>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
          {t('feedback.prototype')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('feedback.accuracyLabel')}</p>
          <p className="text-lg font-bold text-emerald-700">{accuracyPct}%</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('feedback.totalReports')}</p>
          <p className="text-lg font-bold text-slate-700">{fb.total}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('feedback.communityConfidence')}</p>
          <p className={`text-lg font-bold ${accuracyPct >= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {accuracyPct >= 70 ? t('confidence.high') : t('confidence.moderate')}
          </p>
        </div>
      </div>

      {/* Model Metrics */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('metrics.mae')}</p>
          <p className="text-sm font-bold text-slate-700 font-mono">{metrics.mae} mm</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('metrics.bias')}</p>
          <p className="text-sm font-bold text-slate-700 font-mono">{metrics.bias} mm</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('metrics.confidence')}</p>
          <p className="text-sm font-bold text-slate-700 font-mono">{confPct}%</p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 italic">
        {t('confidence.prototypeEstimate')}
      </p>
    </div>
  );
}
