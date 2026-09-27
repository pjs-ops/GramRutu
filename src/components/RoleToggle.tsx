import { useLanguage } from '../context/LanguageContext';
import type { UserRole } from '../types';

interface RoleToggleProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleToggle({ role, onRoleChange }: RoleToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => onRoleChange('farmer')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
          role === 'farmer'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        {t('role.farmer')}
      </button>
      <button
        type="button"
        onClick={() => onRoleChange('officer')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
          role === 'officer'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        {t('role.officer')}
      </button>
    </div>
  );
}
