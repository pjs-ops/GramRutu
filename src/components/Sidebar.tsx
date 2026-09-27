import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  MapPin,
  Wheat,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

import { GramRutuBrand } from './GramRutuBrand';
import gramRutuLogo from '../assets/gramrutu-logo.jpg';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { language } = useLanguage();

  const navItems = [
    { to: '/overview', label: language === 'mr' ? 'मुख्य माहिती' : 'Overview', icon: LayoutDashboard },
    { to: '/downscaling', label: language === 'mr' ? 'पृथक्करण' : 'Downscaling', icon: Layers },
    { to: '/panchayats', label: language === 'mr' ? 'ग्रामपंचायती' : 'Panchayats', icon: MapPin },
    { to: '/advisory', label: language === 'mr' ? 'शेती सल्ला' : 'Advisory', icon: Wheat },
    { to: '/validation', label: language === 'mr' ? 'पडताळणी' : 'Validation', icon: BarChart3 },
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } bg-slate-900 text-white flex flex-col transition-all duration-200 ease-in-out flex-shrink-0`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-3.5 border-b border-slate-800">
        {!collapsed ? (
          <GramRutuBrand
            size="sm"
            theme="dark"
            subtitle="Weather Intelligence"
          />
        ) : (
          <img
            src={gramRutuLogo}
            alt="GramRutu"
            className="w-7 h-7 rounded-full object-cover border border-emerald-400/40 shadow-xs mx-auto bg-white"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-slate-700/70 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 flex items-center justify-center border-t border-slate-700/50 text-slate-500 hover:text-white transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
