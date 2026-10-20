import React, { useState } from 'react';
import { Language } from '../types/farm';
import { JV_FINANCE_METRICS } from '../data/mockFarmData';
import { 
  Truck, 
  Layers, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  ArrowRight,
  Factory,
  Wheat,
  Scale
} from 'lucide-react';

interface SupplyChainErpViewProps {
  lang: Language;
}

export const SupplyChainErpView: React.FC<SupplyChainErpViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [activeStep, setActiveStep] = useState<number>(3);
  const [distributionFilter, setDistributionFilter] = useState<'all' | 'central' | 'east' | 'west' | 'south'>('all');
  const [currency, setCurrency] = useState<'DZD' | 'USD'>('DZD');

  const pipelineSteps = [
    {
      id: 1,
      titleAr: 'مزارع المحاور (219,000 هكتار)',
      titleEn: 'Pivot Forage Farms (219k ha)',
      statAr: '5,940 طن علف يومياً',
      statEn: '5,940 t/day fodder',
      descAr: 'حصاد دوري للشعير والذرة الصفراء والبرسيم الحجازي المروية بمحاور السقي لضمان الاكتفاء الذاتي للقطيع.',
      descEn: 'Cyclic harvest of desert alfalfa, corn silage, and barley grain from 1,400 center pivots.',
      icon: Wheat,
    },
    {
      id: 2,
      titleAr: 'محالب تسابيت ورقان (40 محلب)',
      titleEn: 'Rotary Parlors (40 Units)',
      statAr: '5.35 مليون لتر حليب/يوم',
      statEn: '5.35M L/day raw milk',
      descAr: 'حلب آلي لـ 270 ألف رأس بقر في بيئة صحراوية مكيفة، تبريد فوري في خزانات معزولة عند 3.8°م.',
      descEn: 'Rotary milking of 270,000 herd, immediate plate cooling into 50,000L insulated bulk tanks at 3.8°C.',
      icon: Layers,
    },
    {
      id: 3,
      titleAr: 'مصنع تجفيف مسحوق الحليب بأدرار',
      titleEn: 'Adrar Powder Dehydration Plant',
      statAr: '193,000 طن سنوياً (528 طن/يوم)',
      statEn: '193,000 t/yr (528 t/day)',
      descAr: 'أكبر مجمع لتجفيف الحليب في إفريقيا: 6 أبراج تجفيف بالرذاذ (Spray Drying Towers) وتعبئة أكياس 25 كغ وعبوات التجزئة.',
      descEn: 'Six industrial spray-drying towers evaporating water under vacuum, producing standard whole and skim milk powder.',
      icon: Factory,
    },
    {
      id: 4,
      titleAr: 'أسطول النقل اللوجستي الوطني',
      titleEn: 'National Distribution Fleet',
      statAr: '48 ولاية جزائرية',
      statEn: '48 Algerian Wilayas',
      descAr: 'شاحنات لوجستية مجهزة بنظام تتبع GPS لتسليم المسحوق للملبنات الوطنية ومراكز الديوان الوطني المهني للحليب.',
      descEn: 'GPS-tracked national freight fleet supplying powder to state dairy processors (ONIL) across Algeria.',
      icon: Truck,
    },
  ];

  const distributionHubs = [
    { wilayaAr: 'الجزائر العاصمة (الوسط)', wilayaEn: 'Algiers (Center Hub)', tonsMonthly: 3800, region: 'central' },
    { wilayaAr: 'وهران (الغرب)', wilayaEn: 'Oran (West Hub)', tonsMonthly: 3200, region: 'west' },
    { wilayaAr: 'قسنطينة (الشرق)', wilayaEn: 'Constantine (East Hub)', tonsMonthly: 2900, region: 'east' },
    { wilayaAr: 'سطيف (الهضاب العليا)', wilayaEn: 'Setif (High Plains)', tonsMonthly: 2400, region: 'east' },
    { wilayaAr: 'ورقلة وتمنراست (الجنوب الكبير)', wilayaEn: 'Ouargla & South Hub', tonsMonthly: 1800, region: 'south' },
  ];

  const filteredHubs = distributionFilter === 'all'
    ? distributionHubs
    : distributionHubs.filter((h) => h.region === distributionFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>{isAr ? 'سلسلة القيمة وشراكة الاستثمار الجزائري-القطري (FNI & Baladna ERP)' : 'Supply Chain Traceability & JV ERP'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مشروع مسحوق الحليب الاستراتيجي بأدرار (3.5 مليار دولار)' : 'Adrar Megaproject Strategic Supply Chain & JV'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isAr
              ? 'تتبع سلسلة الإمداد من بذور الأعلاف بالمحاور الصحراوية إلى مصنع التجفيف وشبكة التوزيع الوطنية'
              : 'End-to-end industrial traceability from field crops to powder manufacturing and Algerian national distribution.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
            <button
              onClick={() => setCurrency('DZD')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                currency === 'DZD' ? 'bg-emerald-600 text-neutral-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'دينار (دج)' : 'DZD'}
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                currency === 'USD' ? 'bg-emerald-600 text-neutral-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'دولار ($)' : 'USD'}
            </button>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-end">
            <div className="text-[10px] text-neutral-400">{isAr ? 'وفر العملة الصعبة للاستيراد' : 'Annual FX Import Savings'}</div>
            <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
              {currency === 'USD' ? '1.2 Billion USD / yr' : '161.4 مليار دج / سنوياً'}
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Traceability Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {pipelineSteps.map((step) => {
          const Icon = step.icon;
          const isSelected = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-4 rounded-xl border text-start transition-all ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-sm'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  Step 0{step.id}
                </span>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {isAr ? step.titleAr : step.titleEn}
              </div>
              <div className="text-xs font-mono font-semibold text-amber-400 mb-2">
                {isAr ? step.statAr : step.statEn}
              </div>
              <div className="text-xs text-neutral-400 line-clamp-2">
                {isAr ? step.descAr : step.descEn}
              </div>
            </button>
          );
        })}
      </div>

      {/* Joint Venture Financial & Economic Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): FNI & Baladna Financial Metrics & KPI Cards */}
        <div className="lg:col-span-7 rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                {isAr ? 'مؤشرات الشراكة الجزائرية القطرية (FNI & Baladna)' : 'Joint Venture Agreement Metrics'}
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">JV Active · Decree 2024</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400 block mb-1">{isAr ? 'الطرف الجزائري:' : 'Algerian Partner:'}</span>
              <span className="font-semibold text-white">{JV_FINANCE_METRICS.partnerAlgeria}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400 block mb-1">{isAr ? 'الطرف القطري:' : 'Qatari Partner:'}</span>
              <span className="font-semibold text-white">{JV_FINANCE_METRICS.partnerQatar}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400 block mb-1">{isAr ? 'إجمالي الاستثمار بالمشروع:' : 'Total Capital Investment:'}</span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                {currency === 'USD' ? '3,500,000,000 $ (3.5B USD)' : '470,750,000,000 دج (470 مليار)'}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400 block mb-1">{isAr ? 'نسبة تغطية الاستيراد الوطني:' : 'National Import Coverage:'}</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">{JV_FINANCE_METRICS.targetNationalSelfSufficiencyPct}% {isAr ? 'من احتياج الجزائر' : "of Algeria's demand"}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">
                {isAr ? 'مؤشر الاكتفاء الذاتي من الأعلاف الخضراء والمجففة' : 'Fodder Self-Sufficiency Index'}
              </span>
              <span className="font-mono text-emerald-400 font-bold">100% (صفر استيراد أعلاف)</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {isAr
                ? 'تنتج الـ 219 ألف هكتار في أدرار كامل الاحتياج اليومي للقطيع (5,940 طن) من الذرة السيلاج والشعير والفصة، مما يعزل المزرعة تماماً عن تقلبات أسعار الأعلاف العالمية.'
                : '1,400 center pivots produce 100% of daily herd Dry Matter requirement (5,940 t/day), fully shielding the project from global grain market volatility.'}
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): National Distribution Dispatcher */}
        <div className="lg:col-span-5 rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'مراكز التوزيع بالمحافظات' : 'National Wilaya Distribution'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Monthly Shipments</span>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setDistributionFilter('all')}
              className={`px-2 py-0.5 rounded text-xs ${distributionFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setDistributionFilter('central')}
              className={`px-2 py-0.5 rounded text-xs ${distributionFilter === 'central' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
            >
              {isAr ? 'الوسط' : 'Center'}
            </button>
            <button
              onClick={() => setDistributionFilter('east')}
              className={`px-2 py-0.5 rounded text-xs ${distributionFilter === 'east' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
            >
              {isAr ? 'الشرق' : 'East'}
            </button>
            <button
              onClick={() => setDistributionFilter('west')}
              className={`px-2 py-0.5 rounded text-xs ${distributionFilter === 'west' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
            >
              {isAr ? 'الغرب' : 'West'}
            </button>
          </div>

          <div className="space-y-2">
            {filteredHubs.map((hub, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{isAr ? hub.wilayaAr : hub.wilayaEn}</div>
                  <div className="text-[10px] text-neutral-500 font-mono">GPS Tracked Fleet · Cold Container</div>
                </div>
                <div className="text-end">
                  <span className="font-mono font-bold text-amber-400 tabular-nums">{hub.tonsMonthly.toLocaleString()} t</span>
                  <span className="text-[10px] text-neutral-400 block">{isAr ? 'شهرياً' : '/ month'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
            <span>{isAr ? 'فرص العمل المباشرة المنشأة بأدرار:' : 'Direct employment created in Adrar:'}</span>
            <span className="font-mono font-bold text-emerald-400">5,000 {isAr ? 'مهندس وتقني' : 'Jobs'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
