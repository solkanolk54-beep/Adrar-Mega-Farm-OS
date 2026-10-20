import React, { useState } from 'react';
import { Language, UserRole, FarmKpis, PivotItem, CattleCollarItem, SystemAlert } from './types/farm';
import { INITIAL_KPIS, INITIAL_PIVOTS, INITIAL_COLLARS, INITIAL_ALERTS } from './data/mockFarmData';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/OverviewView';
import { ArchitectureView } from './components/ArchitectureView';
import { PivotGisView } from './components/PivotGisView';
import { LivestockView } from './components/LivestockView';
import { SupplyChainErpView } from './components/SupplyChainErpView';
import { ExecutionPlanView } from './components/ExecutionPlanView';
import { AiSimulatorModal } from './components/AiSimulatorModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [lang, setLang] = useState<Language>('ar');
  const [role, setRole] = useState<UserRole>('adrar_field');

  const [kpis, setKpis] = useState<FarmKpis>(INITIAL_KPIS);
  const [pivots, setPivots] = useState<PivotItem[]>(INITIAL_PIVOTS);
  const [collars, setCollars] = useState<CattleCollarItem[]>(INITIAL_COLLARS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  const [selectedPivotId, setSelectedPivotId] = useState<string>('p-0412');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const isAr = lang === 'ar';

  // Synchronize document dir attribute when language changes
  React.useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
  }, [isAr]);

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  const handleUpdatePivot = (updated: PivotItem) => {
    setPivots((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDispatchScadaCommand = (pivotId: string, speed: number, depth: number, fert: boolean) => {
    const isRunning = speed > 0;
    setPivots((prev) =>
      prev.map((p) =>
        p.id === pivotId
          ? {
              ...p,
              rotationSpeedPct: speed,
              waterDepthMm: depth,
              fertigationActive: fert,
              status: isRunning ? 'running' : 'idle',
              flowRateM3H: isRunning ? Math.round(150 + depth * 10) : 0,
            }
          : p
      )
    );
    // Add SCADA execution alert
    const target = pivots.find((p) => p.id === pivotId);
    const newAlert: SystemAlert = {
      id: `scada-cmd-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'info',
      layer: 2,
      source: `SCADA / ${target?.code || 'PIVOT'}`,
      titleAr: `تم تنفيذ أمر التشغيل العكسي عبر MQTT للمحور ${target?.code}`,
      titleEn: `Downstream SCADA actuation published for ${target?.code}`,
      descAr: `سرعة الدوران: ${speed}%، عمق المياه: ${depth} ملم، التسميد: ${fert ? 'مفعل' : 'معطل'}.`,
      descEn: `Target speed: ${speed}%, depth: ${depth}mm, fertigation: ${fert ? 'Active' : 'Disabled'}.`,
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleUpdateCollar = (updated: CattleCollarItem) => {
    setCollars((prev) =>
      prev.map((c) => (c.collarId === updated.collarId ? updated : c))
    );
  };

  const handleSelectPivotFromOverview = (pivotId: string) => {
    setSelectedPivotId(pivotId);
    setCurrentTab('pivots');
  };

  const handleApplyScenario = (newKpis: Partial<FarmKpis>, newAlert: SystemAlert) => {
    setKpis((prev) => ({ ...prev, ...newKpis }));
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Contract (Brand, Nav Links, 1 Primary Action) */}
      <TopBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        lang={lang}
        onLangChange={setLang}
        role={role}
        onRoleChange={setRole}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'overview' && (
          <OverviewView
            kpis={kpis}
            alerts={alerts}
            pivots={pivots}
            lang={lang}
            onNavigateTab={setCurrentTab}
            onResolveAlert={handleResolveAlert}
            onSelectPivot={handleSelectPivotFromOverview}
          />
        )}

        {currentTab === 'execution_plan' && (
          <ExecutionPlanView
            lang={lang}
            pivots={pivots}
            onDispatchScadaCommand={handleDispatchScadaCommand}
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureView lang={lang} />
        )}

        {currentTab === 'pivots' && (
          <PivotGisView
            pivots={pivots}
            lang={lang}
            selectedPivotId={selectedPivotId}
            onUpdatePivot={handleUpdatePivot}
          />
        )}

        {currentTab === 'livestock' && (
          <LivestockView
            collars={collars}
            lang={lang}
            onUpdateCollar={handleUpdateCollar}
          />
        )}

        {currentTab === 'supply_chain' && (
          <SupplyChainErpView lang={lang} />
        )}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>{isAr ? 'مشروع مزرعة أدرار الكبرى' : 'Adrar Mega-Farm Industrial OS'}</span>
            <span aria-hidden="true">·</span>
            <span>{isAr ? 'الشراكة الجزائرية القطرية (FNI & Baladna)' : 'Algeria-Qatar Joint Venture (FNI & Baladna)'}</span>
            <span aria-hidden="true">·</span>
            <span>219,000 ha</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>{isAr ? 'ولاية أدرار، الجمهورية الجزائرية' : 'Wilaya of Adrar, Algeria'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-400">Telemetry: Nominal</span>
          </div>
        </div>
      </footer>

      {/* AI Climate & Operations Scenario Simulator Modal */}
      <AiSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        lang={lang}
        currentKpis={kpis}
        onApplyScenario={handleApplyScenario}
      />
    </div>
  );
}
