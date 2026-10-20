import React, { useState } from 'react';
import { Language, KafkaTopicMetric } from '../types/farm';
import { KAFKA_TOPICS } from '../data/mockFarmData';
import { 
  Cpu, 
  Radio, 
  Database, 
  BrainCircuit, 
  Server, 
  Monitor, 
  Send, 
  Check, 
  Code, 
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowDown
} from 'lucide-react';

interface ArchitectureViewProps {
  lang: Language;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [selectedLayer, setSelectedLayer] = useState<number>(1);
  const [topics, setTopics] = useState<KafkaTopicMetric[]>(KAFKA_TOPICS);
  const [simulationSent, setSimulationSent] = useState(false);
  const [testPayloadType, setTestPayloadType] = useState<'collar' | 'pivot' | 'soil'>('collar');

  const layers = [
    {
      id: 1,
      titleAr: '1. طبقة جمع البيانات والإنترنت الصناعي للأشياء (IIoT & Edge Layer)',
      titleEn: '1. IIoT & Edge Telemetry Layer',
      icon: Radio,
      badgeAr: '270k طوق ذكي + 1,400 محور سقي',
      badgeEn: '270k Collars + 1,400 Pivots',
      descAr: 'بوابات LoRaWAN موزعة في صحراء أدرار تغطي 219 ألف هكتار. أطواق ذكية للأبقار تقيس الحرارة والاجترار والحركة. حساسات رطوبة تربة لـ 3 أعماق (10، 30، 60 سم) ومقاييس ضغط وتدفق ماء بمضخات الأعماق عبر بروتوكول MQTT.',
      descEn: 'Solar-powered LoRaWAN gateways across Adrar Sahara covering 219,000 ha. Smart livestock collars measuring heart rate, core temp, rumination, estrus. Soil probes (10/30/60cm), water pressure transducers, deep well meters over lightweight MQTT.',
      tech: ['LoRaWAN 868MHz', 'Smart Collars (IMU + NTC)', 'MQTT Protocol', 'Edge Gateways (ARM64)', 'Soil TDR Probes'],
      samplePayload: {
        device_id: 'CLR-90214',
        cow_tag: 'DZ-ADR-88412',
        gateway_lora: 'GW-ADRAR-TIMIMOUN-04',
        timestamp: new Date().toISOString(),
        telemetry: {
          temp_celsius: 38.6,
          rumination_minutes_24h: 495,
          activity_index: 110,
          heart_rate_bpm: 68,
          battery_pct: 94,
          gps: { lat: 27.8741, lon: -0.2812 },
        },
      },
    },
    {
      id: 2,
      titleAr: '2. طبقة النقل وتدفق البيانات الفورية (Ingestion & Streaming Layer)',
      titleEn: '2. Ingestion & Real-Time Streaming Layer',
      icon: Cpu,
      badgeAr: 'Kafka Cluster + EMQX MQTT Broker',
      badgeEn: 'Kafka Cluster + EMQX Broker',
      descAr: 'العصب المركزي لاستقبال ملايين الأحداث في الثانية بدون أي اختناق. وسيط EMQX لتجميع حزم الحساسات الحية، ثم ضخها فورياً في عناقيد Apache Kafka Cluster المقسمة إلى 32 Partition مع زمن وصول يقل عن 5 ميلي ثانية.',
      descEn: 'Distributed Apache Kafka cluster ingesting hundreds of thousands of events/sec without bottlenecks. EMQX MQTT broker acts as edge multiplexer before streaming events into Kafka partitions with <5ms p99 latency.',
      tech: ['Apache Kafka (32 Partitions)', 'EMQX Enterprise Broker', 'Schema Registry (Avro)', 'Zero Data-loss Queue'],
      samplePayload: {
        topic: 'adrar.telemetry.collars',
        partition: 12,
        offset: 8941203,
        key: 'DZ-ADR-88412',
        headers: { 'compression': 'zstd', 'producer': 'emqx-bridge-02' },
        rate_events_per_sec: 9280,
      },
    },
    {
      id: 3,
      titleAr: '3. طبقة التخزين والمعالجة الذكية (Storage & Processing - Big Data & GIS)',
      titleEn: '3. Big Data, GIS & Time-Series Storage Layer',
      icon: Database,
      badgeAr: 'PostGIS + TimescaleDB + Spark + Redis',
      badgeEn: 'PostGIS + TimescaleDB + Spark + Redis',
      descAr: 'PostgreSQL + PostGIS لإدارة البيانات الجغرافية ورسم حدود 219,000 هكتار ومواقع 1,400 محور سقي بدقة سنتيمترية. TimescaleDB للسلاسل الزمنية لصحة الأبقار والطقس. معالجة سريالية بـ Apache Spark / Flink، وتخزين إنذارات فوري في Redis Cache.',
      descEn: 'PostgreSQL + PostGIS geospatial engine managing 219,000 ha cadastral boundaries and 1,400 pivot coordinates. TimescaleDB for continuous animal health & climate time-series. Apache Spark/Flink for streaming analytics and Redis for sub-millisecond alert caching.',
      tech: ['PostgreSQL 16 + PostGIS', 'TimescaleDB Hypertables', 'Apache Spark / Flink', 'Redis Cluster (In-Memory)'],
      samplePayload: {
        spatial_query: 'ST_Contains(sector_boundary, pivot_geom)',
        hectares_managed: 219000,
        timescale_hypertable: 'cow_biometrics_hourly',
        redis_cached_alerts_count: 4,
        spark_job_status: 'RUNNING_STREAMING_WATER_ET0',
      },
    },
    {
      id: 4,
      titleAr: '4. طبقة الذكاء الاصطناعي والتنبؤ (AI & Predictive Analytics Layer)',
      titleEn: '4. AI & Predictive Analytics Layer',
      icon: BrainCircuit,
      badgeAr: 'Smart Breeding AI + Satellite NDVI Optimization',
      badgeEn: 'Breeding AI + Satellite NDVI',
      descAr: 'خوارزميات تعلم آلي (TensorFlow / PyTorch) للتنبؤ بالأمراض قبل ظهورها وتحديد ذروة التلقيح (Estrus). نماذج تحليل صور الأقمار الصناعية (Sentinel & Landsat) لحساب الإجهاد المائي وضبط دوران المحاور لتوفير ملايين الأمتار المكعبة من مياه الصحراء.',
      descEn: 'Machine learning algorithms predicting subclinical bovine illnesses 48h before symptoms, calculating optimal 12h insemination windows. Satellite NDVI/infrared models compute desert crop evapotranspiration (ET0) and schedule autonomous pivot rotation.',
      tech: ['PyTorch / TensorFlow', 'Sentinel-2 Multispectral AI', 'Desert ET0 Evapotranspiration Engine', 'Genetic Merit Predictor'],
      samplePayload: {
        model_name: 'AdrarDesertWaterOptimizer_v3.2',
        target_pivot: 'PIV-0412',
        crop_current_ndvi: 0.78,
        recommended_action: {
          water_depth_mm: 6.8,
          rotation_speed_pct: 75,
          schedule: 'NIGHT_IRRIGATION_ONLY_2200_TO_0500',
          estimated_water_saved_pct: 34.2,
        },
      },
    },
    {
      id: 5,
      titleAr: '5. طبقة الخدمات المصغرة ومنطق الأعمال (Microservices Backend Layer)',
      titleEn: '5. Microservices Backend Layer',
      icon: Server,
      badgeAr: 'Livestock-Core + Agri-Engine + JV ERP',
      badgeEn: 'Livestock-Core + Agri-Engine + ERP',
      descAr: 'معمارية Microservices تعمل على Kubernetes (K8s) بـ Node.js / Go. وحدات مستقلة: Livestock-Core (الأنساب والصحة والمحالب)، Agri-Irrigation-Engine (تحكم المحاور)، Supply-Chain-Traceability (التتبع من المزرعة للمصنع فالتوزيع)، و ERP الشراكة بين FNI وبلدنا.',
      descEn: 'Containerized microservices orchestrated on Kubernetes (K8s) with Go & Node.js REST/gRPC/WebSocket endpoints. Modular services: Livestock-Core (herd genealogy & parlors), Agri-Irrigation-Engine (pivot control), Supply-Chain-Traceability, and FNI-Baladna JV ERP.',
      tech: ['Kubernetes (K8s)', 'Go / Node.js (NestJS)', 'gRPC & WebSocket', 'Docker Containers', 'ERP Integration API'],
      samplePayload: {
        service: 'agri-irrigation-engine',
        pod_count: 6,
        active_grpc_channels: 1400,
        cluster_health: 'HEALTHY',
        last_failover_recovery_s: 0,
      },
    },
    {
      id: 6,
      titleAr: '6. طبقة الواجهات والتحكم (Presentation & Dashboard Layer)',
      titleEn: '6. Presentation & Command Center Layer',
      icon: Monitor,
      badgeAr: 'React Control Room + Flutter Mobile',
      badgeEn: 'React Control Room + Flutter Apps',
      descAr: 'شاشات غرفة التحكم العملاقة في أدرار والجزائر والدوحة، مع تطبيقات Flutter الميدانية للمهندسين البيطريين والزراعيين لتلقي الإنذارات وتوجيه المحاور والأبقار فورياً.',
      descEn: 'Ultra-dense Command Room consoles for Algiers HQ, Doha Board, and Adrar desert engineers. Flutter cross-platform mobile apps for field agronomists and veterinarians receiving push alerts directly under extreme desert conditions.',
      tech: ['React 19 + Tailwind CSS', 'Flutter (Android/iOS Mobile)', 'Interactive SVG Radar / GIS', 'Real-time WebSocket Push'],
      samplePayload: {
        active_sessions: {
          adrar_field_engineers: 42,
          algiers_operations_room: 18,
          doha_board_members: 6,
        },
        ui_refresh_rate: 'REALTIME_PUSH_100MS',
      },
    },
  ];

  const handleSimulatePacket = () => {
    setSimulationSent(true);
    // increment topic message rate
    setTopics((prev) =>
      prev.map((t) =>
        t.name.includes(testPayloadType) ? { ...t, messagesPerSec: t.messagesPerSec + 150 } : t
      )
    );
    setTimeout(() => setSimulationSent(false), 2500);
  };

  const current = layers.find((l) => l.id === selectedLayer) || layers[0];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'المعمارية الهندسية الشاملة للمنظومة' : 'Adrar Mega-Farm OS Complete 6-Layer Architecture'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'الهندسة التقنية لمشروع الـ 270 ألف بقرة و 1,400 محور سقي' : 'Enterprise Engineering Architecture (Baladna & FNI)'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isAr
              ? 'معمارية متكاملة مقسمة طبقة بـ طبقة (Layer by Layer) من أطواق LoRaWAN إلى شاشات التحكم المركزية'
              : 'Full-stack industrial architecture: from desert LoRaWAN IoT collars up to multi-HQ command centers.'}
          </p>
        </div>

        {/* Live Packet Ingestion Metric */}
        <div className="px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-end">
          <div className="text-[11px] text-neutral-400">{isAr ? 'معدل تدفق الحزم الحي' : 'Live Ingestion Throughput'}</div>
          <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            9,280 <span className="text-xs text-neutral-400">events/sec</span>
          </div>
        </div>
      </div>

      {/* Layer Navigation Tabs (1 to 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {layers.map((l) => {
          const Icon = l.icon;
          const isSelected = selectedLayer === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setSelectedLayer(l.id)}
              className={`p-3 rounded-lg border text-start transition-all ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  L{l.id}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
              </div>
              <div className="text-xs font-semibold truncate">
                {isAr ? l.titleAr.split('(')[0].replace(/^\d+\.\s*/, '') : l.titleEn.replace(/^\d+\.\s*/, '')}
              </div>
              <div className="text-[10px] text-neutral-500 truncate mt-1">
                {isAr ? l.badgeAr : l.badgeEn}
              </div>
            </button>
          );
        })}
      </div>

      {/* Layer Deep Dive Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Selected Layer Specifications & Interactive Details */}
        <div className="lg:col-span-2 rounded-xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  Layer 0{current.id}
                </span>
                <span className="text-xs text-neutral-300">
                  {isAr ? current.badgeAr : current.badgeEn}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {isAr ? current.titleAr : current.titleEn}
              </h3>
            </div>
          </div>

          <div className="text-sm text-neutral-300 leading-relaxed bg-neutral-950/50 p-4 rounded-lg border border-neutral-800/60">
            {isAr ? current.descAr : current.descEn}
          </div>

          {/* Technology Stack Tags */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 mb-2.5">
              {isAr ? 'التقنيات والمكتبات المستخدمة في هذه الطبقة:' : 'Technologies & Protocols Applied in this Layer:'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {current.tech.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* JSON Payload Inspector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  {isAr ? 'نموذج حزمة البيانات المتبادلة (Live Schema Payload)' : 'Sample Active Data Payload'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">JSON / Avro binary encoded</span>
            </div>
            <pre dir="ltr" className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400/90 overflow-x-auto text-left">
              {JSON.stringify(current.samplePayload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right Column: Layer 2 Kafka Topics Inspector & Live Simulator */}
        <div className="space-y-6">
          {/* Kafka Topic Broker Monitor */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-white">
                  {isAr ? 'مراقبة عناقيد Apache Kafka الحية' : 'Kafka Telemetry Topics'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Active</span>
            </div>

            <div className="space-y-2 text-xs">
              {topics.map((t) => (
                <div key={t.name} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                    <span className="text-neutral-200 truncate">{t.name}</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {t.messagesPerSec.toLocaleString()} msg/s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                    <span>{t.partitions} partitions</span>
                    <span>Lag: {t.lag} ms</span>
                    <span>Retention: {t.retentionHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Packet Injector Simulator */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-white">
                {isAr ? 'محاكي ضخ حزم البيانات الحية' : 'Edge Telemetry Packet Injector'}
              </h4>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3">
              {isAr
                ? 'اختبار استجابة المنظومة لضخ حزم حساسات إضافية عبر بوابات الصحراء.'
                : 'Simulate injecting bursts of telemetry from desert gateways into Kafka.'}
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setTestPayloadType('collar')}
                  className={`flex-1 py-1.5 px-2 text-xs rounded border transition-colors ${
                    testPayloadType === 'collar' ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {isAr ? 'طوق بقرة (Collar)' : 'Collar'}
                </button>
                <button
                  onClick={() => setTestPayloadType('pivot')}
                  className={`flex-1 py-1.5 px-2 text-xs rounded border transition-colors ${
                    testPayloadType === 'pivot' ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {isAr ? 'محور سقي (Pivot)' : 'Pivot'}
                </button>
                <button
                  onClick={() => setTestPayloadType('soil')}
                  className={`flex-1 py-1.5 px-2 text-xs rounded border transition-colors ${
                    testPayloadType === 'soil' ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {isAr ? 'حساس تربة (Soil)' : 'Soil Probe'}
                </button>
              </div>

              <button
                onClick={handleSimulatePacket}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {simulationSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>
                  {simulationSent
                    ? (isAr ? 'تم استقبال الحزمة في Kafka بنجاح (2ms)' : 'Packet ingested in Kafka (2ms)')
                    : (isAr ? 'إرسال حزمة تجريبية عبر LoRaWAN' : 'Send Test Packet')}
                </span>
              </button>
            </div>
          </div>

          {/* Security & Invariant Guarantee */}
          <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs text-neutral-300">
              <span className="font-semibold text-white">{isAr ? 'تشفير شامل وحصانة ميدانية: ' : 'Air-gapped telemetry security: '}</span>
              {isAr
                ? 'اتصال مشفر TLS 1.3 بين بوابات LoRaWAN الصحراوية ومراكز البيانات الإقليمية.'
                : 'TLS 1.3 encrypted tunnel between Sahara gateways and regional cloud datacenter.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
