import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEvapotranspiration,
  calculatePivotWaterVolume,
  calculatePivotRotationHours,
  assessCollarHealthStatus,
  calculateMilkPowderProduction,
  calculateTelemetryThroughput,
  calculateHerdDailyFeedDemand,
  resolveKafkaTopicFromMqttTopic,
  calculateDzdEquivalent,
  calculateFertigationVolume,
} from './farmCalculations.ts';

test('Evapotranspiration (ET0) scales with desert heat and wind', () => {
  const coolAdrar = {
    temperatureC: 22,
    humidityPercent: 35,
    windKmH: 10,
    solarRadiationMJ: 18,
  };
  const extremeAdrarSummer = {
    temperatureC: 46,
    humidityPercent: 10,
    windKmH: 32,
    solarRadiationMJ: 28,
  };

  const etCool = calculateEvapotranspiration(coolAdrar);
  const etHot = calculateEvapotranspiration(extremeAdrarSummer);

  assert.ok(etCool > 0, 'Cool season ET0 must be positive');
  assert.ok(etHot > etCool, 'Extreme desert heat must have significantly higher ET0');
  assert.ok(etHot <= 16.0, 'ET0 is clamped within reasonable biological maximum');
});

test('Pivot water volume calculation corresponds to circular area geometry', () => {
  // Radius = 400m -> Area = PI * 400^2 = ~502,654 m²
  // At 5 mm depth -> 502,654 * 0.005 m = ~2513.3 m³
  const volume = calculatePivotWaterVolume(400, 5);
  assert.ok(Math.abs(volume - 2513.3) < 2, `Expected ~2513.3 m³, received ${volume}`);

  // Zero boundary condition
  assert.equal(calculatePivotWaterVolume(0, 5), 0);
  assert.equal(calculatePivotWaterVolume(400, 0), 0);
});

test('Pivot rotation duration is inverse of speed setting', () => {
  // Radius = 400m -> Perimeter = 2 * PI * 400 = ~2513.27 m
  // Speed 100% at 2.5 m/min -> 2513.27 / 2.5 = ~1005.3 min = ~16.8 hours
  const hoursFullSpeed = calculatePivotRotationHours(400, 100, 2.5);
  const hoursHalfSpeed = calculatePivotRotationHours(400, 50, 2.5);

  assert.ok(Math.abs(hoursFullSpeed - 16.8) < 0.3, `Expected ~16.8h, got ${hoursFullSpeed}`);
  assert.ok(hoursHalfSpeed > hoursFullSpeed, 'Half speed must take longer to rotate');
  assert.ok(Math.abs(hoursHalfSpeed - hoursFullSpeed * 2) < 0.5, 'Should take ~2x the time');
});

test('Collar biometric triage accurately isolates fever and detects estrus', () => {
  // Healthy baseline
  assert.equal(assessCollarHealthStatus(38.6, 480, 95), 'healthy');

  // Severe fever alert
  assert.equal(assessCollarHealthStatus(40.4, 320, 45), 'fever_isolate');

  // Heat stress (high body temp + rumination drop)
  assert.equal(assessCollarHealthStatus(39.6, 350, 80), 'heat_stress');

  // Estrus alert (spike in activity + rumination dip)
  assert.equal(assessCollarHealthStatus(38.8, 390, 210), 'estrus_alert');

  // Rumination deficiency
  assert.equal(assessCollarHealthStatus(38.5, 260, 80), 'rumination_low');
});

test('Milk powder annual output model aligns with the 193,000 tons/year target', () => {
  // When ~175,000 milking cows produce ~30 L/day
  // 175,000 * 30 = 5,250,000 L / 8.5 kg per L = ~617,647 kg powder/day = ~617.6 tons/day
  // 617.6 * 365 = ~225,424 tons/yr (close to the 193k target with seasonal dry curve)
  const production = calculateMilkPowderProduction(150000, 30, 8.5);
  assert.ok(production.dailyRawMilkLiters === 4500000);
  assert.ok(production.annualPowderTons > 180000 && production.annualPowderTons < 210000,
    `Production ${production.annualPowderTons} should be close to 193k target`);
});

test('Telemetry throughput scales with 270k herd and 1400 pivots', () => {
  // 270,000 collars sent every 30s = 9,000 events/sec
  // 1,400 pivots sent every 5s = 280 events/sec
  const telemetry = calculateTelemetryThroughput(270000, 30, 1400, 5);
  assert.equal(telemetry.collarEventsPerSec, 9000);
  assert.equal(telemetry.pivotEventsPerSec, 280);
  assert.equal(telemetry.totalEventsPerSec, 9280);
  assert.ok(telemetry.mbpsBandwidthEstimated > 0);
});

test('Feed ration estimation provides essential tons for 270k herd', () => {
  const feed = calculateHerdDailyFeedDemand(270000);
  assert.equal(feed.silageCornTons, 3240);
  assert.equal(feed.alfalfaHayTons, 1620);
  assert.equal(feed.barleyGrainTons, 1080);
  assert.equal(feed.totalDailyFeedTons, 5940);
});

test('SCADA MQTT to Kafka topic mapper routes telemetry paths correctly', () => {
  assert.equal(
    resolveKafkaTopicFromMqttTopic('adrar/telemetry/collars/CLR-US-AZ-88301'),
    'adrar.telemetry.collars'
  );
  assert.equal(
    resolveKafkaTopicFromMqttTopic('adrar/telemetry/pivots/PIVOT-1204'),
    'adrar.telemetry.pivots'
  );
  assert.equal(
    resolveKafkaTopicFromMqttTopic('adrar/telemetry/soil/SENSOR-401'),
    'adrar.telemetry.soil_moisture'
  );
  assert.equal(
    resolveKafkaTopicFromMqttTopic('adrar/control/pivots/PIVOT-1204/command'),
    'adrar.control.audit'
  );
});

test('USD to Algerian Dinar (DZD) sovereign exchange calculation is accurate', () => {
  // $3.5B at 134.5 rate = 470,750,000,000 DZD
  const dzd35B = calculateDzdEquivalent(3500000000, 134.5);
  assert.equal(dzd35B, 470750000000);

  // $1.2B annual savings = 161,400,000,000 DZD
  const dzd12B = calculateDzdEquivalent(1200000000, 134.5);
  assert.equal(dzd12B, 161400000000);
});

test('Fertigation liquid dosing volume calculates total injected liters', () => {
  // 16.8 hours * 15 L/h = 252 Liters of NPK fertilizer
  const volume = calculateFertigationVolume(16.8, 15);
  assert.equal(volume, 252);
});

