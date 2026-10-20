import React, { useState } from 'react';
import { FarmKpis, Language, SystemAlert, PivotItem } from '../types/farm';
import { 
  Droplet, 
  Zap, 
  Wind, 
  Thermometer, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ArrowRight, 
  Satellite, 
  Activity, 
  RefreshCw,
  Compass,
  Cpu
} from 'lucide-react';

interface OverviewViewProps {
  kpis: FarmKpis;
  alerts: SystemAlert[];
  pivots: PivotItem[];
  lang: Language;
  onNavigateTab: (tab: string) => void;
  onResolveAlert: (id: string) => void;
  onSelectPivot: (pivotId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  kpis,
  alerts,
  pivots,
  lang,
  onNavigateTab,
  onResolveAlert,
  onSelectPivot,
}) => {
  const isAr = lang === 'ar';
  const [mapMode, setMapMode] = useState<'satellite' | 'ndvi'>('satellite');
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagMessage, setDiagMessage] = useState<string | null>(null);

  const triggerDiagnostics = () => {
    setDiagnosticsRunning(true);
    setDiagMessage(null);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      setDiagMessage(isAr ? 'تم فحص 32 بوابة LoRaWAN و 1,400 محور سقي: الشبكة تعمل بنسبة كفاءة 99.8%' : 'All 32 LoRaWAN gateways & 1,400 pivots verified: 99.8% network health.');
      setTimeout(() => setDiagMessage(null), 5000);
    }, 1200);
  };

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="space-y-6">
      {/* 4-Item Primary Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>{isAr ? 'إجمالي قطيع الأبقار' : 'Total Cattle Herd'}</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {kpis.totalHerd.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-neutral-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium font-mono tabular-nums">{kpis.milkingCows.toLocaleString()}</span>
            <span>{isAr ? 'بقرة حلب نشطة' : 'milking cows'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>{isAr ? 'محاور السقي الدائرية' : 'Center Pivots'}</span>
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            <span className="font-mono tabular-nums">{kpis.activePivots.toLocaleString()}</span>{' '}
            <span className="text-xs font-normal text-neutral-400 font-mono">/ {kpis.totalPivots}</span>
          </div>
          <div className="mt-1 text-xs text-neutral-400 flex items-center gap-1.5">
            <span className="text-cyan-400 font-medium font-mono tabular-nums">{kpis.totalAreaHa.toLocaleString()}</span>
            <span>{isAr ? 'هكتار مستصلحة' : 'hectares managed'}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>{isAr ? 'إنتاج مسحوق الحليب' : 'Milk Powder Output'}</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            <span className="font-mono tabular-nums">{kpis.annualPowderCapacityTons.toLocaleString()}</span>
            <span className="text-xs font-normal text-neutral-400 ms-1.5">{isAr ? 'طن/سنوياً' : 't/yr'}</span>
          </div>
          <div className="mt-1 text-xs text-neutral-400 flex items-center gap-1.5">
            <span className="text-amber-400 font-medium font-mono tabular-nums">{kpis.currentPowderDailyTons}</span>
            <span>{isAr ? 'طن/اليوم بالمجففات' : 't/day today'}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>{isAr ? 'معدل تدفق المياه والطاقة' : 'Water Flow & Energy'}</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            <span className="font-mono tabular-nums">{kpis.totalWaterPumpingM3H.toLocaleString()}</span>{' '}
            <span className="text-xs font-normal text-neutral-400 font-mono">m³/h</span>
          </div>
          <div className="mt-1 text-xs text-neutral-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-yellow-400 font-mono tabular-nums">{kpis.totalPowerMw} MW</span>
            <span>{isAr ? 'استهلاك المضخات' : 'pump power'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Satellite Map & Desert Weather + Redis Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Satellite Orbit Map of Adrar Pivots */}
        <div className="lg:col-span-2 rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Satellite className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {isAr ? 'المشهد الفضائي لـ 1,400 محور سقي بصحراء أدرار' : 'Satellite Orbit: 1,400 Pivots in Adrar Desert'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isAr ? 'Sentinel-2 & Landsat دقة 10م · إحداثيات: 27.87°N, 0.28°W' : 'Sentinel-2 Multispectral · 27.87°N, 0.28°W'}
                </p>
              </div>
            </div>

            {/* Map Mode Buttons */}
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800">
              <button
                onClick={() => setMapMode('satellite')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  mapMode === 'satellite' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'صورة الأقمار' : 'Satellite TrueColor'}
              </button>
              <button
                onClick={() => setMapMode('ndvi')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  mapMode === 'ndvi' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isAr ? 'مؤشر الإجهاد النباتي NDVI' : 'NDVI Vegetation Stress'}
              </button>
            </div>
          </div>

          {/* Satellite Image Container */}
          <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden group">
            <img
              src="/src/assets/images/adrar_pivots_satellite_1792517454538.jpg"
              alt="Adrar Center Pivots Satellite View"
              className={`w-full h-full object-cover transition-all duration-500 ${
                mapMode === 'ndvi' ? 'hue-rotate-60 contrast-125 saturate-150' : ''
              }`}
              referrerPolicy="no-referrer"
            />

            {/* Overlay Grid Markers */}
            <div className="absolute inset-0 bg-neutral-950/20 pointer-events-none" />

            {/* Simulated Live Pivots Overlay Badges */}
            <div className="absolute top-4 left-4 p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 text-xs backdrop-blur-md">
              <div className="text-neutral-300 font-medium mb-1">
                {isAr ? 'قطاعات الاستصلاح (219,000 هكتار)' : 'Land Reclamation Sectors'}
              </div>
              <div className="space-y-1 text-neutral-300 text-[11px]">
                <div className="flex items-center justify-between gap-4">
                  <span>Sector A (تيميمون):</span>
                  <span className="text-emerald-400 font-mono">280 Pivots · Barley</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Sector B (رقان):</span>
                  <span className="text-emerald-400 font-mono">320 Pivots · Wheat</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Sector C (أولف):</span>
                  <span className="text-emerald-400 font-mono">290 Pivots · Corn</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Sector D & E (السبع / تسابيت):</span>
                  <span className="text-cyan-400 font-mono">510 Pivots · Alfalfa Hub</span>
                </div>
              </div>
            </div>

            {/* Telemetry Stream Badge */}
            <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-neutral-950/90 border border-neutral-800 text-[11px] text-neutral-300 backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Kafka Ingestion: <span className="font-mono text-emerald-400">{kpis.telemetryEventsPerSec.toLocaleString()}</span> events/s</span>
            </div>

            <button
              onClick={() => onNavigateTab('pivots')}
              className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <span>{isAr ? 'فتح خريطة المحاور التفاعلية' : 'Open Interactive Pivot GIS'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Pivot Grid Preview */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/40">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-neutral-400">
                {isAr ? 'عينة حية من المحاور المتصلة عبر LoRaWAN' : 'Sample Active Pivots via LoRaWAN Telemetry'}
              </span>
              <button
                onClick={() => onNavigateTab('pivots')}
                className="text-xs text-emerald-400 hover:underline"
              >
                {isAr ? 'عرض الكل (1,400 محور) ←' : 'View all 1,400 pivots →'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {pivots.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPivot(p.id)}
                  className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 text-start transition-colors group"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-semibold text-white group-hover:text-emerald-400">{p.code}</span>
                    <span className={`text-[10px] px-1 rounded ${
                      p.status === 'running' ? 'text-emerald-400 bg-emerald-950/50' : 'text-amber-400 bg-amber-950/50'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">{isAr ? p.cropNameAr : p.cropNameEn}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>{p.currentAngle}°</span>
                    <span>{p.waterPressureBar} bar</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Desert Microclimate & Redis Alert Board */}
        <div className="space-y-6">
          {/* Desert Weather & Evapotranspiration Card */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-white">
                  {isAr ? 'محطة الطقس الصحراوي (أدرار)' : 'Adrar Desert Microclimate'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">ET0: 8.4 mm/day</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <div className="text-lg font-bold font-mono text-white tabular-nums">{kpis.ambientTempC}°C</div>
                <div className="text-[10px] text-neutral-400">{isAr ? 'حرارة الجو' : 'Ambient Temp'}</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                <Droplet className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold font-mono text-white tabular-nums">{kpis.humidityPct}%</div>
                <div className="text-[10px] text-neutral-400">{isAr ? 'رطوبة الهواء' : 'Air Humidity'}</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                <Wind className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-bold font-mono text-white tabular-nums">{kpis.windSpeedKmH}</div>
                <div className="text-[10px] text-neutral-400">{isAr ? 'كم/سا رياح' : 'Wind km/h'}</div>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300/90 leading-relaxed">
              {isAr
                ? 'خوارزمية الذكاء الاصطناعي ضبطت تلقائياً دورات الري لتتم خلال الليل (10:00 مساءً - 05:00 صباحاً) لتوفير 34% من الفاقد بالتبخر.'
                : 'AI water engine scheduled 78% of pivot pumping cycles to nighttime (22:00-05:00) to cut evaporation losses by 34%.'}
            </div>
          </div>

          {/* Redis Live Alert Queue */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-semibold text-white">
                  {isAr ? 'سجل الإنذارات الفورية (Redis Cache)' : 'Real-time Redis Alert Queue'}
                </h4>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
                <span className="font-mono font-bold">{unresolvedAlerts.length}</span> {isAr ? 'نشطة' : 'active'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-lg border text-xs transition-colors ${
                    alert.resolved
                      ? 'bg-neutral-950/50 border-neutral-800/60 opacity-60'
                      : alert.severity === 'critical'
                      ? 'bg-red-950/30 border-red-800/60'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/30 border-amber-800/60'
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-neutral-400">{alert.timestamp} · L{alert.layer}</span>
                    <span className="font-mono text-[10px] text-neutral-400">{alert.source}</span>
                  </div>
                  <div className="font-medium text-white mb-1">
                    {isAr ? alert.titleAr : alert.titleEn}
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-normal mb-2">
                    {isAr ? alert.descAr : alert.descEn}
                  </div>
                  {!alert.resolved ? (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium transition-colors"
                    >
                      {isAr ? 'تأكيد المعالجة (Resolve)' : 'Acknowledge & Resolve'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isAr ? 'تمت المعالجة' : 'Resolved'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick System Diagnostics */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">
                {isAr ? 'تشخيص شبكة IIoT والمضخات' : 'Run Network & Pump Diagnostics'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {isAr ? 'فحص بوابات LoRaWAN وحساسات الضغط' : 'Ping 32 LoRa gateways and flowmeters'}
              </div>
            </div>
            <button
              onClick={triggerDiagnostics}
              disabled={diagnosticsRunning}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
              <span>{diagnosticsRunning ? (isAr ? 'جارٍ الفحص...' : 'Testing...') : (isAr ? 'بدء الفحص' : 'Diagnose')}</span>
            </button>
          </div>

          {diagMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300">
              {diagMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
