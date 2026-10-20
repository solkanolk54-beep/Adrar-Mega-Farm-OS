import React from 'react';
import { Language, UserRole } from '../types/farm';
import { Sliders, Globe, Shield, Terminal } from 'lucide-react';

interface TopBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenSimulator: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onTabChange,
  lang,
  onLangChange,
  role,
  onRoleChange,
  onOpenSimulator,
}) => {
  const isAr = lang === 'ar';

  const navItems = [
    { id: 'overview', labelAr: 'مركز القيادة', labelEn: 'Command Center' },
    { id: 'execution_plan', labelAr: 'المخطط التنفيذي (4 خطوات)', labelEn: 'Execution Plan (4 Steps)' },
    { id: 'pivots', labelAr: 'محاور السقي (1,400)', labelEn: 'Pivots GIS (1,400)' },
    { id: 'architecture', labelAr: 'المعمارية التقنية', labelEn: 'Architecture' },
    { id: 'livestock', labelAr: 'إدارة القطيع (270k)', labelEn: 'Livestock AI (270k)' },
    { id: 'supply_chain', labelAr: 'سلسلة الإمداد والشراكة', labelEn: 'Supply Chain & JV' },
  ];

  const roleLabels: Record<UserRole, { ar: string; en: string }> = {
    adrar_field: { ar: 'ميدان أدرار', en: 'Adrar Field' },
    algiers_hq: { ar: 'مقر الجزائر', en: 'Algiers HQ' },
    doha_board: { ar: 'مجلس الدوحة', en: 'Doha Board' },
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      {/* Main Top Bar (Strict 3 Zones) */}
      <div className="flex items-center justify-between gap-2 sm:gap-8 px-3 sm:px-6 py-3">
        {/* Zone 1: Single Brand Element */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs sm:text-sm">
            A
          </div>
          <button
            onClick={() => onTabChange('overview')}
            className="text-sm sm:text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 text-start"
          >
            {isAr ? 'نظام تشغيل مزرعة أدرار' : 'Adrar Mega-Farm OS'}
          </button>
        </div>

        {/* Zone 2: 5 Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-400">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                  isActive ? 'text-emerald-400 font-semibold' : 'hover:text-neutral-200'
                }`}
              >
                {isAr ? item.labelAr : item.labelEn}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Controls & Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-300">
            <Shield className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer text-xs"
              aria-label="User role switcher"
            >
              <option value="adrar_field" className="bg-neutral-900">{isAr ? roleLabels.adrar_field.ar : roleLabels.adrar_field.en}</option>
              <option value="algiers_hq" className="bg-neutral-900">{isAr ? roleLabels.algiers_hq.ar : roleLabels.algiers_hq.en}</option>
              <option value="doha_board" className="bg-neutral-900">{isAr ? roleLabels.doha_board.ar : roleLabels.doha_board.en}</option>
            </select>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => onLangChange(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-md hover:bg-neutral-800 transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden xs:inline">{isAr ? 'English' : 'العربية'}</span>
          </button>

          {/* Primary CTA: Scenario Simulator */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'محاكي العمليات والطقس' : 'Climate & Ops Simulator'}</span>
            <span className="sm:hidden">{isAr ? 'المحاكي' : 'Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs Strip */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-3 py-2 border-t border-neutral-800/80 bg-neutral-950/80 text-xs no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs transition-colors shrink-0 ${
                isActive
                  ? 'bg-neutral-800 text-emerald-400 font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? item.labelAr : item.labelEn}
            </button>
          );
        })}
      </div>
    </header>
  );
};
