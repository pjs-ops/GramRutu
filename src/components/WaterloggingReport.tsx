import { useState } from 'react';
import { Camera, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { WaterloggingSeverity } from '../types';

export function WaterloggingReport() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [severity, setSeverity] = useState<WaterloggingSeverity>('none');
  const [observation, setObservation] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors w-full justify-center"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>{t('waterlogging.title')}</span>
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-xs text-emerald-700 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t('waterlogging.captured')}</span>
      </div>
    );
  }

  const severityOptions: { value: WaterloggingSeverity; labelKey: string }[] = [
    { value: 'none', labelKey: 'waterlogging.none' },
    { value: 'minor', labelKey: 'waterlogging.minor' },
    { value: 'severe', labelKey: 'waterlogging.severe' },
  ];

  return (
    <div className="bg-white border border-amber-200 rounded-md p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-700">{t('waterlogging.title')}</p>

      {/* Severity */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">{t('waterlogging.severity')}</label>
        <div className="flex gap-2">
          {severityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSeverity(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${
                severity === opt.value
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-gray-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Observation */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">{t('waterlogging.observation')}</label>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows={2}
          className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          placeholder="..."
        />
      </div>

      {/* Photo */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">{t('waterlogging.photo')}</label>
        <label className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
          <Camera className="w-3.5 h-3.5 text-slate-400" />
          <span>{photoName || '...'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t('waterlogging.submit')}</span>
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
