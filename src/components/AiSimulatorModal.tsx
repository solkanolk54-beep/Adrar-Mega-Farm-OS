import React, { useState } from 'react';
import { Language, FarmKpis, SystemAlert } from '../types/farm';
import { calculateEvapotranspiration } from '../logic/farmCalculations';
import { 
  X, 
  Sun, 
  Wind, 
  Droplet, 
  Cpu, 
  Check, 
  Sparkles, 
  Play, 
  AlertTriangle 
} from 'lucide-react';

interface AiSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentKpis: FarmKpis;
  onApplyScenario: (newKpis: Partial<FarmKpis>, newAlert: SystemAlert) => void;
}

export const AiSimulatorModal: React.FC<AiSimulatorModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentKpis,
  onApplyScenario,
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const [simTemp, setSimTemp] = useState<number>(45);
  const [simHumidity, setSimHumidity] = useState<number>(12);
  const [simWind, setSimWind] = useState<number>(30);
  const [simRadiation, setSimRadiation] = useState<number>(26);
  const [activePreset, setActivePreset] = useState<string>('heatwave');
  const [applied, setApplied] = useState(false);

  // Real calculation using the pure logic module
  const calculatedEt0 = calculateEvapotranspiration({
    temperatureC: simTemp,
    humidityPercent: simHumidity,
    windKmH: simWind,
    solarRadiationMJ: simRadiation,
  });

  const presets = [
    {
      id: 'heatwave',
      titleAr: 'موجة حر صحراوية قاسية (48°م)',
      titleEn: 'Extreme Sahara Heatwave (48°C)',
      temp: 48,
      humidity: 8,
      wind: 24,
      radiation: 29,
      aiActionAr: 'تشغيل أنظمة التبريد بالرذاذ في الحظائر، وضبط سرعة المحاور لـ 85% لتقليل الإجهاد الحراري للمحاصيل.',
      aiActionEn: 'Activate evaporative cooling misting in all barns, accelerate pivot rotation to 85% to protect soil.',
    },
    {
      id: 'sandstorm',
      titleAr: 'عاصفة رملية سيروكو (Chihili 65 كم/سا)',
      titleEn: 'Sirocco Sandstorm (65 km/h)',
      temp: 42,
      humidity: 15,
      wind: 65,
      radiation: 16,
      aiActionAr: 'تثبيت المحاور في اتجاه الرياح المعاكس، إغلاق ستائر الحظائر الهوائية، وتفعيل وضع حماية مرشحات المضخات.',
      aiActionEn: 'Align pivot spans parallel to prevailing winds, lower barn gale curtains, run pump filter self-clean.',
    },
    {
      id: 'aquifer_conservation',
      titleAr: 'وضع ترشيد المياه الجوفية الذكي (Eco-Conservation)',
      titleEn: 'Deep Aquifer Eco-Conservation Mode',
      temp: 36,
      humidity: 20,
      wind: 14,
      radiation: 22,
      aiActionAr: 'إعادة جدولة 85% من الري ليلاً لتوفير 34% من التبخر، مع خفض تدفق الرشاشات وتوزيع النيتروجين بالتنقيط.',
      aiActionEn: 'Shift 85% of irrigation to night hours (22:00-05:00), saving 34% evaporation water losses.',
    },
    {
      id: 'winter_optimum',
      titleAr: 'الموسم الشتوي المعتدل بأدرار (24°م)',
      titleEn: 'Adrar Winter Optimum (24°C)',
      temp: 24,
      humidity: 32,
      wind: 12,
      radiation: 18,
      aiActionAr: 'ذروة إنتاج الحليب لجميع الحظائر (36 لتر/بقرة) مع استهلاك مائي أدنى لمحاور القمح والشعير.',
      aiActionEn: 'Peak lactation curve (36 L/cow) with lowest seasonal water requirement for winter grain crops.',
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setActivePreset(p.id);
    setSimTemp(p.temp);
    setSimHumidity(p.humidity);
    setSimWind(p.wind);
    setSimRadiation(p.radiation);
  };

  const handleApply = () => {
    const selected = presets.find((p) => p.id === activePreset) || presets[0];
    const newKpis: Partial<FarmKpis> = {
      ambientTempC: simTemp,
      humidityPct: simHumidity,
      windSpeedKmH: simWind,
      totalWaterPumpingM3H: Math.round(142800 * (calculatedEt0 / 8.4)),
    };

    const newAlert: SystemAlert = {
      id: `sim-alt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      severity: simTemp > 45 ? 'critical' : 'warning',
      layer: 4,
      source: 'AI Weather & Ops Simulator',
      titleAr: `تم تفعيل سيناريو: ${selected.titleAr}`,
      titleEn: `Scenario applied: ${selected.titleEn}`,
      descAr: selected.aiActionAr,
      descEn: selected.aiActionEn,
      resolved: false,
    };

    onApplyScenario(newKpis, newAlert);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'محاكي العمليات والظروف المناخية الصحراوية' : 'Sahara Climate & Operations AI Simulator'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isAr ? 'اختبار استجابة خوارزميات أدرار للحرارة الشديدة وترشيد المياه' : 'Simulate weather events & autonomous system response'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {presets.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-lg border text-start transition-all ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="font-semibold text-xs text-white mb-1">
                  {isAr ? preset.titleAr : preset.titleEn}
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-2">
                  {isAr ? preset.aiActionAr : preset.aiActionEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sliders Grid */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span>{isAr ? 'المحددات المناخية المعدلة:' : 'Adjust Climate Parameters:'}</span>
            <span className="font-mono text-cyan-400">
              ET0: <span className="font-bold text-white">{calculatedEt0}</span> mm/day
            </span>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>{isAr ? 'درجة الحرارة في أدرار:' : 'Ambient Temperature:'}</span>
              <span className="font-mono text-red-400 font-bold">{simTemp} °C</span>
            </div>
            <input
              type="range"
              min="15"
              max="52"
              value={simTemp}
              onChange={(e) => setSimTemp(parseInt(e.target.value, 10))}
              className="w-full accent-red-400 cursor-pointer"
            />
          </div>

          {/* Wind Speed Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>{isAr ? 'سرعة الرياح الصحراوية:' : 'Desert Wind Speed:'}</span>
              <span className="font-mono text-amber-400 font-bold">{simWind} km/h</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={simWind}
              onChange={(e) => setSimWind(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Humidity Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-300">
              <span>{isAr ? 'الرطوبة النسبية:' : 'Relative Humidity:'}</span>
              <span className="font-mono text-blue-400 font-bold">{simHumidity}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={simHumidity}
              onChange={(e) => setSimHumidity(parseInt(e.target.value, 10))}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleApply}
          className="w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {applied ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>
            {applied
              ? (isAr ? 'تم تطبيق السيناريو على لوحة العمليات الحية!' : 'Scenario applied successfully!')
              : (isAr ? 'تطبيق السيناريو على كامل منظومة المزرعة' : 'Apply Scenario to Farm OS')}
          </span>
        </button>
      </div>
    </div>
  );
};
