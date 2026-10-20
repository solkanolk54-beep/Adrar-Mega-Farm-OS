import React, { useState } from 'react';
import { Language } from '../types/farm';
import { Sliders, AlertOctagon, RefreshCw, CheckCircle2, Droplet } from 'lucide-react';

export interface RadarPivotItem {
  id: string;
  code: string;
  x: number;
  y: number;
  radius: number;
  angle: number;
  status: 'RUNNING' | 'ALERT' | 'IDLE';
  pressure: number;
  depthMm?: number;
  cropNameAr?: string;
  cropNameEn?: string;
}

interface PivotRadarProps {
  pivots?: RadarPivotItem[];
  onPivotSelect?: (pivot: RadarPivotItem) => void;
  onDispatchAction?: (pivotId: string, action: 'adjust_depth' | 'emergency_stop', newDepth?: number) => void;
  lang?: Language;
}

const DEFAULT_RADAR_PIVOTS: RadarPivotItem[] = [
  // Sector 01 - Timimoun Cluster
  { id: 'p-1', code: 'PIV-0101', x: -60, y: -40, radius: 18, angle: 142, status: 'RUNNING', pressure: 3.4, depthMm: 12.0, cropNameAr: 'شعير علفي', cropNameEn: 'Barley' },
  { id: 'p-2', code: 'PIV-0102', x: -15, y: -55, radius: 19, angle: 210, status: 'RUNNING', pressure: 3.6, depthMm: 14.5, cropNameAr: 'قمح صلب صحراوي', cropNameEn: 'Durum Wheat' },
  { id: 'p-3', code: 'PIV-0108', x: 35, y: -35, radius: 18, angle: 310, status: 'ALERT', pressure: 2.1, depthMm: 8.0, cropNameAr: 'قمح صلب صحراوي', cropNameEn: 'Durum Wheat' },
  { id: 'p-4', code: 'PIV-0104', x: 80, y: -60, radius: 19, angle: 88, status: 'RUNNING', pressure: 3.8, depthMm: 15.0, cropNameAr: 'برسيم حجازي (Alfalfa)', cropNameEn: 'Alfalfa' },
  { id: 'p-5', code: 'PIV-0105', x: -110, y: -20, radius: 18, angle: 45, status: 'IDLE', pressure: 0.0, depthMm: 0.0, cropNameAr: 'راحة بيولوجية', cropNameEn: 'Fallow' },

  // Mid Ring
  { id: 'p-6', code: 'PIV-0201', x: -75, y: 30, radius: 20, angle: 260, status: 'RUNNING', pressure: 3.5, depthMm: 13.0, cropNameAr: 'ذرة سيلاج علفية', cropNameEn: 'Silage Corn' },
  { id: 'p-7', code: 'PIV-0205', x: -20, y: 25, radius: 21, angle: 180, status: 'RUNNING', pressure: 3.8, depthMm: 16.0, cropNameAr: 'ذرة سيلاج علفية', cropNameEn: 'Silage Corn' },
  { id: 'p-8', code: 'PIV-0208', x: 40, y: 40, radius: 18, angle: 15, status: 'RUNNING', pressure: 3.3, depthMm: 11.5, cropNameAr: 'برسيم حجازي', cropNameEn: 'Alfalfa' },
  { id: 'p-9', code: 'PIV-0212', x: 95, y: 25, radius: 19, angle: 110, status: 'RUNNING', pressure: 3.4, depthMm: 12.0, cropNameAr: 'شعير علفي', cropNameEn: 'Barley' },

  // Outer Perimeter
  { id: 'p-10', code: 'PIV-0301', x: -130, y: 70, radius: 19, angle: 330, status: 'RUNNING', pressure: 3.7, depthMm: 14.0, cropNameAr: 'برسيم حجازي', cropNameEn: 'Alfalfa' },
  { id: 'p-11', code: 'PIV-0305', x: -45, y: 100, radius: 20, angle: 75, status: 'RUNNING', pressure: 3.5, depthMm: 13.5, cropNameAr: 'قمح صلب', cropNameEn: 'Wheat' },
  { id: 'p-12', code: 'PIV-0310', x: 25, y: 110, radius: 19, angle: 195, status: 'IDLE', pressure: 0.0, depthMm: 0.0, cropNameAr: 'صيانة وقائية', cropNameEn: 'Maintenance' },
  { id: 'p-13', code: 'PIV-0314', x: 90, y: 90, radius: 20, angle: 155, status: 'RUNNING', pressure: 3.6, depthMm: 12.0, cropNameAr: 'ذرة سيلاج', cropNameEn: 'Corn' },
  { id: 'p-14', code: 'PIV-0320', x: 140, y: -15, radius: 18, angle: 280, status: 'ALERT', pressure: 1.8, depthMm: 6.0, cropNameAr: 'شعير علفي', cropNameEn: 'Barley' },
  { id: 'p-15', code: 'PIV-0325', x: -135, y: -80, radius: 19, angle: 95, status: 'RUNNING', pressure: 3.4, depthMm: 12.5, cropNameAr: 'قمح صلب', cropNameEn: 'Wheat' },
];

export const PivotRadar: React.FC<PivotRadarProps> = ({
  pivots = DEFAULT_RADAR_PIVOTS,
  onPivotSelect,
  onDispatchAction,
  lang = 'ar',
}) => {
  const [selectedPivot, setSelectedPivot] = useState<RadarPivotItem | null>(pivots[2] || pivots[0]);
  const [customDepth, setCustomDepth] = useState<number>(14.0);
  const [isEditingDepth, setIsEditingDepth] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isAr = lang === 'ar';

  const handleSelect = (p: RadarPivotItem) => {
    setSelectedPivot(p);
    setCustomDepth(p.depthMm || 12.0);
    setIsEditingDepth(false);
    setActionFeedback(null);
    onPivotSelect?.(p);
  };

  const handleAdjustDepth = () => {
    if (!selectedPivot) return;
    onDispatchAction?.(selectedPivot.id, 'adjust_depth', customDepth);
    setActionFeedback(isAr ? `تم تعديل عمق السقي إلى ${customDepth} ملم عبر MQTT` : `Water depth updated to ${customDepth}mm via MQTT`);
    setIsEditingDepth(false);
  };

  const handleEmergencyStop = () => {
    if (!selectedPivot) return;
    onDispatchAction?.(selectedPivot.id, 'emergency_stop');
    setActionFeedback(isAr ? `تم إرسال أمر الإيقاف الطارئ الفوري للمحور ${selectedPivot.code}` : `Emergency STOP executed for ${selectedPivot.code}`);
  };

  return (
    <div className="relative w-full h-[540px] bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden flex flex-col justify-between shadow-2xl">
      {/* Top Header */}
      <div className="flex justify-between items-center z-10">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{isAr ? 'رادار المحاور 1,400 (أدرار - قطاع 01)' : 'Pivots 1,400 Radar (Adrar - Sector 01)'}</span>
            <span className="text-xs font-mono text-slate-400 font-normal">219,000 Ha</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isAr ? 'عرض إحداثيات المحاور اللحظية بدقة سنتيمترية وتوجيه الأذرع بالدرجات' : 'Centimetric spatial radar array with real-time arm rotation angles'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>● SCADA Live Feedback</span>
          </span>
        </div>
      </div>

      {/* SVG Container لرسم المحاور */}
      <svg className="absolute inset-0 w-full h-full select-none" viewBox="-200 -200 400 400">
        <defs>
          {/* Subtle Radar Glow */}
          <radialGradient id="radarSweepGlow" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* دوائر الرادار الخلفية */}
        <circle cx="0" cy="0" r="180" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="0" cy="0" r="120" fill="none" stroke="#1e293b" strokeWidth="1" />
        <circle cx="0" cy="0" r="60" fill="none" stroke="#1e293b" strokeWidth="1" />
        <line x1="-200" y1="0" x2="200" y2="0" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="0" y1="-200" x2="0" y2="200" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

        {/* Distance Range Labels */}
        <text x="5" y="-182" fill="#475569" fontSize="8" fontFamily="monospace">1800m</text>
        <text x="5" y="-122" fill="#475569" fontSize="8" fontFamily="monospace">1200m</text>
        <text x="5" y="-62" fill="#475569" fontSize="8" fontFamily="monospace">600m</text>

        {/* رسم المحاور كعناصر تفاعلية */}
        {pivots.map((p) => {
          const isSelected = selectedPivot?.id === p.id;
          const color = p.status === 'RUNNING' ? '#10b981' : p.status === 'ALERT' ? '#ef4444' : '#64748b';
          const armRad = (p.angle * Math.PI) / 180;
          const armX = p.x + p.radius * Math.cos(armRad);
          const armY = p.y + p.radius * Math.sin(armRad);

          return (
            <g 
              key={p.id} 
              onClick={() => handleSelect(p)} 
              className="cursor-pointer transition-transform hover:scale-105"
            >
              {/* نطاق المحور الدائري */}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.radius}
                fill={color}
                fillOpacity={isSelected ? '0.35' : '0.15'}
                stroke={isSelected ? '#ffffff' : color}
                strokeWidth={isSelected ? '2.5' : '1.5'}
              />
              {/* خط الذراع الحقيقي */}
              <line 
                x1={p.x} 
                y1={p.y} 
                x2={armX} 
                y2={armY} 
                stroke={isSelected ? '#ffffff' : color} 
                strokeWidth={isSelected ? '2.5' : '2'} 
              />
              {/* فوهة نهاية الذراع */}
              <circle cx={armX} cy={armY} r="1.5" fill={color} />
              {/* مركز المحور */}
              <circle cx={p.x} cy={p.y} r="2.5" fill="#ffffff" />

              {/* Code Label */}
              <text 
                x={p.x} 
                y={p.y - p.radius - 3} 
                fill={isSelected ? '#ffffff' : '#94a3b8'} 
                fontSize="6.5" 
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle" 
                fontFamily="monospace"
              >
                {p.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* النافذة المنبثقة للتفاصيل والتحكم المباشر */}
      {selectedPivot && (
        <div 
          className={`absolute bottom-4 ${isAr ? 'left-4 text-right' : 'right-4 text-left'} z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 p-4 rounded-xl w-80 shadow-2xl space-y-3`}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  selectedPivot.status === 'RUNNING' ? 'bg-emerald-400' : selectedPivot.status === 'ALERT' ? 'bg-red-400 animate-ping' : 'bg-slate-400'
                }`} />
                <h4 className="font-bold text-emerald-400 font-mono text-sm">{selectedPivot.code}</h4>
              </div>
              <span className="text-[11px] text-slate-400">
                {isAr ? selectedPivot.cropNameAr || 'محصول علفي' : selectedPivot.cropNameEn || 'Fodder crop'}
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              selectedPivot.status === 'RUNNING'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                : selectedPivot.status === 'ALERT'
                ? 'bg-red-950/80 text-red-400 border border-red-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {selectedPivot.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
            <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'الزاوية الحالية:' : 'Angle:'}</span>
              <span className="font-bold text-white">{selectedPivot.angle}°</span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'ضغط المياه:' : 'Pressure:'}</span>
              <span className={`font-bold ${selectedPivot.pressure < 2.5 && selectedPivot.status === 'RUNNING' ? 'text-red-400' : 'text-cyan-400'}`}>
                {selectedPivot.pressure} Bar
              </span>
            </div>
          </div>

          {/* Depth Adjustment Panel */}
          {isEditingDepth ? (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{isAr ? 'عمق السقي المستهدف:' : 'Target Depth:'}</span>
                <span className="font-mono text-emerald-400 font-bold">{customDepth} mm</span>
              </div>
              <input
                type="range"
                min="4"
                max="25"
                step="0.5"
                value={customDepth}
                onChange={(e) => setCustomDepth(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdjustDepth}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 rounded font-bold w-full transition"
                >
                  {isAr ? 'تأكيد وحفظ' : 'Confirm & Send'}
                </button>
                <button
                  onClick={() => setIsEditingDepth(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded w-full transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditingDepth(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded font-bold w-full transition flex items-center justify-center gap-1 shadow"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isAr ? 'تعديل عمق السقي' : 'Adjust Depth'}</span>
              </button>
              <button 
                onClick={handleEmergencyStop}
                className="bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white text-xs px-3 py-1.5 rounded font-bold w-full transition flex items-center justify-center gap-1"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>{isAr ? 'إيقاف طارئ' : 'Emergency Stop'}</span>
              </button>
            </div>
          )}

          {actionFeedback && (
            <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-300 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}
        </div>
      )}

      {/* Legend at bottom right */}
      <div className={`flex items-center gap-4 text-xs font-mono text-slate-400 z-10 ${isAr ? 'justify-start' : 'justify-end'}`}>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>RUNNING ({pivots.filter((p) => p.status === 'RUNNING').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span>ALERT ({pivots.filter((p) => p.status === 'ALERT').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
          <span>IDLE ({pivots.filter((p) => p.status === 'IDLE').length})</span>
        </div>
      </div>
    </div>
  );
};
