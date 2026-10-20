import React, { useState } from 'react';
import { PivotItem, Language, CropType } from '../types/farm';
import { 
  calculatePivotWaterVolume, 
  calculatePivotRotationHours 
} from '../logic/farmCalculations';
import { 
  Droplet, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Square, 
  Radio, 
  Gauge, 
  Satellite, 
  Sprout, 
  Search,
  Filter
} from 'lucide-react';

interface PivotGisViewProps {
  pivots: PivotItem[];
  lang: Language;
  selectedPivotId?: string;
  onUpdatePivot: (updated: PivotItem) => void;
}

export const PivotGisView: React.FC<PivotGisViewProps> = ({
  pivots,
  lang,
  selectedPivotId,
  onUpdatePivot,
}) => {
  const isAr = lang === 'ar';
  const [selectedId, setSelectedId] = useState<string>(selectedPivotId || pivots[0]?.id || 'p-0412');
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const activePivot = pivots.find((p) => p.id === selectedId) || pivots[0];

  // Editable state for the active pivot
  const [editSpeed, setEditSpeed] = useState<number>(activePivot.rotationSpeedPct);
  const [editDepth, setEditDepth] = useState<number>(activePivot.waterDepthMm);
  const [editFertigation, setEditFertigation] = useState<boolean>(activePivot.fertigationActive);

  // Sync when active pivot changes
  React.useEffect(() => {
    if (activePivot) {
      setEditSpeed(activePivot.rotationSpeedPct);
      setEditDepth(activePivot.waterDepthMm);
      setEditFertigation(activePivot.fertigationActive);
    }
  }, [selectedId]);

  const filteredPivots = pivots.filter((p) => {
    if (filterCrop !== 'all' && p.crop !== filterCrop) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q) ||
        p.cropNameAr.toLowerCase().includes(q) ||
        p.cropNameEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApplyChanges = () => {
    const isRunning = editSpeed > 0;
    const updated: PivotItem = {
      ...activePivot,
      rotationSpeedPct: editSpeed,
      waterDepthMm: editDepth,
      fertigationActive: editFertigation,
      status: isRunning ? (activePivot.status === 'warning' ? 'warning' : 'running') : 'idle',
      flowRateM3H: isRunning ? Math.round(150 + editDepth * 10) : 0,
      pumpPowerKw: isRunning ? Math.round(35 + editDepth * 2) : 0,
    };
    onUpdatePivot(updated);
    setAppliedNotification(
      isAr
        ? `تم إرسال الأمر إلى المحور ${updated.code} عبر LoRaWAN: سرعة الدوران ${editSpeed}%، عمق الري ${editDepth} مم`
        : `Command sent to ${updated.code} via LoRaWAN: Speed ${editSpeed}%, Depth ${editDepth}mm`
    );
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  const handleToggleRunning = () => {
    if (activePivot.status === 'running') {
      setEditSpeed(0);
      const updated: PivotItem = {
        ...activePivot,
        status: 'idle',
        rotationSpeedPct: 0,
        flowRateM3H: 0,
        pumpPowerKw: 0,
      };
      onUpdatePivot(updated);
    } else {
      setEditSpeed(75);
      const updated: PivotItem = {
        ...activePivot,
        status: 'running',
        rotationSpeedPct: 75,
        flowRateM3H: 185,
        pumpPowerKw: 45,
      };
      onUpdatePivot(updated);
    }
  };

  // Calculated geometry values using pure logic
  const waterVolumeM3 = calculatePivotWaterVolume(activePivot.radiusM, editDepth);
  const rotationHours = calculatePivotRotationHours(activePivot.radiusM, Math.max(5, editSpeed));

  return (
    <div className="space-y-6">
      {/* View Header with 1,400 Pivots Summary */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? 'منظومة التحكم ومراقبة محاور السقي (Agri-Irrigation-Engine)' : 'Agri-Irrigation GIS Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مصفوفة الـ 1,400 محور سقي بدقة سنتيمترية (PostGIS)' : '1,400 Center Pivots Matrix (PostGIS 219k ha)'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isAr
              ? 'مراقبة فورية للزوايا، تدفق المياه الجوفية، ضغط الرشاشات، وتحليل الإجهاد النباتي بالأقمار الصناعية'
              : 'Centimeter-accurate telemetry: rotation angles, well discharge, water pressure, and satellite NDVI.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
            <div className="text-[10px] text-neutral-400">{isAr ? 'المحاور النشطة' : 'Active Pivots'}</div>
            <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">1,372 / 1,400</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
            <div className="text-[10px] text-neutral-400">{isAr ? 'المساحة المروية' : 'Irrigated Area'}</div>
            <div className="text-base font-bold font-mono text-cyan-400 tabular-nums">70,280 ha</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Pivot Search, Filter & List Grid */}
        <div className="lg:col-span-5 rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 space-y-4 flex flex-col">
          {/* Search & Filter Bar */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute start-3 top-2.5" />
              <input
                type="text"
                placeholder={isAr ? 'بحث برمز المحور أو القطاع أو المحصول...' : 'Search pivot ID, sector, or crop...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 ps-9 pe-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Crop Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFilterCrop('all')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterCrop === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'الكل' : 'All Crops'}
              </button>
              <button
                onClick={() => setFilterCrop('barley')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterCrop === 'barley' ? 'bg-neutral-800 text-amber-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'شعير' : 'Barley'}
              </button>
              <button
                onClick={() => setFilterCrop('wheat')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterCrop === 'wheat' ? 'bg-neutral-800 text-yellow-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'قمح' : 'Wheat'}
              </button>
              <button
                onClick={() => setFilterCrop('alfalfa')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterCrop === 'alfalfa' ? 'bg-neutral-800 text-emerald-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'فصة (برسيم)' : 'Alfalfa'}
              </button>
              <button
                onClick={() => setFilterCrop('silage_corn')}
                className={`px-2.5 py-1 rounded whitespace-nowrap text-xs transition-colors ${
                  filterCrop === 'silage_corn' ? 'bg-neutral-800 text-cyan-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'ذرة سيلاج' : 'Corn'}
              </button>
            </div>
          </div>

          {/* Pivot List with Live Status */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pe-1">
            {filteredPivots.map((p) => {
              const isSelected = p.id === activePivot.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full p-3 rounded-lg border text-start transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-sm'
                      : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">{p.code}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">r={p.radiusM}m (~50ha)</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        p.status === 'running'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : p.status === 'warning'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-300 mb-1.5 truncate">
                    {isAr ? p.cropNameAr : p.cropNameEn} · <span className="text-neutral-400 text-[11px]">{p.sector}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/60">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>{p.currentAngle}°</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-blue-400" />
                      <span>{p.waterDepthMm} mm ({p.waterPressureBar} bar)</span>
                    </span>
                    <span className="text-emerald-400">NDVI {p.ndviScore}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Pivot Deep Telemetry & Remote Control Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Pivot Header & Radar Graphic */}
          <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold font-mono text-white">{activePivot.code}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    activePivot.status === 'running' ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {activePivot.status}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">LoRa Ping: {activePivot.lastLoRaPingSec}s</span>
                </div>
                <div className="text-xs text-neutral-300">
                  {activePivot.sector} · {isAr ? activePivot.cropNameAr : activePivot.cropNameEn}
                </div>
              </div>

              {/* Toggle Start/Stop Button */}
              <button
                onClick={handleToggleRunning}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  activePivot.status === 'running'
                    ? 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-neutral-950'
                }`}
              >
                {activePivot.status === 'running' ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{activePivot.status === 'running' ? (isAr ? 'إيقاف المحور' : 'Halt Pivot') : (isAr ? 'تشغيل المحور' : 'Start Pivot')}</span>
              </button>
            </div>

            {/* Visual Radar of Center Pivot Rotation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Radar SVG */}
              <div className="relative aspect-square max-w-[240px] mx-auto w-full flex items-center justify-center p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Concentric Tower Rings */}
                  <circle cx="100" cy="100" r="85" fill="#042f2e" fillOpacity="0.4" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="#115e59" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="100" cy="100" r="35" fill="none" stroke="#115e59" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Center Pivot Anchor Point */}
                  <circle cx="100" cy="100" r="6" fill="#06b6d4" />

                  {/* Angle Wedge / Sector coverage */}
                  <path
                    d={`M 100 100 L 100 15 A 85 85 0 0 1 ${
                      100 + 85 * Math.sin((activePivot.currentAngle * Math.PI) / 180)
                    } ${100 - 85 * Math.cos((activePivot.currentAngle * Math.PI) / 180)} Z`}
                    fill="#10b981"
                    fillOpacity="0.2"
                  />

                  {/* Outer Rotating Span Arm */}
                  <line
                    x1="100"
                    y1="100"
                    x2={100 + 85 * Math.sin((activePivot.currentAngle * Math.PI) / 180)}
                    y2={100 - 85 * Math.cos((activePivot.currentAngle * Math.PI) / 180)}
                    stroke="#22d3ee"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Outer End-Gun Sprinkler Dot */}
                  <circle
                    cx={100 + 85 * Math.sin((activePivot.currentAngle * Math.PI) / 180)}
                    cy={100 - 85 * Math.cos((activePivot.currentAngle * Math.PI) / 180)}
                    r="4"
                    fill="#38bdf8"
                  />
                </svg>

                <div className="absolute bottom-2 text-center text-[10px] text-cyan-400">
                  <span>{isAr ? 'زاوية الدوران: ' : 'Angle: '}</span>
                  <span className="font-mono font-bold">{activePivot.currentAngle}°</span>
                </div>
              </div>

              {/* Dynamic Telemetry Specs */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">{isAr ? 'القطر والمساحة:' : 'Radius & Area:'}</span>
                  <span className="text-white font-semibold"><span className="font-mono">{activePivot.radiusM} m</span> (~50.2 ha)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">{isAr ? 'ضغط الماء وتدفق المضخة:' : 'Pressure & Well Flow:'}</span>
                  <span className="text-cyan-400 font-semibold font-mono">{activePivot.waterPressureBar} bar · {activePivot.flowRateM3H} m³/h</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">{isAr ? 'مؤشر النمو الخضري NDVI:' : 'Satellite NDVI Health:'}</span>
                  <span className="text-emerald-400 font-semibold font-mono">{activePivot.ndviScore} (Optimal)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">{isAr ? 'زمن إتمام دورة 360° كاملة:' : 'Full 360° Turn Time:'}</span>
                  <span className="text-amber-400 font-semibold"><span className="font-mono">{rotationHours}</span> {isAr ? 'ساعة' : 'hours'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">{isAr ? 'حجم المياه لكل دورة:' : 'Water per full turn:'}</span>
                  <span className="text-blue-400 font-semibold font-mono">{waterVolumeM3.toLocaleString()} m³</span>
                </div>
              </div>
            </div>

            {/* Soil Moisture Multi-Depth Sensor Bars */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isAr ? 'حساسات رطوبة التربة عبر 3 أعماق (Soil Moisture TDR)' : 'Soil Moisture at 3 Depths (TDR)'}</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Field Capacity: 35-45%</span>
              </div>

              {/* 10cm Depth */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>10 cm ({isAr ? 'سطحية - Topsoil' : 'Topsoil'}):</span>
                  <span className="text-neutral-200 font-mono font-bold">{activePivot.soil10cm}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${activePivot.soil10cm * 1.5}%` }} />
                </div>
              </div>

              {/* 30cm Depth */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>30 cm ({isAr ? 'منطقة الجذور - Root Zone' : 'Root Zone'}):</span>
                  <span className="text-emerald-400 font-semibold">
                    <span className="font-mono">{activePivot.soil30cm}%</span> {isAr ? '(مثالية)' : '(Optimal)'}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activePivot.soil30cm * 1.5}%` }} />
                </div>
              </div>

              {/* 60cm Depth */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300">
                  <span>60 cm ({isAr ? 'الصرف العميق - Subsoil' : 'Subsoil'}):</span>
                  <span className="text-blue-400 font-semibold font-mono">{activePivot.soil60cm}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activePivot.soil60cm * 1.5}%` }} />
                </div>
              </div>
            </div>

            {/* Remote Control Sliders & Fertigation */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'لوحة الأوامر اللاسلكية عن بعد (Remote SCADA)' : 'Remote LoRa SCADA Control'}</span>
              </div>

              {/* Water Depth Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <label htmlFor="depth-slider">{isAr ? 'عمق مياه الري المطلوبة (Application Depth):' : 'Irrigation Depth:'}</label>
                  <span className="font-mono text-cyan-400 font-bold tabular-nums">{editDepth} mm</span>
                </div>
                <input
                  id="depth-slider"
                  type="range"
                  min="2"
                  max="15"
                  step="0.5"
                  value={editDepth}
                  onChange={(e) => setEditDepth(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Rotation Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <label htmlFor="speed-slider">{isAr ? 'سرعة دوران المحور (Speed %):' : 'Rotation Speed:'}</label>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">{editSpeed}%</span>
                </div>
                <input
                  id="speed-slider"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={editSpeed}
                  onChange={(e) => setEditSpeed(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Fertigation Injection Checkbox */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <div className="text-xs">
                  <div className="font-medium text-white">{isAr ? 'حقن الأسمدة السائلة (Fertigation NPK)' : 'Liquid Fertigation Injection'}</div>
                  <div className="text-[10px] text-neutral-400">{isAr ? 'خلط المغذيات مباشرة في شبكة الرذاذ' : 'Direct inline nutrient dosing'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditFertigation(!editFertigation)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    editFertigation ? 'bg-emerald-600' : 'bg-neutral-800'
                  }`}
                  role="switch"
                  aria-checked={editFertigation}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      editFertigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Submit Command Button */}
              <button
                onClick={handleApplyChanges}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>{isAr ? 'إرسال التعديل إلى المحور عبر LoRaWAN' : 'Transmit Remote Command to Pivot'}</span>
              </button>

              {appliedNotification && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
                  {appliedNotification}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
