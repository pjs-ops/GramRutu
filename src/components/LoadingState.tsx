import gramRutuLogo from '../assets/gramrutu-logo.jpg';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-3 flex items-center justify-center">
        <img
          src={gramRutuLogo}
          alt="GramRutu"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-md bg-white animate-pulse"
        />
        <div className="absolute -inset-1 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-sm font-black tracking-tight mb-0.5 select-none">
        <span className="text-emerald-600">Gram</span>
        <span className="text-sky-600">Rutu</span>
      </div>
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
}
