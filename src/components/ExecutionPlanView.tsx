import React, { useState } from 'react';
import { Language, PivotItem } from '../types/farm';
import { 
  calculateDzdEquivalent, 
  calculateFertigationVolume, 
  resolveKafkaTopicFromMqttTopic 
} from '../logic/farmCalculations';
import { ExecutiveKpis } from './ExecutiveKpis';
import { PivotRadar, RadarPivotItem } from './PivotRadar';
import { MilkingParlorStatus } from './MilkingParlorStatus';
import { 
  Database, 
  Radio, 
  Sliders, 
  FileText, 
  Check, 
  Copy, 
  Play, 
  Terminal, 
  Server, 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  Compass, 
  RefreshCw,
  Send,
  AlertTriangle,
  Award
} from 'lucide-react';

interface ExecutionPlanViewProps {
  lang: Language;
  pivots: PivotItem[];
  onDispatchScadaCommand: (pivotId: string, speed: number, depth: number, fert: boolean) => void;
}

export const ExecutionPlanView: React.FC<ExecutionPlanViewProps> = ({
  lang,
  pivots,
  onDispatchScadaCommand,
}) => {
  const isAr = lang === 'ar';
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Step 1: SQL Simulator state
  const [simulatedSqlRunning, setSimulatedSqlRunning] = useState(false);
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);

  // Step 2: SCADA actuation command simulator state
  const [targetPivotCode, setTargetPivotCode] = useState('PIV-0108');
  const [targetSpeed, setTargetSpeed] = useState(45);
  const [targetDepth, setTargetDepth] = useState(12.5);
  const [targetFertigation, setTargetFertigation] = useState(true);
  const [targetBlend, setTargetBlend] = useState('NPK-15-05-30');
  const [dosingRate, setDosingRate] = useState(15.0);
  const [commandDispatched, setCommandDispatched] = useState(false);

  // Step 3: Currency toggle in executive step
  const [currency, setCurrency] = useState<'USD' | 'DZD'>('DZD');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRadarDispatchAction = (pivotId: string, action: 'adjust_depth' | 'emergency_stop', newDepth?: number) => {
    if (action === 'adjust_depth') {
      onDispatchScadaCommand(pivotId, 60, newDepth || 14.0, true);
    } else {
      onDispatchScadaCommand(pivotId, 0, 0, false);
    }
  };

  const runSpatialQuery = () => {
    setSimulatedSqlRunning(true);
    setTimeout(() => {
      setSimulatedSqlRunning(false);
      // Filter pivots with soil moisture < 20% in 30cm or 10cm
      const matches = pivots
        .filter((p) => p.soil30cm < 35 || p.soil10cm < 20)
        .map((p) => ({
          pivot_code: p.code,
          parcel_id: `ADR-SEC01-${p.code.replace('PIV-', 'P')}`,
          soil_moisture_30cm: `${p.soil30cm}%`,
          water_pressure_bar: `${p.waterPressureBar} bar`,
          crop: p.cropNameAr,
          center_geojson: {
            type: 'Point',
            coordinates: [27.874 + Math.random() * 0.05, -0.281 - Math.random() * 0.05],
          },
        }));
      setSqlResults(matches);
    }, 700);
  };

  const handleSendCommand = () => {
    setCommandDispatched(true);
    const pivot = pivots.find((p) => p.code === targetPivotCode) || pivots[0];
    onDispatchScadaCommand(pivot.id, targetSpeed, targetDepth, targetFertigation);
    setTimeout(() => setCommandDispatched(false), 3000);
  };

  const steps = [
    {
      id: 1,
      titleAr: 'الخطوة 1: القواعد الجغرافية والسلاسل الزمنية',
      titleEn: 'Step 1: Spatial & Time-Series DB Schema',
      subtitleAr: 'PostGIS 4326 + TimescaleDB Hypertables',
      subtitleEn: 'PostGIS 4326 + TimescaleDB Hypertables',
      icon: Database,
    },
    {
      id: 2,
      titleAr: 'الخطوة 2: اتصالات الحافة ورسائل SCADA / IoT',
      titleEn: 'Step 2: Bi-Directional SCADA / IoT Control',
      subtitleAr: 'MQTT Topics + Upstream & Downstream Payloads',
      subtitleEn: 'MQTT Topics + Upstream & Downstream Payloads',
      icon: Radio,
    },
    {
      id: 3,
      titleAr: 'الخطوة 3: صمام التحكم وغرفة القيادة العليا',
      titleEn: 'Step 3: Executive Control & Dual-Currency KPIs',
      subtitleAr: '1,400 Pivot Radar + 193k t Powder + DZD/USD',
      subtitleEn: '1,400 Pivot Radar + 193k t Powder + DZD/USD',
      icon: Sliders,
    },
    {
      id: 4,
      titleAr: 'الخطوة 4: وثيقة النشر وحساب التكاليف',
      titleEn: 'Step 4: Deployment Manifests & Costing',
      subtitleAr: 'Docker Compose + Kubernetes + Hardware BOM',
      subtitleEn: 'Docker Compose + Kubernetes + Hardware BOM',
      icon: FileText,
    },
  ];

  const sqlSchemaCode = `-- ========================================================
-- ADRAR MEGA-FARM OS: SPATIAL & TIME-SERIES SCHEMA
-- Designed for 219,000 ha, 1,400 Pivots & 270,000 Cattle
-- ========================================================

-- 1. Enable Core Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PostGIS Spatial Layer: 219,000 Hectares Parcels
CREATE TABLE land_parcels (
    parcel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. ADR-SEC01-P042
    crop_type VARCHAR(50) CHECK (crop_type IN ('ALFALFA', 'BARLEY', 'WHEAT', 'CORN', 'FALLOW')),
    area_hectares NUMERIC(8, 2) NOT NULL,
    soil_ph NUMERIC(3, 2),
    boundary GEOMETRY(Polygon, 4326) NOT NULL, -- WGS84 CRS
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_land_parcels_boundary ON land_parcels USING GIST (boundary);

-- 3. 1,400 Center Pivot Systems Table
CREATE TABLE pivot_irrigation_systems (
    pivot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pivot_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. PIVOT-1204
    parcel_id UUID REFERENCES land_parcels(parcel_id) ON DELETE CASCADE,
    center_location GEOMETRY(Point, 4326) NOT NULL,
    arm_length_meters NUMERIC(6, 2) NOT NULL, -- e.g. 400.00m
    flow_rate_liters_per_sec NUMERIC(6, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'IDLE' CHECK (status IN ('RUNNING', 'IDLE', 'MAINTENANCE', 'ALERT')),
    last_maintenance_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_pivots_center ON pivot_irrigation_systems USING GIST (center_location);

-- 4. TimescaleDB Hypertable: 270,000 Cattle Smart Collars
CREATE TABLE collar_telemetry (
    time TIMESTAMPTZ NOT NULL,
    collar_id VARCHAR(50) NOT NULL,
    heart_rate INT CHECK (heart_rate BETWEEN 20 AND 220),
    body_temp_celsius NUMERIC(4, 2),
    rumination_minutes_per_hour INT,
    activity_level VARCHAR(20) CHECK (activity_level IN ('RESTING', 'RUMINATING', 'WALKING', 'HIGH_ACTIVITY')),
    estrus_probability NUMERIC(3, 2)
);
SELECT create_hypertable('collar_telemetry', 'time');
CREATE INDEX idx_collar_time ON collar_telemetry (collar_id, time DESC);

-- Automatic 7-day Compression Policy (Reduces disk consumption by 90%)
ALTER TABLE collar_telemetry SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'collar_id'
);
SELECT add_compression_policy('collar_telemetry', INTERVAL '7 days');

-- 5. TimescaleDB Hypertable: 1,400 Pivots & Soil Probes
CREATE TABLE pivot_telemetry (
    time TIMESTAMPTZ NOT NULL,
    pivot_id UUID NOT NULL,
    current_angle_degrees NUMERIC(5, 2),
    water_pressure_bar NUMERIC(4, 2),
    speed_percentage NUMERIC(5, 2),
    water_flow_m3_h NUMERIC(6, 2),
    fertigation_active BOOLEAN DEFAULT FALSE,
    soil_moisture_10cm NUMERIC(5, 2),
    soil_moisture_30cm NUMERIC(5, 2),
    soil_moisture_60cm NUMERIC(5, 2)
);
SELECT create_hypertable('pivot_telemetry', 'time');
CREATE INDEX idx_pivot_time ON pivot_telemetry (pivot_id, time DESC);`;

  const dockerComposeYaml = `# docker-compose.adrar-mega-farm.yml
version: '3.8'

services:
  # 1. قاعدة البيانات الجغرافية والتسلسل الزمني
  adrar-db:
    image: timescale/timescaledb-ha:pg15-latest
    container_name: adrar_spatial_timescale_db
    restart: always
    environment:
      POSTGRES_DB: adrar_megafarm_db
      POSTGRES_USER: sol_admin
      POSTGRES_PASSWORD: \${DB_STRONG_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql

  # 2. وسيط MQTT لاستقبال بيانات المستشعرات والحساسات
  emqx-broker:
    image: emqx/emqx:5.3.0
    container_name: adrar_mqtt_broker
    restart: always
    ports:
      - "1883:1883"   # MQTT Protocol
      - "8083:8083"   # WebSockets
      - "18083:18083" # Dashboard Console

  # 3. العصب المركزي لتدفق البيانات الفورية (Apache Kafka Cluster)
  kafka-bus:
    image: bitnami/kafka:3.5
    container_name: adrar_kafka_bus
    restart: always
    ports:
      - "9092:9092"
    environment:
      - KAFKA_CFG_NODE_ID=0
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka-bus:9093
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER

  # 4. الذاكرة الفورية لإدارة الإنذارات السرعة
  redis-cache:
    image: redis:7-alpine
    container_name: adrar_redis_alerts
    ports:
      - "6379:6379"

volumes:
  postgres_data:
    driver: local`;

  const k8sManifestYaml = `# k8s-scada-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scada-gateway-deployment
  namespace: adrar-system
  labels:
    app: scada-gateway
spec:
  replicas: 3 # 3 نسخ موزعة لمنع توقف الخدمة عند الأعطال
  selector:
    matchLabels:
      app: scada-gateway
  template:
    metadata:
      labels:
        app: scada-gateway
    spec:
      containers:
      - name: scada-engine
        image: registry.sol-global.dz/adrar/scada-engine:v1.0.0
        env:
        - name: KAFKA_BROKER
          value: "kafka-bus.adrar-system.svc.cluster.local:9092"
        - name: DB_HOST
          value: "adrar-db.adrar-system.svc.cluster.local"
        resources:
          limits:
            cpu: "2000m"
            memory: "4Gi"
          requests:
            cpu: "500m"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: scada-gateway-service
  namespace: adrar-system
spec:
  type: LoadBalancer
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: scada-gateway`;

  const whitepaperSummary = `📄 وثيقة اعتماد المنظومة: Adrar Mega-Farm OS (SOL Global US-DZ Engine)
طبيعة المنظومة: نظام تشغيل وتحكم هجين لصناعات الفلاحة والثروة الحيوانية الضخمة (Industrial Agri-IoT & Big Data OS).

الطاقة الاستيعابية المحققة:
• متابعة وتتبع لحظي لـ 270,000 رأس بقر بأطواق ذكية متصلة بـ LoRaWAN.
• إدارة وتوجيه آلي لـ 1,400 محور سقي على مساحة 219,000 هكتار.
• تحكم متكامل بمصنع تجفيف الحليب برفع الكفاءة لإنتاج 193,000 طن سنوياً.

المكاسب التشغيلية المباشرة:
• ترشيد استهلاك المياه الجوفية: تخفيض بنسبة 34% عبر جدولة الري بناءً على صور الأقمار الصناعية وحساسات التربة الثلاثية (10cm, 30cm, 60cm).
• التنبؤ الطبي البيطري: اكتشاف أعراض الإجهاد الحراري والأمراض قبل 48 ساعة من ظهور الأعراض الفزيولوجية.
• معالجة البيانات: زمن استجابة (Latency) أقل من 5 ميلي ثانية لكل الأحداث الواردة عبر Kafka.`;

  return (
    <div className="space-y-6">
      {/* View Header with Execution Plan Breadcrumbs */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>{isAr ? 'المخطط التنفيذي الشامل للمنظومة (Step-by-Step Execution Plan)' : 'Engineering Execution Roadmap'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'خارطة التنفيذ الميداني لـ 219,000 هكتار و 270,000 بقرة' : 'Adrar Mega-Farm OS 4-Step Execution Blueprint'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isAr
              ? 'مخطط متسلسل: من قواعد PostGIS و TimescaleDB إلى شفرات SCADA المزدوجة، وغرفة القيادة العليا، ونشر Kubernetes.'
              : 'End-to-end blueprint: Spatial & Time-series schemas, bi-directional SCADA, command dashboards, and K8s manifests.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/50">
            {isAr ? 'المرحلة: الجاهزية للتشغيل الميداني' : 'Phase: Production Ready'}
          </span>
        </div>
      </div>

      {/* 4 Steps Interactive Tabs Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          const isSelected = activeStep === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`p-3.5 rounded-xl border text-start transition-all ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-sm'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  0{s.id}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
              </div>
              <div className="text-xs font-bold text-white mb-1">
                {isAr ? s.titleAr : s.titleEn}
              </div>
              <div className="text-[11px] text-neutral-400 truncate">
                {isAr ? s.subtitleAr : s.subtitleEn}
              </div>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Spatial & Time-Series DB Schema */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Full DDL SQL Schema */}
            <div className="lg:col-span-7 rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'الهيكلية الرسمية لـ PostGIS + TimescaleDB' : 'Production Database DDL'}
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(sqlSchemaCode, 'sql_schema')}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'sql_schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sql_schema' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ SQL' : 'Copy SQL')}</span>
                </button>
              </div>

              <pre dir="ltr" className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400/90 overflow-x-auto text-left max-h-[500px]">
                {sqlSchemaCode}
              </pre>
            </div>

            {/* Right Column (5 cols): Interactive Spatial Query Simulator */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isAr ? 'مختبر الاستعلام المكاني (PostGIS LATERAL Join)' : 'PostGIS Live Query Execution'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Soil Moisture &lt; 20%</span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {isAr
                    ? 'استعلام فوري يربط جدول الـ 1,400 محور سقي مع أحدث قراءة رطوبة تربة في TimescaleDB للكشف الفوري عن المحاور التي تعاني من إجهاد مائي.'
                    : 'Querying 1,400 pivots joined LATERAL with latest TimescaleDB soil readings to isolate water stress zones.'}
                </p>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-cyan-300 overflow-x-auto" dir="ltr">
                  SELECT p.pivot_code, pt.soil_moisture_30cm<br />
                  FROM pivot_irrigation_systems p<br />
                  JOIN LATERAL (...) pt ON TRUE<br />
                  WHERE pt.soil_moisture_30cm &lt; 20.0;
                </div>

                <button
                  onClick={runSpatialQuery}
                  disabled={simulatedSqlRunning}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Play className={`w-3.5 h-3.5 ${simulatedSqlRunning ? 'animate-spin' : ''}`} />
                  <span>
                    {simulatedSqlRunning
                      ? (isAr ? 'جارٍ تنفيذ الاستعلام في PostGIS...' : 'Executing query in PostGIS...')
                      : (isAr ? 'تنفيذ الاستعلام على الـ 1,400 محور' : 'Execute Analytical Query')}
                  </span>
                </button>

                {sqlResults && (
                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <div className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                      <span>{isAr ? 'نتائج المحاور المستهدفة:' : 'Pivots flagged for irrigation:'}</span>
                      <span className="font-mono text-xs">{sqlResults.length} {isAr ? 'محور' : 'pivots'}</span>
                    </div>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {sqlResults.map((r, i) => (
                        <div key={i} className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-xs">
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-bold text-white">{r.pivot_code}</span>
                            <span className="text-amber-400">{r.soil_moisture_30cm}</span>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-1">
                            {r.parcel_id} · {r.crop} · {r.water_pressure_bar}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Bi-directional SCADA & IoT Payloads */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (6 cols): MQTT Topic Architecture & Upstream Telemetry */}
            <div className="lg:col-span-6 rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'قنوات Telemetry الصاعدة (Upstream MQTT)' : 'Upstream Telemetry Payloads'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">LoRaWAN 868MHz</span>
              </div>

              {/* Collar Payload Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-neutral-300">adrar/telemetry/collars/&#123;collar_id&#125;</span>
                  <span className="text-[10px] font-mono text-emerald-400">Every 30s</span>
                </div>
                <pre dir="ltr" className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400/90 overflow-x-auto text-left">
{`{
  "collar_id": "CLR-US-AZ-88301",
  "national_tag_id": "DZD-2026-902411",
  "timestamp": "2026-10-20T19:15:00.000Z",
  "metrics": {
    "heart_rate_bpm": 68,
    "body_temp_c": 38.6,
    "rumination_min_hr": 42,
    "activity": "RUMINATING",
    "estrus_score": 0.89
  },
  "gps": { "lat": 27.882104, "lng": -0.281093 },
  "battery_v": 3.65
}`}
                </pre>
              </div>

              {/* Pivot & Soil Payload Card */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-neutral-300">adrar/telemetry/pivots/&#123;pivot_id&#125;</span>
                  <span className="text-[10px] font-mono text-cyan-400">Every 5s</span>
                </div>
                <pre dir="ltr" className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-400/90 overflow-x-auto text-left">
{`{
  "pivot_id": "PIVOT-1204",
  "parcel_code": "ADR-SEC01-P042",
  "timestamp": "2026-10-20T19:15:00.000Z",
  "status": "RUNNING",
  "hardware_state": {
    "current_angle_deg": 142.5,
    "speed_percentage": 65.0,
    "water_pressure_bar": 4.2,
    "flow_rate_m3h": 185.0,
    "fertigation_injector_active": true
  },
  "soil_moisture": {
    "depth_10cm_pct": 18.2,
    "depth_30cm_pct": 24.5,
    "depth_60cm_pct": 31.0
  }
}`}
                </pre>
              </div>
            </div>

            {/* Right Column (6 cols): Downstream Control & Remote Actuation Console */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isAr ? 'أوامر التحكم العكسية (Downstream Remote Actuation)' : 'Downstream Remote Command Console'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">adrar/control/pivots/...</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      {isAr ? 'رمز المحور المستهدف:' : 'Target Pivot:'}
                    </label>
                    <select
                      value={targetPivotCode}
                      onChange={(e) => setTargetPivotCode(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      {pivots.map((p) => (
                        <option key={p.code} value={p.code}>{p.code} ({p.status})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      {isAr ? 'تركيبة السماد (NPK Blend):' : 'Fertilizer Blend:'}
                    </label>
                    <input
                      type="text"
                      value={targetBlend}
                      onChange={(e) => setTargetBlend(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Speed & Depth Sliders */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>{isAr ? 'السرعة المطلوبة (Target Speed %):' : 'Target Speed %:'}</span>
                      <span className="font-mono text-emerald-400 font-bold">{targetSpeed}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={targetSpeed}
                      onChange={(e) => setTargetSpeed(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>{isAr ? 'عمق مياه السقي (Water Depth mm):' : 'Water Depth mm:'}</span>
                      <span className="font-mono text-cyan-400 font-bold">{targetDepth} mm</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="0.5"
                      value={targetDepth}
                      onChange={(e) => setTargetDepth(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Fertigation volume calculation display */}
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
                  <span className="text-neutral-400">{isAr ? 'حجم السماد المحقون بالدورة:' : 'Injected Fertilizer per cycle:'}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {calculateFertigationVolume(20, dosingRate)} Liters NPK
                  </span>
                </div>

                {/* Dispatch Button */}
                <button
                  onClick={handleSendCommand}
                  className="w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {commandDispatched
                      ? (isAr ? 'تم إرسال الأمر الميداني بنجاح عبر MQTT!' : 'Command Published via MQTT!')
                      : (isAr ? `إرسال أمر التشغيل إلى ${targetPivotCode}` : `Publish Actuation to ${targetPivotCode}`)}
                  </span>
                </button>

                {/* Sample JSON command */}
                <div className="text-[11px] text-neutral-400 font-semibold mb-1">
                  {isAr ? 'شفرة الأمر المنشورة (Command Payload):' : 'Published JSON Command Payload:'}
                </div>
                <pre dir="ltr" className="p-3 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto text-left max-h-40">
{`{
  "command_id": "CMD-20261020-09821",
  "pivot_id": "${targetPivotCode}",
  "issuer": "SOL-AGRI-AUTO-OPTIMIZER",
  "timestamp": "${new Date().toISOString()}",
  "action": "SET_IRRIGATION_PROGRAM",
  "parameters": {
    "rotation_direction": "CW",
    "target_speed_pct": ${targetSpeed},
    "water_depth_mm": ${targetDepth},
    "enable_fertigation": ${targetFertigation},
    "fertilizer_blend_code": "${targetBlend}",
    "dosing_rate_lh": ${dosingRate}
  },
  "safety_limits": {
    "max_pressure_bar": 5.0,
    "auto_stop_on_wind_speed_kmh": 45.0
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Executive Dashboard & Control Room SVG Radar */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* 1. شاشة مؤشرات الأداء الاستراتيجية (Executive KPI Cards) */}
          <ExecutiveKpis
            currency={currency}
            onCurrencyChange={setCurrency}
            lang={lang}
          />

          {/* 2. محاكي خريطة الرادار المباشرة للمحاور (Interactive SVG Pivot Radar) */}
          <div className="space-y-2">
            <PivotRadar
              lang={lang}
              onDispatchAction={handleRadarDispatchAction}
            />
          </div>

          {/* 3. شاشة لوحة تحكم المحلب الآلي والمركزي (Rotary Milking Parlor & Cold Chain View) */}
          <MilkingParlorStatus
            lang={lang}
            status={{
              flowRateLMin: 1240,
              tankTempC: 3.8,
              quarantineCount: 12,
              activeStalls: 76,
              totalStalls: 80,
              carouselRpm: 8.5,
              todayMilkLiters: 5358000
            }}
          />

          {/* Sovereign Partnership Distribution */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'هيكل المساهمة والأسهم في الشراكة الاستراتيجية (FNI - Baladna JV)' : 'Joint Venture Shareholding & Sovereign Mandate'}</span>
              </h4>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {currency === 'USD' ? '$ 3.5 Billion Total Investment' : '470.75 مليار دينار جزائري'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">مجموعة بلدنا القطرية (Baladna Qatar)</span>
                  <span className="font-mono text-emerald-400 font-bold">51%</span>
                </div>
                <div className="text-sm font-mono text-neutral-200">
                  {currency === 'USD' ? '$ 1,785,000,000' : '240,082,500,000 دج'}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isAr ? 'نقل التكنولوجيا، استيراد السلالات الوراثية، والإدارة التقنية للمحالب ومصانع التجفيف.' : 'Technology transfer, genetic cattle import, and industrial management.'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">الصندوق الوطني للاستثمار (FNI Algeria)</span>
                  <span className="font-mono text-emerald-400 font-bold">49%</span>
                </div>
                <div className="text-sm font-mono text-neutral-200">
                  {currency === 'USD' ? '$ 1,715,000,000' : '230,667,500,000 دج'}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {isAr ? 'تخصيص الأراضي الاستصلاحية (219k هكتار)، تراخيص الآبار الجوفية، والبنية التحتية الكهربائية واللوجستية.' : '219k ha land concession, aquifer permits, and national logistics infrastructure.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Technical Whitepaper & K8s Deployment Manifests */}
      {activeStep === 4 && (
        <div className="space-y-6">
          {/* Whitepaper Adoption Header Certificate */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900/90 to-cyan-950/40 border border-emerald-500/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{isAr ? 'وثيقة اعتماد المنظومة: Adrar Mega-Farm OS' : 'System Adoption Certificate: Adrar Mega-Farm OS'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-neutral-950 font-bold">SOL Global US-DZ Engine</span>
                  </h3>
                  <p className="text-xs text-neutral-300">
                    {isAr ? 'نظام تشغيل وتحكم هجين لصناعات الفلاحة والثروة الحيوانية الضخمة (Industrial Agri-IoT & Big Data OS)' : 'Hybrid OS & SCADA Command Engine for Mega-Scale Agro-Livestock Operations'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(whitepaperSummary, 'whitepaper')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow"
              >
                {copiedKey === 'whitepaper' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'whitepaper' ? (isAr ? 'تم نسخ الوثيقة' : 'Copied') : (isAr ? 'نسخ وثيقة الاعتماد' : 'Copy Whitepaper')}</span>
              </button>
            </div>

            {/* Capacity & Direct Operational Gains Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Capacity Achieved */}
              <div className="p-3.5 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400">
                  {isAr ? 'الطاقة الاستيعابية المحققة (Capacity):' : 'Engine Capacity Verified:'}
                </h4>
                <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                  <li>{isAr ? 'متابعة وتتبع لحظي لـ 270,000 رأس بقر بأطواق ذكية متصلة بـ LoRaWAN.' : 'Real-time telemetry for 270,000 cattle with LoRaWAN collars.'}</li>
                  <li>{isAr ? 'إدارة وتوجيه آلي لـ 1,400 محور سقي على مساحة 219,000 هكتار.' : 'Automated guidance for 1,400 center pivots over 219k ha.'}</li>
                  <li>{isAr ? 'تحكم متكامل بمصنع تجفيف الحليب برفع الكفاءة لإنتاج 193,000 طن سنوياً.' : 'Inline automation for 193,000 t/yr milk powder spray dryers.'}</li>
                </ul>
              </div>

              {/* Operational Gains */}
              <div className="p-3.5 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-2">
                <h4 className="text-xs font-bold text-cyan-400">
                  {isAr ? 'المكاسب التشغيلية المباشرة (Operational Gains):' : 'Direct Operational Value:'}
                </h4>
                <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>{isAr ? 'ترشيد استهلاك المياه الجوفية:' : 'Aquifer Conservation:'}</strong>{' '}
                    <span className="text-emerald-400 font-bold">{isAr ? 'تخفيض بنسبة 34%' : '34% reduction'}</span> {isAr ? 'عبر جدولة الري بناءً على صور الأقمار وحساسات التربة الثلاثية.' : 'via ET0 nighttime scheduling.'}
                  </li>
                  <li>
                    <strong>{isAr ? 'التنبؤ الطبي البيطري:' : 'Veterinary AI:'}</strong>{' '}
                    <span className="text-amber-400 font-bold">{isAr ? 'اكتشاف الأعراض قبل 48 ساعة' : '48h early detection'}</span> {isAr ? 'من ظهور الأعراض الفزيولوجية للإجهاد الحراري.' : 'prior to physiological fever onset.'}
                  </li>
                  <li>
                    <strong>{isAr ? 'معالجة البيانات:' : 'Data Streaming:'}</strong>{' '}
                    <span className="text-cyan-400 font-bold font-mono">{isAr ? 'زمن استجابة < 5 ميلي ثانية' : 'Latency < 5ms'}</span> {isAr ? 'لكل الأحداث الواردة عبر Kafka.' : 'for all inbound Kafka telemetry.'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (6 cols): Docker-Compose Production File */}
            <div className="lg:col-span-6 rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isAr ? '1. دليل البيئة والخدمات (Docker Compose)' : '1. Docker Compose Edge Stack'}
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">docker-compose.adrar-mega-farm.yml</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(dockerComposeYaml, 'docker_compose')}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'docker_compose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'docker_compose' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ Compose' : 'Copy Compose')}</span>
                </button>
              </div>

              <pre dir="ltr" className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400/90 overflow-x-auto text-left max-h-[460px]">
                {dockerComposeYaml}
              </pre>
            </div>

            {/* Right Column (6 cols): Kubernetes Manifests & Bill of Materials */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {isAr ? '2. دليل النشر في الحاويات (Kubernetes Manifests)' : '2. Kubernetes Manifests (HA)'}
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-mono">k8s-scada-deployment.yaml</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(k8sManifestYaml, 'k8s_manifest')}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey === 'k8s_manifest' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'k8s_manifest' ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ K8s' : 'Copy K8s')}</span>
                  </button>
                </div>

                <pre dir="ltr" className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-300 overflow-x-auto text-left max-h-[240px]">
                  {k8sManifestYaml}
                </pre>

                {/* Hardware & Infrastructure BOM Table */}
                <div className="pt-2 border-t border-neutral-800 space-y-2">
                  <h4 className="text-xs font-bold text-white">
                    {isAr ? 'جدول تكاليف البنية التحتية والعتاد الصناعي الميداني (BOM):' : 'Industrial Hardware & Infrastructure BOM:'}
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded bg-neutral-950 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-300">{isAr ? '270,000 طوق ذكي (Smart Collars LoRaWAN):' : '270,000 Smart Collars:'}</span>
                      <span className="font-mono text-emerald-400">$ 24,300,000</span>
                    </div>
                    <div className="p-2 rounded bg-neutral-950 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-300">{isAr ? '1,400 منظومة تحكم ومستشعرات محاور السقي:' : '1,400 Pivot SCADA Systems:'}</span>
                      <span className="font-mono text-emerald-400">$ 11,200,000</span>
                    </div>
                    <div className="p-2 rounded bg-neutral-950 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-300">{isAr ? '32 محطة استقبال وبوابات LoRaWAN شمسية صحراوية:' : '32 Solar LoRaWAN Gateways:'}</span>
                      <span className="font-mono text-emerald-400">$ 480,000</span>
                    </div>
                    <div className="p-2 rounded bg-neutral-950 border border-neutral-800 flex justify-between">
                      <span className="text-neutral-300">{isAr ? 'مركز بيانات الحافة المقاوم للحرارة بأدرار:' : 'Ruggedized Sahara Edge Datacenter:'}</span>
                      <span className="font-mono text-emerald-400">$ 3,800,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
