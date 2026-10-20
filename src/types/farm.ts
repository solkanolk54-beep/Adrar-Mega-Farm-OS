export type Language = 'ar' | 'en' | 'fr';

export type UserRole = 'adrar_field' | 'algiers_hq' | 'doha_board';

export type CropType = 'barley' | 'wheat' | 'alfalfa' | 'silage_corn';

export interface PivotItem {
  id: string;
  code: string; // e.g. PIV-0412
  sector: string;
  radiusM: number; // 400m = ~50 ha
  crop: CropType;
  cropNameAr: string;
  cropNameEn: string;
  growthStage: string;
  currentAngle: number; // degrees
  rotationSpeedPct: number;
  waterDepthMm: number;
  flowRateM3H: number;
  waterPressureBar: number;
  status: 'running' | 'idle' | 'warning' | 'fault';
  soil10cm: number; // %
  soil30cm: number;
  soil60cm: number;
  ndviScore: number; // 0.0 - 1.0 (satellite vegetation index)
  pumpPowerKw: number;
  fertigationActive: boolean;
  lastLoRaPingSec: number;
}

export interface CattleCollarItem {
  collarId: string;
  cowTag: string; // e.g. DZ-ADR-88412
  sectorBarn: string;
  breed: 'Holstein-Friesian' | 'Montbéliarde';
  bodyTempC: number;
  ruminationMin: number;
  activitySteps: number;
  heartRateBpm: number;
  lactationDay: number;
  dailyMilkLiters: number;
  healthStatus: 'healthy' | 'estrus_alert' | 'heat_stress' | 'rumination_low' | 'fever_isolate';
  lastPingSec: number;
  aiNotes: string;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  layer: number;
  source: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  resolved: boolean;
}

export interface KafkaTopicMetric {
  name: string;
  partitions: number;
  messagesPerSec: number;
  lag: number;
  retentionHours: number;
  status: 'nominal' | 'degraded';
}

export interface FarmKpis {
  totalHerd: number;
  milkingCows: number;
  activePivots: number;
  totalPivots: number;
  totalAreaHa: number;
  annualPowderCapacityTons: number;
  currentPowderDailyTons: number;
  totalWaterPumpingM3H: number;
  totalPowerMw: number;
  ambientTempC: number;
  humidityPct: number;
  windSpeedKmH: number;
  telemetryEventsPerSec: number;
}
