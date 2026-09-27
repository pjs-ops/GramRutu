import { useState, useEffect, type ReactNode } from 'react';
import type { Language, RiskLevel } from '../types';
import {
  LanguageContext,
  translations,
  cropDictionary,
  stageDictionary,
} from './languageCore';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pwi_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pwi_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const formatRisk = (risk: RiskLevel | string): string => {
    const key = `risk.${risk.toLowerCase()}`;
    return translations[key]?.[language] || risk;
  };

  const formatCrop = (crop: string): string => {
    return cropDictionary[crop]?.[language] || crop;
  };

  const formatStage = (stage: string): string => {
    return stageDictionary[stage]?.[language] || stage;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatRisk,
        formatCrop,
        formatStage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
