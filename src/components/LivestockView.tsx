import React, { useState } from 'react';
import { CattleCollarItem, Language } from '../types/farm';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  Milk,
  Zap,
  ArrowRight
} from 'lucide-react';

interface LivestockViewProps {
  collars: CattleCollarItem[];
  lang: Language;
  onUpdateCollar: (updated: CattleCollarItem) => void;
}

export const LivestockView: React.FC<LivestockViewProps> = ({
  collars,
  lang,
  onUpdateCollar,
}) => {
  const isAr = lang === 'ar';
  const [selectedCollarId, setSelectedCollarId] = useState<string>(collars[0]?.collarId || 'CLR-90214');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const activeCollar = collars.find((c) => c.collarId === selectedCollarId) || collars[0];

  const filteredCollars = collars.filter((c) => {
    if (filterStatus !== 'all' && c.healthStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.collarId.toLowerCase().includes(q) ||
        c.cowTag.toLowerCase().includes(q) ||
        c.sectorBarn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTriggerInsemination = () => {
    setActionMessage(
      isAr
        ? `تم جدولة التلقيح الاصطناعي للبقرة ${activeCollar.cowTag} مع الفريق البيطري بالمحلب رقم 01.`
        : `Artificial Insemination protocol dispatched for cow ${activeCollar.cowTag} at Parlor 01.`
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleDraftingGateIsolate = () => {
    setActionMessage(
      isAr
        ? `تم تفعيل بوابة الفرز الآلي: سيتم توجيه البقرة ${activeCollar.cowTag} تلقائياً إلى عيادة العزل البيطري عند خروجها من المحلب.`
        : `Drafting gate configured: Cow ${activeCollar.cowTag} will be autonomously routed to medical isolation.`
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Activity className="w-4 h-4" />
            <span>{isAr ? 'نظام إدارة القطيع الذكي (Livestock-Core & Smart Breeding AI)' : 'Livestock-Core & AI Breeding Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تتبع 270,000 رأس بقر بالأطواق الذكية (Smart Collars)' : '270,000 Cattle Smart Collars Telemetry'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isAr
              ? 'مراقبة حيوية لحظية: نبضات القلب، حرارة الجسم، فترات الاجترار، التنبؤ بالشياع والأمراض المبكرة'
              : 'Real-time physiological telemetry: core temperature, rumination minutes, mobility, and estrus detection.'}
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
            <div className="text-[10px] text-neutral-400">{isAr ? 'متوسط إنتاج البقرة' : 'Avg Daily Yield'}</div>
            <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">31.8 L/day</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
            <div className="text-[10px] text-neutral-400">{isAr ? 'المحالب الدائرية الآلية' : 'Rotary Parlors'}</div>
            <div className="text-base font-bold font-mono text-amber-400 tabular-nums">40 Units</div>
          </div>
        </div>
      </div>

      {/* Rotary Milking Parlor Live Atmosphere Card */}
      <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-7 relative aspect-video bg-neutral-950">
            <img
              src="/src/assets/images/dairy_smart_collar_1792517469068.jpg"
              alt="Automated Rotary Milking Parlor in Adrar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 start-3 px-2.5 py-1 rounded-md bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-200 backdrop-blur-md">
              <span>{isAr ? 'المحلب الآلي المركزي رقم 04 - حظائر تسابيت' : 'Rotary Milking Unit #04 - Tsabit Desert Hub'}</span>
            </div>
            <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-md bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono text-emerald-400 backdrop-blur-md">
              <span>80 Cow Rotary Platform · Auto-Teat Dipping</span>
            </div>
          </div>

          <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-1">
                <Milk className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'مؤشرات المحالب الآلية اللحظية' : 'Live Milking Parlor Telemetry'}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {isAr ? 'استخلاص ونقل الحليب الخام عبر شبكة التبريد' : 'Desert Climate-Controlled Milking Parlor'}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {isAr
                  ? 'تم تجهيز الأبقار بأطواق ذكية متصلة بنظام LoRaWAN مع قارئات RFID بمداخل المحالب الدائرية؛ يتم قياس كمية الحليب ونسبة الدسم فورياً وفرز الأبقار آلياً.'
                  : 'Equipped with electronic RFID smart collars. Milk volume, conductivity, and somatic cell count are sampled automatically per quarter at each stall.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block mb-1">{isAr ? 'الحليب المجمع اليوم:' : 'Daily Milk Collected:'}</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">5,358,000 L</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block mb-1">{isAr ? 'حرارة الحليب بالخزانات:' : 'Bulk Silo Temp:'}</span>
                <span className="text-sm font-bold text-cyan-400 font-mono tabular-nums">3.8 °C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Collars Table & Selected Cow AI Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Collar Directory & Filter */}
        <div className="lg:col-span-6 rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 space-y-4">
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute start-3 top-2.5" />
              <input
                type="text"
                placeholder={isAr ? 'بحث برقم الطوق أو وسم البقرة أو الحظيرة...' : 'Search collar ID, cow tag, or barn...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 ps-9 pe-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterStatus === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterStatus('estrus_alert')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterStatus === 'estrus_alert' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'شياع (Estrus)' : 'Estrus'}
              </button>
              <button
                onClick={() => setFilterStatus('heat_stress')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterStatus === 'heat_stress' ? 'bg-red-950 text-red-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'إجهاد حراري' : 'Heat Stress'}
              </button>
              <button
                onClick={() => setFilterStatus('fever_isolate')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterStatus === 'fever_isolate' ? 'bg-purple-950 text-purple-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'حمى وعزل' : 'Fever'}
              </button>
              <button
                onClick={() => setFilterStatus('healthy')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterStatus === 'healthy' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'سليمة' : 'Healthy'}
              </button>
            </div>
          </div>

          {/* List of Collars */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pe-1">
            {filteredCollars.map((c) => {
              const isSelected = c.collarId === activeCollar.collarId;
              return (
                <button
                  key={c.collarId}
                  onClick={() => setSelectedCollarId(c.collarId)}
                  className={`w-full p-3 rounded-lg border text-start transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-sm'
                      : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">{c.cowTag}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({c.collarId})</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        c.healthStatus === 'healthy'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : c.healthStatus === 'estrus_alert'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : c.healthStatus === 'heat_stress'
                          ? 'bg-red-950 text-red-400 border border-red-800/50'
                          : 'bg-purple-950 text-purple-400 border border-purple-800/50'
                      }`}
                    >
                      {c.healthStatus}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-300 mb-1.5 truncate">
                    {c.sectorBarn} · <span className="text-neutral-400 font-mono text-[11px]">{c.breed}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/60">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-red-400" />
                      <span>{c.bodyTempC}°C</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{c.ruminationMin} min rum.</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">{c.dailyMilkLiters} L/day</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (6 cols): Active Cow Biometrics & Smart Breeding AI */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-5">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold font-mono text-white">{activeCollar.cowTag}</span>
                  <span className="text-xs font-mono text-neutral-400">{activeCollar.collarId}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {activeCollar.breed}
                  </span>
                </div>
                <div className="text-xs text-neutral-300">
                  {activeCollar.sectorBarn} · {isAr ? `يوم الحلب: ${activeCollar.lactationDay}` : `Lactation Day: ${activeCollar.lactationDay}`}
                </div>
              </div>

              <div className="text-end">
                <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded ${
                  activeCollar.healthStatus === 'healthy'
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-amber-950 text-amber-300'
                }`}>
                  {activeCollar.healthStatus}
                </span>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <div className="text-base font-bold font-mono text-white tabular-nums">{activeCollar.bodyTempC}°C</div>
                <div className="text-[10px] text-neutral-400">{isAr ? 'حرارة الجسم' : 'Body Temp'}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-base font-bold font-mono text-white tabular-nums">{activeCollar.ruminationMin}</div>
                <div className="text-[10px] text-neutral-400">{isAr ? 'دقيقة اجترار' : 'Rumination min'}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-base font-bold font-mono text-white tabular-nums">{activeCollar.activitySteps}</div>
                <div className="text-[10px] text-neutral-400">{isAr ? 'مؤشر الحركة' : 'Activity Index'}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <Milk className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-base font-bold font-mono text-white tabular-nums">{activeCollar.dailyMilkLiters} L</div>
                <div className="text-[10px] text-neutral-400">{isAr ? 'إنتاج اليوم' : 'Daily Yield'}</div>
              </div>
            </div>

            {/* Smart Breeding & Veterinary AI Diagnostic Box */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'تحليل خوارزمية الذكاء الاصطناعي (Smart Breeding AI)' : 'Smart Breeding & Health AI Insight'}</span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/80">
                {activeCollar.aiNotes}
              </p>

              {/* Conditional Actions based on Status */}
              {activeCollar.healthStatus === 'estrus_alert' && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                    <span>{isAr ? 'نافذة التلقيح الاصطناعي المثالية (12 ساعة)' : 'Optimal Insemination Window'}</span>
                    <span className="font-mono text-xs">07:45:12</span>
                  </div>
                  <button
                    onClick={handleTriggerInsemination}
                    className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAr ? 'تأكيد أمر التلقيح الاصطناعي للفريق البيطري' : 'Dispatch Veterinary Insemination'}</span>
                  </button>
                </div>
              )}

              {(activeCollar.healthStatus === 'fever_isolate' || activeCollar.healthStatus === 'heat_stress') && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{isAr ? 'إجراء الحماية البيطرية الآلي' : 'Autonomous Medical Isolation Protocol'}</span>
                  </div>
                  <button
                    onClick={handleDraftingGateIsolate}
                    className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{isAr ? 'تفعيل بوابة الفرز الآلي للعزل الطبي' : 'Activate Automated Drafting Isolation Gate'}</span>
                  </button>
                </div>
              )}

              {actionMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
                  {actionMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
