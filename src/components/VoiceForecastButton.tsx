import { useState, useEffect, useCallback } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { PanchayatWeather, Language } from '../types';

interface VoiceForecastButtonProps {
  weather: PanchayatWeather | null;
  panchayatName?: string;
}

function generateWeatherBriefing(
  weather: PanchayatWeather,
  panchayatName: string,
  language: Language
): string {
  const rainfall = weather.rainfall;
  const temp = weather.temperature;
  const humidity = weather.humidity;
  const condition = weather.condition;
  const risk = weather.risk ?? 'Moderate';
  const crop = weather.crop ?? 'crops';

  if (language === 'mr') {
    const greeting = 'शुभ सकाळ.';
    let rainfallDesc = '';
    if (rainfall > 60) {
      rainfallDesc = 'आज मुसळधार पावसाची शक्यता आहे.';
    } else if (rainfall > 30) {
      rainfallDesc = 'आज मध्यम ते जोरदार पावसाची शक्यता आहे.';
    } else if (rainfall > 10) {
      rainfallDesc = 'आज हलक्या ते मध्यम स्वरूपाचा पाऊस अपेक्षित आहे.';
    } else {
      rainfallDesc = 'आज हलक्या पावसाची शक्यता आहे.';
    }

    let advice = '';
    if (risk === 'Severe' || risk === 'High') {
      advice = 'शेतीची कामे पुढे ढकलण्याचा विचार करा. पाणी साचण्याच्या परिस्थितीवर लक्ष ठेवा.';
    } else {
      advice = 'अपेक्षित पावसाच्या आधी सिंचन टाळण्याचा सल्ला देण्यात येतो. पिकांची स्थिती आणि स्थानिक पाणी साचण्याच्या परिस्थितीवर लक्ष ठेवा.';
    }

    return `${greeting} आज ${panchayatName} मध्ये तापमान ${temp} अंश सेल्सिअस आणि आर्द्रता ${humidity} टक्के अपेक्षित आहे. हवामान ${condition}. ${rainfallDesc} अपेक्षित पाऊस ${rainfall} मिलिमीटर. ${advice}`;
  }

  // English
  const greeting = 'Good morning.';
  let rainfallDesc = '';
  if (rainfall > 60) {
    rainfallDesc = 'heavy rainfall is expected throughout the day';
  } else if (rainfall > 30) {
    rainfallDesc = 'moderate to heavy rainfall is expected during the afternoon';
  } else if (rainfall > 10) {
    rainfallDesc = 'light to moderate rainfall is expected during the afternoon';
  } else {
    rainfallDesc = 'light rainfall is possible later in the day';
  }

  let advice = '';
  if (risk === 'Severe' || risk === 'High') {
    advice = `Farmers are advised to postpone field operations. Monitor waterlogging and drainage conditions for ${crop}.`;
  } else {
    advice = `Farmers are advised to avoid irrigation before the expected rainfall window. Please monitor crop conditions and local waterlogging.`;
  }

  return `${greeting} Today in ${panchayatName}, the temperature is ${temp} degrees Celsius with ${humidity} percent humidity. Conditions are ${condition}. Expected rainfall is ${rainfall} millimeters — ${rainfallDesc}. ${advice}`;
}

export function VoiceForecastButton({ weather, panchayatName }: VoiceForecastButtonProps) {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Cancel speech if component unmounts or language/weather changes
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [language, weather?.panchayatId]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!weather) return;

    // Check if speechSynthesis is available
    if (!window.speechSynthesis) {
      setVoiceUnavailable(true);
      return;
    }

    const briefing = generateWeatherBriefing(
      weather,
      panchayatName ?? weather.panchayatName ?? 'Junnar',
      language
    );

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(briefing);
    utterance.lang = language === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.9;

    // Try to find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language === 'mr' ? 'mr' : 'en';
    const matchedVoice = voices.find((v) => v.lang.startsWith(langPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceUnavailable(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!weather) return null;

  return (
    <div>
      <button
        type="button"
        onClick={handleSpeak}
        className={`text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-xs ${
          isSpeaking
            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {isSpeaking ? (
          <>
            <Square className="w-3.5 h-3.5" />
            <span>{t('voice.stop')}</span>
            <span className="ml-1 flex gap-0.5">
              <span className="w-1 h-3 bg-red-400 rounded-full animate-pulse" />
              <span className="w-1 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
              <span className="w-1 h-3.5 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('voice.listen')}</span>
          </>
        )}
      </button>
      {voiceUnavailable && (
        <p className="text-[10px] text-amber-600 mt-1">{t('voice.unavailable')}</p>
      )}
    </div>
  );
}
