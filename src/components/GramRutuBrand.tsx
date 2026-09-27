import gramRutuLogo from '../assets/gramrutu-logo.jpg';

interface GramRutuBrandProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
  subtitle?: string;
}

export function GramRutuBrand({
  size = 'md',
  showText = true,
  theme = 'light',
  className = '',
  subtitle,
}: GramRutuBrandProps) {
  const imgSizes = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={gramRutuLogo}
        alt="GramRutu"
        className={`${imgSizes[size]} rounded-full object-cover shadow-2xs border ${
          isDark ? 'border-emerald-400/40' : 'border-emerald-500/30'
        } bg-white flex-shrink-0`}
      />
      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-black tracking-tight leading-none ${textSizes[size]} select-none`}
          >
            <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>Gram</span>
            <span className={isDark ? 'text-sky-400' : 'text-sky-600'}>Rutu</span>
          </span>
          {subtitle && (
            <span
              className={`text-[10px] font-medium truncate mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
