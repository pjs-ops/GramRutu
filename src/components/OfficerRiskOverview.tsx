import { useLanguage } from '../context/LanguageContext';
import { SectionHeader } from './SectionHeader';
import { RiskBadge } from './RiskBadge';
import { PriorityActionCard } from './PriorityActionCard';
import type { Panchayat, PanchayatWeather, RiskLevel } from '../types';
import feedbackData from '../data/feedback.json';
import { computeSimpleRisk } from '../services/weatherMapService';

interface OfficerRiskOverviewProps {
  panchayats: Panchayat[];
  panchayatWeather: Record<string, PanchayatWeather>;
}

function getOfficerAction(risk: RiskLevel, rainfall: number): { en: string; mr: string } {
  if (risk === 'Severe') {
    return {
      en: 'Field verification / waterlogging monitoring required. Alert local disaster response.',
      mr: 'क्षेत्र पडताळणी / पाणी साचणे निरीक्षण आवश्यक. स्थानिक आपत्ती प्रतिसादास सतर्क करा.',
    };
  }
  if (risk === 'High') {
    return {
      en: 'Monitor crop and drainage conditions. Coordinate with Krishi Sahayak.',
      mr: 'पिकांच्या आणि निचरा व्यवस्थेच्या स्थितीवर लक्ष ठेवा. कृषी सहाय्यकाशी समन्वय साधा.',
    };
  }
  if (risk === 'Moderate') {
    return {
      en: 'Routine monitoring. Verify field-level conditions during next visit.',
      mr: 'नियमित निरीक्षण. पुढील भेटीदरम्यान क्षेत्र-स्तरावरील परिस्थिती तपासा.',
    };
  }
  return {
    en: 'No immediate action required. Continue standard monitoring.',
    mr: 'तात्काळ कृतीची आवश्यकता नाही. मानक निरीक्षण चालू ठेवा.',
  };
}

export function OfficerRiskOverview({ panchayats, panchayatWeather }: OfficerRiskOverviewProps) {
  const { language, t } = useLanguage();

  // Build enriched panchayat list with risk, weather, and feedback
  const enrichedPanchayats = panchayats.map((p) => {
    const w = panchayatWeather[p.id];
    const risk: RiskLevel = w?.risk ?? computeSimpleRisk(w);
    const fb = feedbackData.feedbackData.find((f) => f.panchayatId === p.id);
    const action = getOfficerAction(risk, w?.rainfall ?? 0);

    return {
      panchayat: p,
      weather: w,
      risk,
      feedback: fb,
      action,
    };
  });

  // Dynamic risk counts
  const riskCounts = { Severe: 0, High: 0, Moderate: 0, Low: 0 };
  enrichedPanchayats.forEach((ep) => {
    riskCounts[ep.risk]++;
  });

  // Sort by risk severity
  const riskOrder: RiskLevel[] = ['Severe', 'High', 'Moderate', 'Low'];
  const sorted = [...enrichedPanchayats].sort(
    (a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk)
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <SectionHeader
        title={t('officer.title')}
        badge={language === 'mr' ? 'अधिकारी दृश्य' : 'Officer View'}
      />

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
          <p className="text-xs font-medium text-red-700 mb-1">{t('officer.severeRisk')}</p>
          <p className="text-2xl font-bold text-red-800">{riskCounts.Severe}</p>
          <p className="text-[10px] text-red-600">{t('officer.panchayats')}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-center">
          <p className="text-xs font-medium text-orange-700 mb-1">{t('officer.highRisk')}</p>
          <p className="text-2xl font-bold text-orange-800">{riskCounts.High}</p>
          <p className="text-[10px] text-orange-600">{t('officer.panchayats')}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-center">
          <p className="text-xs font-medium text-amber-700 mb-1">{t('officer.moderateRisk')}</p>
          <p className="text-2xl font-bold text-amber-800">{riskCounts.Moderate}</p>
          <p className="text-[10px] text-amber-600">{t('officer.panchayats')}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-center">
          <p className="text-xs font-medium text-emerald-700 mb-1">{t('officer.normalRisk')}</p>
          <p className="text-2xl font-bold text-emerald-800">{riskCounts.Low}</p>
          <p className="text-[10px] text-emerald-600">{t('officer.panchayats')}</p>
        </div>
      </div>

      {/* All Panchayats Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                  {language === 'mr' ? 'ग्रामपंचायत' : 'Panchayat'}
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                  {language === 'mr' ? 'पाऊस' : 'Rainfall'}
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                  {language === 'mr' ? 'धोका' : 'Risk'}
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                  {t('officer.confidence')}
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">
                  {t('officer.verification')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((ep) => {
                const accuracyPct = ep.feedback
                  ? Math.round((ep.feedback.accurate / ep.feedback.total) * 100)
                  : null;
                return (
                  <tr key={ep.panchayat.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{ep.panchayat.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono">
                      {ep.weather?.rainfall ?? '—'} mm
                    </td>
                    <td className="px-4 py-2.5">
                      <RiskBadge level={ep.risk} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {ep.weather?.confidence ? `${Math.round(ep.weather.confidence * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {accuracyPct !== null ? (
                        <span className={`font-medium ${accuracyPct >= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {accuracyPct}% ({ep.feedback!.total})
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Actions */}
      <SectionHeader
        title={t('officer.priorityActions')}
        description={language === 'mr' ? 'सर्वाधिक धोक्यातील ग्रामपंचायतींसाठी शिफारस केलेल्या कृती' : 'Recommended actions for highest-risk panchayats'}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted
          .filter((ep) => ep.risk === 'Severe' || ep.risk === 'High')
          .map((ep) => (
            <PriorityActionCard
              key={ep.panchayat.id}
              panchayatName={ep.panchayat.name}
              rainfall={ep.weather?.rainfall ?? 0}
              risk={ep.risk}
              confidence={ep.weather?.confidence ?? 0.7}
              actionEn={ep.action.en}
              actionMr={ep.action.mr}
            />
          ))}
        {sorted.filter((ep) => ep.risk === 'Severe' || ep.risk === 'High').length === 0 && (
          <div className="col-span-2 text-center py-6 text-xs text-slate-400">
            {language === 'mr' ? 'सध्या कोणत्याही ग्रामपंचायतीत तीव्र/जास्त धोका नाही.' : 'No panchayats currently at severe or high risk.'}
          </div>
        )}
      </div>
    </div>
  );
}
