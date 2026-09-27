import { MapPin, Clock, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import { GramRutuBrand } from './GramRutuBrand';

export function TopBar() {
  const { language, setLanguage } = useLanguage();

  const now = new Date();
  const timeStr = now.toLocaleTimeString(language === 'mr' ? 'mr-IN' : 'en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = now.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 select-none">
      <div className="flex items-center gap-3.5">
        <GramRutuBrand size="sm" theme="light" />
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium truncate">
            {language === 'mr'
              ? 'जुन्नर तालुका, पुणे जिल्हा, महाराष्ट्र'
              : 'Junnar Block, Pune District, Maharashtra'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500">
        {/* Language Switcher: English | मराठी */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <Languages className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'en'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('mr')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              language === 'mr'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            मराठी
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {dateStr} · {timeStr}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500 font-mono">Prototype</span>
        </div>
      </div>
    </header>
  );
}
