import { ChevronDown } from 'lucide-react';
import { getLocationOptions } from '../services/weatherService';

interface LocationSelectorProps {
  state: string;
  district: string;
  block: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
  onBlockChange: (block: string) => void;
}

export function LocationSelector({
  state,
  district,
  block,
  onStateChange,
  onDistrictChange,
  onBlockChange,
}: LocationSelectorProps) {
  const options = getLocationOptions();

  return (
    <div className="flex items-center gap-3">
      <SelectField
        label="State"
        value={state}
        options={options.states}
        onChange={(val) => {
          onStateChange(val);
          const districts = options.districts[val] || [];
          onDistrictChange(districts[0] || '');
          const blocks = options.blocks[districts[0] || ''] || [];
          onBlockChange(blocks[0] || '');
        }}
      />
      <ChevronDown className="w-4 h-4 text-slate-400 rotate-[-90deg]" />
      <SelectField
        label="District"
        value={district}
        options={options.districts[state] || []}
        onChange={(val) => {
          onDistrictChange(val);
          const blocks = options.blocks[val] || [];
          onBlockChange(blocks[0] || '');
        }}
      />
      <ChevronDown className="w-4 h-4 text-slate-400 rotate-[-90deg]" />
      <SelectField
        label="Block"
        value={block}
        options={options.blocks[district] || []}
        onChange={onBlockChange}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-white border border-gray-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none pr-8 min-w-[120px] cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
