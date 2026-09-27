import { createContext, useContext } from 'react';
import type { Language, RiskLevel } from '../types';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  formatRisk: (risk: RiskLevel | string) => string;
  formatCrop: (crop: string) => string;
  formatStage: (stage: string) => string;
}

export const translations: Record<string, Record<Language, string>> = {
  // Navigation & General
  'app.title': { en: 'GramRutu', mr: 'GramRutu' },
  'app.subtitle': { en: '1-km Micro-climate downscaling for rural Maharashtra', mr: 'ग्रामीण महाराष्ट्रासाठी १-किमी सूक्ष्म-हवामान अंदाज' },
  'nav.overview': { en: 'Overview & Map', mr: 'नकाशा व आढावा' },
  'nav.explorer': { en: 'Panchayat Explorer', mr: 'पंचायत शोध' },
  'nav.advisory': { en: 'Crop Advisories', mr: 'पीक सल्ला' },
  'nav.analytics': { en: 'Risk Analytics', mr: 'धोका विश्लेषण' },

  // Weather Metrics
  'weather.temperature': { en: 'Temperature', mr: 'तापमान' },
  'weather.rainfall': { en: 'Rainfall', mr: 'पाऊस' },
  'weather.humidity': { en: 'Humidity', mr: 'आद्रता' },
  'weather.wind': { en: 'Wind Speed', mr: 'वाऱ्याचा वेग' },
  'weather.soilMoisture': { en: 'Soil Moisture', mr: 'मातीतील ओलावा' },

  // Risk Levels
  'risk.low': { en: 'Low Risk', mr: 'कमी धोका' },
  'risk.moderate': { en: 'Moderate Risk', mr: 'मध्यम धोका' },
  'risk.high': { en: 'High Risk', mr: 'जास्त धोका' },
  'risk.critical': { en: 'Critical Risk', mr: 'गंभीर धोका' },

  // Drawer & Downscaling
  'drawer.title': { en: 'Localized Forecast', mr: 'स्थानिक हवामान अंदाज' },
  'drawer.whyDifferent': { en: 'Why Is This Panchayat Different?', mr: 'या पंचायतीत फरक का आहे?' },
  'drawer.downscalingProcess': { en: 'Downscaling: Block Forecast → Local Panchayat', mr: 'स्थानिकीकरण: तालुका अंदाज → स्थानिक पंचायत अंदाज' },
  'drawer.blockForecast': { en: 'Block Forecast', mr: 'तालुका अंदाज' },
  'drawer.localForecast': { en: 'Local Panchayat', mr: 'स्थानिक पंचायत अंदाज' },
  'drawer.difference': { en: 'Forecast Difference', mr: 'अंदाजातील तफावत' },
  'drawer.contributingFactors': { en: 'Contributing Factors (Downscaling)', mr: 'फरक पडण्याची स्थानिक कारणे' },
  'drawer.disclaimer': {
    en: 'Note: These contributing factors are prototype downscaling indicators for Junnar block, not final ML model attributions.',
    mr: 'टीप: ही कारणे जुन्नर तालुक्यासाठी प्राथमिक नमुना घटक आहेत, अंतिम मॉडेल निष्कर्ष नाहीत.'
  },

  // What-If Scenario
  'whatif.title': { en: 'What-If Scenario Simulator', mr: "'जर-तर' हवामान सिम्युलेटर" },
  'whatif.subtitle': { en: 'Simulate rainfall variations and predict crop risk shifts', mr: 'पावसात बदल झाल्यास पिकाच्या धोक्याचा अंदाज घ्या' },
  'whatif.currentRain': { en: 'Current Rainfall', mr: 'सध्याचा पाऊस' },
  'whatif.scenarioRain': { en: 'Scenario Rainfall', mr: 'गृहीत पाऊस' },
  'whatif.runButton': { en: 'Run Scenario', mr: 'सिम्युलेशन चालवा' },
  'whatif.resetButton': { en: 'Reset', mr: 'पूर्ववत करा' },
  'whatif.currentRisk': { en: 'Current Risk', mr: 'सध्याचा धोका' },
  'whatif.scenarioRisk': { en: 'Scenario Risk', mr: 'अंदाजित धोका' },
  'whatif.riskChange': { en: 'Risk Shift', mr: 'धोक्यातील बदल' },
  'whatif.explanation': { en: 'Why Risk Changed', mr: 'धोका बदलण्याचे कारण' },
  'whatif.actionTitle': { en: 'Recommended Farmer Action', mr: 'शेतकऱ्यांसाठी कृती सल्ला' },

  // Common UI
  'common.close': { en: 'Close', mr: 'बंद करा' },
  'common.details': { en: 'View Details', mr: 'तपशील पहा' },
  'common.search': { en: 'Search Panchayat...', mr: 'ग्रामपंचायत शोधा...' },
  'common.language': { en: 'Language', mr: 'भाषा' },
};

export const cropDictionary: Record<string, Record<Language, string>> = {
  Tomato: { en: 'Tomato', mr: 'टोमॅटो' },
  Sugarcane: { en: 'Sugarcane', mr: 'ऊस' },
  Onion: { en: 'Onion', mr: 'कांदा' },
  Pomegranate: { en: 'Pomegranate', mr: 'डाळिंब' },
  Grapes: { en: 'Grapes', mr: 'द्राक्षे' },
  Soybean: { en: 'Soybean', mr: 'सोयाबीन' },
  Wheat: { en: 'Wheat', mr: 'गहू' },
  Bajra: { en: 'Bajra', mr: 'बाजरी' },
};

export const stageDictionary: Record<string, Record<Language, string>> = {
  Flowering: { en: 'Flowering Stage', mr: 'फुलोरा अवस्था' },
  Fruiting: { en: 'Fruiting Stage', mr: 'फळधारणा अवस्था' },
  Tillering: { en: 'Tillering Stage', mr: 'फुटवे फुटणे अवस्था' },
  'Bulb Enlargement': { en: 'Bulb Enlargement', mr: 'कांदा पोसणे अवस्था' },
  'Grand Growth': { en: 'Grand Vegetative Growth', mr: 'जलद वाढ अवस्था' },
  Vegetative: { en: 'Vegetative Stage', mr: 'शाकीय वाढ अवस्था' },
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
