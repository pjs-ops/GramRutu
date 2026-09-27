import { useState, useEffect } from 'react';
import gramRutuLogo from '../assets/gramrutu-logo.jpg';

interface SplashScreenProps {
  onFinish?: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress bar filling immediately on mount from 0% -> 100% over 1s
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 20);

    // After ~1s when progress hits 100%, trigger smooth transition
    const transitionTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1000);

    // Unmount once fade-out completes (~250ms)
    const removeTimer = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 1250);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(transitionTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      aria-label="GramRutu Startup Screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white px-4 transition-opacity duration-250 ease-out select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Clean, centered startup container */}
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Generous circular logo container preserving original aspect ratio without cropping */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white shadow-sm border border-slate-100 p-3 sm:p-4 flex items-center justify-center mb-4 transition-transform duration-300">
          <img
            src={gramRutuLogo}
            alt="GramRutu"
            className="w-full h-full object-contain"
          />
        </div>

        {/* English Brand Name matching Green/Blue palette */}
        <div className="text-3xl sm:text-4xl font-black tracking-tight leading-tight select-none">
          <span className="text-emerald-600">Gram</span>
          <span className="text-sky-600">Rutu</span>
        </div>

        {/* Thin, smooth 0% -> 100% startup progress bar */}
        <div className="w-36 sm:w-44 h-1 bg-slate-100 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full transition-all ease-linear"
            style={{
              width: `${progress}%`,
              transitionDuration: '1000ms',
            }}
          />
        </div>
      </div>
    </div>
  );
}
