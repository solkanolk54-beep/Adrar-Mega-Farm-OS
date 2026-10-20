/**
 * Adrar Mega-Farm OS - Core Engineering & Telemetry Logic
 * Pure deterministic calculations for IIoT telemetry, pivot hydraulics,
 * milk powder processing yield, and herd biometrics.
 */

export interface WeatherCondition {
  temperatureC: number;
  humidityPercent: number;
  windKmH: number;
  solarRadiationMJ: number;
}

export interface PivotSpec {
  id: string;
  name: string;
  sector: string;
  radiusMeters: number; // e.g. 400m = ~50.2 hectares
  currentAngle: number; // 0 - 360 degrees
  waterPressureBar: number; // nominal 2.8 - 4.5 bar
  applicationDepthMm: number; // e.g. 6.5 mm
  rotationSpeedPct: number; // 10% - 100%
  status: 'running' | 'idle' | 'warning' | 'fault';
  cropType: 'barley' | 'wheat' | 'alfalfa' | 'silage_corn';
  soilMoisture10cm: number; // percentage %
  soilMoisture30cm: number;
  soilMoisture60cm: number;
  flowRateM3H: number;
}

export interface CollarBiometrics {
  collarId: string;
  cowTag: string;
  breed: 'Holstein-Friesian' | 'Montbéliarde';
  bodyTempC: number; // nominal 38.3 - 39.2 °C
  ruminationMinutesDaily: number; // nominal 420 - 540 min
  activityIndex: number; // nominal 100 base index
  heartRateBpm: number; // nominal 60 - 84 bpm
  lactationDay: number;
  dailyMilkYieldLiters: number;
  status: 'healthy' | 'estrus_alert' | 'heat_stress' | 'rumination_low' | 'fever_isolate';
}

/**
 * Calculates Reference Evapotranspiration (ET0) using simplified Hargreaves/Penman-Monteith
 * desert adaptation for Adrar hyper-arid climate.
 * Output: mm of water loss per day.
 */
export function calculateEvapotranspiration(weather: WeatherCondition): number {
  const { temperatureC, humidityPercent, windKmH, solarRadiationMJ } = weather;
  // Vapor deficit multiplier
  const vpd = Math.max(0.5, (1 - humidityPercent / 100) * (temperatureC / 10));
  // Wind factor (km/h to m/s factor)
  const windFactor = 1 + (windKmH / 50) * 0.4;
  // Radiation radiation conversion
  const radFactor = (solarRadiationMJ * 0.408) * 0.55;
  // Base thermal formula
  const et0 = (0.0023 * (temperatureC + 17.8) * Math.sqrt(Math.max(1, temperatureC - 10)) * radFactor * vpd * windFactor);
  return Number(Math.max(2.0, Math.min(16.0, et0)).toFixed(2));
}

/**
 * Calculates water required in cubic meters (m³) for a circular center pivot.
 * Area = PI * r² (in m²), then 1 mm depth over 1 m² = 0.001 m³.
 */
export function calculatePivotWaterVolume(radiusMeters: number, depthMm: number): number {
  if (radiusMeters <= 0 || depthMm <= 0) return 0;
  const areaM2 = Math.PI * Math.pow(radiusMeters, 2);
  const volumeM3 = (areaM2 * depthMm) / 1000;
  return Number(volumeM3.toFixed(1));
}

/**
 * Calculates hours required for a center pivot to complete a full 360° circle.
 * Outer perimeter = 2 * PI * radiusMeters.
 * Speed at 100% = maxSpeedMPerMin (typically 2.5 m/min for standard Zimmatic/Valley pivot).
 */
export function calculatePivotRotationHours(
  radiusMeters: number,
  speedPercent: number,
  maxSpeedMPerMin: number = 2.5
): number {
  if (radiusMeters <= 0 || speedPercent <= 0 || maxSpeedMPerMin <= 0) return 0;
  const clampedSpeed = Math.max(5, Math.min(100, speedPercent));
  const effectiveSpeedMPerMin = maxSpeedMPerMin * (clampedSpeed / 100);
  const perimeterM = 2 * Math.PI * radiusMeters;
  const minutes = perimeterM / effectiveSpeedMPerMin;
  return Number((minutes / 60).toFixed(1));
}

/**
 * Evaluates collar biometrics to detect heat stress, estrus peak, or subclinical fever.
 */
export function assessCollarHealthStatus(
  bodyTempC: number,
  ruminationMinutes: number,
  activityIndex: number
): CollarBiometrics['status'] {
  if (bodyTempC >= 40.2) {
    return 'fever_isolate';
  }
  if (bodyTempC >= 39.4 && ruminationMinutes < 380) {
    return 'heat_stress';
  }
  if (activityIndex >= 180 && ruminationMinutes < 420) {
    return 'estrus_alert';
  }
  if (ruminationMinutes < 300) {
    return 'rumination_low';
  }
  return 'healthy';
}

/**
 * Calculates daily and annual milk powder yield.
 * Standard ratio: ~8.2 to 8.7 liters of raw milk produces 1 kg of Whole Milk Powder (WMP).
 */
export function calculateMilkPowderProduction(
  lactatingCowCount: number,
  avgLitersPerCow: number,
  litersPerKgPowder: number = 8.5
): {
  dailyRawMilkLiters: number;
  dailyPowderTons: number;
  annualPowderTons: number;
} {
  const dailyRawMilkLiters = lactatingCowCount * avgLitersPerCow;
  const dailyPowderKg = dailyRawMilkLiters / litersPerKgPowder;
  const dailyPowderTons = Number((dailyPowderKg / 1000).toFixed(1));
  const annualPowderTons = Number((dailyPowderTons * 365).toFixed(0));

  return {
    dailyRawMilkLiters,
    dailyPowderTons,
    annualPowderTons,
  };
}

/**
 * Calculates telemetry ingestion rate into Kafka & EMQX broker.
 * 270,000 collars @ e.g. 30s intervals + 1,400 pivots @ 5s intervals + weather & silos.
 */
export function calculateTelemetryThroughput(
  collarCount: number,
  collarIntervalSec: number,
  pivotCount: number,
  pivotIntervalSec: number
): {
  collarEventsPerSec: number;
  pivotEventsPerSec: number;
  totalEventsPerSec: number;
  mbpsBandwidthEstimated: number;
} {
  const collarEventsPerSec = Math.round(collarCount / Math.max(1, collarIntervalSec));
  const pivotEventsPerSec = Math.round(pivotCount / Math.max(1, pivotIntervalSec));
  const totalEventsPerSec = collarEventsPerSec + pivotEventsPerSec;
  // Approx 250 bytes per payload
  const mbpsBandwidthEstimated = Number(((totalEventsPerSec * 250 * 8) / 1000000).toFixed(2));

  return {
    collarEventsPerSec,
    pivotEventsPerSec,
    totalEventsPerSec,
    mbpsBandwidthEstimated,
  };
}

/**
 * Calculates herd daily forage and grain consumption (Dry Matter basis).
 */
export function calculateHerdDailyFeedDemand(totalHerdCount: number): {
  silageCornTons: number;
  alfalfaHayTons: number;
  barleyGrainTons: number;
  totalDailyFeedTons: number;
} {
  // Average ~22 kg DM intake per mature cow per day equivalent across herd
  const silageCornTons = Number(((totalHerdCount * 12) / 1000).toFixed(0));
  const alfalfaHayTons = Number(((totalHerdCount * 6) / 1000).toFixed(0));
  const barleyGrainTons = Number(((totalHerdCount * 4) / 1000).toFixed(0));
  const totalDailyFeedTons = silageCornTons + alfalfaHayTons + barleyGrainTons;

  return {
    silageCornTons,
    alfalfaHayTons,
    barleyGrainTons,
    totalDailyFeedTons,
  };
}

/**
 * Resolves target Kafka topic from MQTT hierarchical topic path
 */
export function resolveKafkaTopicFromMqttTopic(mqttTopic: string): string {
  if (mqttTopic.startsWith('adrar/telemetry/collars/')) {
    return 'adrar.telemetry.collars';
  }
  if (mqttTopic.startsWith('adrar/telemetry/pivots/')) {
    return 'adrar.telemetry.pivots';
  }
  if (mqttTopic.startsWith('adrar/telemetry/soil/')) {
    return 'adrar.telemetry.soil_moisture';
  }
  if (mqttTopic.startsWith('adrar/control/')) {
    return 'adrar.control.audit';
  }
  return 'adrar.telemetry.unknown';
}

/**
 * Converts USD investment to Algerian Dinar (DZD)
 * Official rate approx 134.5 DZD/USD
 */
export function calculateDzdEquivalent(usdAmount: number, exchangeRate: number = 134.5): number {
  if (usdAmount <= 0) return 0;
  return Math.round(usdAmount * exchangeRate);
}

/**
 * Calculates liquid fertilizer injected in liters per pivot rotation
 * Rotation hours * dosing rate (L/h)
 */
export function calculateFertigationVolume(rotationHours: number, dosingRateLh: number): number {
  if (rotationHours <= 0 || dosingRateLh <= 0) return 0;
  return Number((rotationHours * dosingRateLh).toFixed(1));
}

