import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { FeedbackChoice } from '../types';

interface FeedbackVerificationCardProps {
  panchayatId: string;
}

export function FeedbackVerificationCard({ panchayatId }: FeedbackVerificationCardProps) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState<FeedbackChoice | null>(null);

  const handleSelect = (choice: FeedbackChoice) => {
    if (submitted) return;
    setSubmitted(choice);
  };

  const options: { key: FeedbackChoice; icon: string; labelKey: string }[] = [
    { key: 'accurate', icon: '👍', labelKey: 'feedback.accurate' },
    { key: 'moreRain', icon: '👎', labelKey: 'feedback.moreRain' },
    { key: 'lessRain', icon: '👎', labelKey: 'feedback.lessRain' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4" data-panchayat={panchayatId}>
      <p className="text-sm font-semibold text-slate-700 mb-3">{t('feedback.title')}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleSelect(opt.key)}
            disabled={!!submitted}
            className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 ${
              submitted === opt.key
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300'
                : submitted
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{t(opt.labelKey)}</span>
          </button>
        ))}
      </div>

      {submitted && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
          {t('feedback.thanks')}
        </p>
      )}
    </div>
  );
}
