import React, { useState } from 'react';
import { Language } from '../types/farm';
import { DollarSign, Droplet, Activity, RefreshCw } from 'lucide-react';

export interface ExecutiveKpisData {
  investmentUsd: number;
  importSavingsUsd: number;
  milkPowderAnnualTons: number;
  milkPowderDailyTons: number;
  herdTotal: number;
  estrusCount: number;
  totalPivots: number;
  activePivots: number;
}

interface ExecutiveKpisProps {
  data?: Partial<ExecutiveKpisData>;
  currency?: 'USD' | 'DZD';
  onCurrencyChange?: (c: 'USD' | 'DZD') => void;
  lang?: Language;
}

export const ExecutiveKpis: React.FC<ExecutiveKpisProps> = ({
  data = {},
  currency: initialCurrency = 'USD',
  onCurrencyChange,
  lang = 'ar',
}) => {
  const [internalCurrency, setInternalCurrency] = useState<'USD' | 'DZD'>(initialCurrency);
  const currency = onCurrencyChange ? initialCurrency : internalCurrency;
  const isAr = lang === 'ar';

  const setCurrency = (c: 'USD' | 'DZD') => {
    setInternalCurrency(c);
    onCurrencyChange?.(c);
  };

  // 1 USD = 134.50 DZD
  const dzdRate = 134.5;
  const investment = currency === 'USD' ? '$3.5 Billion' : '470.75 مليار دج';
  const importSavings = currency === 'USD' ? '$1.2B' : '161.4 مليار دج';

  return (
    <div className="space-y-3" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header with Currency Switcher */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-xs font-bold text-neutral-300">
            {isAr ? 'مؤشرات الأداء الاستراتيجية (Executive KPIs)' : 'Strategic Executive KPIs'}
          </h3>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
              currency === 'USD' ? 'bg-emerald-600 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            $ USD
          </button>
          <button
            onClick={() => setCurrency('DZD')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
              currency === 'DZD' ? 'bg-emerald-600 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            دج DZD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. بطاقة الاستثمار والوفر المالي */}
        <div className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-xl border border-slate-700/80 shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              {isAr ? 'الشراكة الاستراتيجية (FNI / بلدنا)' : 'Strategic JV (FNI / Baladna)'}
            </p>
            <DollarSign className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-white mt-1 font-mono tracking-tight">{investment}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>{isAr ? 'الوفر السنوي من الاستيراد:' : 'Annual Import Savings:'}</span>
            <span className="text-emerald-400 font-bold font-mono">{importSavings}</span>
          </p>
        </div>

        {/* 2. بطاقة إنتاج الحليب اليومي والسنوي */}
        <div className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-xl border border-slate-700/80 shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
              {isAr ? 'هدف مصنع بودرة الحليب' : 'Milk Powder Plant Target'}
            </p>
            <Droplet className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-white mt-1 font-mono tracking-tight">193,000 Ton/Yr</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>{isAr ? 'الإنتاج اليومي الحقيقي:' : 'Real Daily Output:'}</span>
            <span className="text-blue-400 font-bold font-mono">528.7 Ton</span>
          </p>
        </div>

        {/* 3. بطاقة القطيع الوطني/الأمريكي */}
        <div className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-xl border border-slate-700/80 shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {isAr ? 'إجمالي القطيع (US-DZ Lineage)' : 'Total Herd (US-DZ Lineage)'}
            </p>
            <Activity className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-white mt-1 font-mono tracking-tight">270,000 Head</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>{isAr ? 'جاهزية التلقيح (Estrus):' : 'Insemination Ready:'}</span>
            <span className="text-amber-400 font-bold font-mono">1,840 (0.68%)</span>
          </p>
        </div>

        {/* 4. بطاقة المساحات والمحاور */}
        <div className="bg-slate-900/90 hover:bg-slate-900 p-4 rounded-xl border border-slate-700/80 shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
              {isAr ? 'الري الذكي (أدرار 219k Ha)' : 'Smart Irrigation (219k Ha)'}
            </p>
            <RefreshCw className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-black text-white mt-1 font-mono tracking-tight">1,400 Pivots</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>{isAr ? 'نشط الآن:' : 'Active Now:'}</span>
            <span className="text-purple-400 font-bold font-mono">1,182 (84.4%)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
