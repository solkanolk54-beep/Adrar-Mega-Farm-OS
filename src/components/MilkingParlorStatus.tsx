import React from 'react';
import { Language } from '../types/farm';
import { Disc, Droplet, Thermometer, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface MilkingParlorStatusData {
  flowRateLMin?: number;
  tankTempC?: number;
  quarantineCount?: number;
  activeStalls?: number;
  totalStalls?: number;
  carouselRpm?: number;
  todayMilkLiters?: number;
}

interface MilkingParlorStatusProps {
  status?: MilkingParlorStatusData;
  lang?: Language;
}

export const MilkingParlorStatus: React.FC<MilkingParlorStatusProps> = ({
  status = {},
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  const flowRate = status.flowRateLMin ?? 1240;
  const tankTemp = status.tankTempC ?? 3.8;
  const quarantine = status.quarantineCount ?? 12;
  const activeStalls = status.activeStalls ?? 76;
  const totalStalls = status.totalStalls ?? 80;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Title & Live Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Disc className="w-4 h-4 animate-spin [animation-duration:8s]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-400">
              {isAr ? 'المحلب الآلي الدوار 01 (Rotary Milking Parlor)' : 'Rotary Milking Parlor 01'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'منصة دوارة آلية لـ 80 بقرة مع تعقيم وتبريد فوري لسلسلة الحليب الخام' : 'Automated 80-stall rotary carousel with inline cold-chain chilling'}
            </p>
          </div>
        </div>

        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Cold Chain Active (3.8°C)</span>
        </span>
      </div>

      {/* 3 Key Gauges requested by user */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        {/* Metric 1 */}
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80 shadow transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-slate-400 text-xs">
            <Droplet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'تدفق الحلب اللحظي' : 'Real-time Milking Flow'}</span>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono tracking-tight mt-1">{flowRate.toLocaleString()} L/min</p>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">~74,400 L/h direct extraction</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80 shadow transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-slate-400 text-xs">
            <Thermometer className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAr ? 'حرارة الصهاريج' : 'Silo Tank Temperature'}</span>
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono tracking-tight mt-1">{tankTemp} °C</p>
          <span className="text-[10px] text-emerald-400 mt-1 block flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isAr ? 'نطاق تبريد آمن (< 4.0°م)' : 'Safe Cooling (< 4.0°C)'}</span>
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80 shadow transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-slate-400 text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'الأبقار المفروزة للعزل' : 'Isolated for Quarantine'}</span>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono tracking-tight mt-1">{quarantine} Head</p>
          <span className="text-[10px] text-amber-400/90 mt-1 block">
            {isAr ? 'فرز آلي عبر RFID قبل الصهريج' : 'RFID auto-gate diverted'}
          </span>
        </div>
      </div>

      {/* Rotary Carousel Visual Strip */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">{isAr ? 'نسبة إشغال منصة المحلب الدوار:' : 'Stall Occupancy:'}</span>
          <div className="flex items-center gap-2">
            <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(activeStalls / totalStalls) * 100}%` }} 
              />
            </div>
            <span className="font-mono text-white font-bold">{activeStalls}/{totalStalls} ({Math.round((activeStalls / totalStalls) * 100)}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Speed: <strong className="text-white">8.5 min/rev</strong></span>
          <span>Vacuum: <strong className="text-white">42.0 kPa</strong></span>
          <span>CIP Clean: <strong className="text-emerald-400">Ready in 3h</strong></span>
        </div>
      </div>
    </div>
  );
};
