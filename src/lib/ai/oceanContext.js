/**
 * Ocean Vision 3D - AI Copilot Context Serializer
 * Aggregates and compresses real-time digital twin state into a high-density,
 * scientifically structured telemetry payload for the Copilot AI engine.
 */

import { calculateParameterAtDepth } from '../../data/oceanData';
import { calculateHydrostaticPressure } from '../../utils/pressureCalculator';

/**
 * Serializes the application's current state into an OceanContext object.
 */
export function buildOceanContext({
  activeRegion,
  selectedParam = 'sst',
  depth = 50,
  viewMode = 'depth_slice',
  timeHour = 12,
  selectedDate,
  isStormLayerActive = false,
  ensoState = { phase: 'elnino', intensity: 0.75 },
  language = 'en'
}) {
  const lat = activeRegion?.lat ?? 15.297;
  const lon = activeRegion?.lon ?? 87.860;
  const sst = activeRegion?.sst ?? 29.85;
  const salinity = activeRegion?.salinity ?? 33.42;
  const currentSpeed = activeRegion?.currentSpeed ?? 0.85;
  const waveHeight = activeRegion?.waveHeight ?? 1.65;
  const chlorophyll = activeRegion?.chlorophyll ?? 1.25;
  const oxygen = activeRegion?.oxygen ?? 6.85;
  const pressure = activeRegion?.pressure ?? 1008;
  const windSpeed = activeRegion?.windSpeedKmH ?? 26;
  const stormCategory = activeRegion?.activeStorm?.category || 'Normal Convective Flow';
  const stormName = activeRegion?.activeStorm?.name || 'Standard Maritime Activity';

  // Compute physical metric at the currently selected depth slice
  const paramAtDepth = calculateParameterAtDepth
    ? calculateParameterAtDepth(selectedParam, depth, activeRegion)
    : sst;

  // Compute hydrostatic pressure at depth
  const hydrostaticPressure = calculateHydrostaticPressure
    ? calculateHydrostaticPressure(depth, lat, sst, salinity)
    : { bar: (Number(depth) * 0.101).toFixed(2) };

  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 15.297;
  const safeLon = typeof lon === 'number' && !isNaN(lon) ? lon : 87.860;
  const safeSst = typeof sst === 'number' && !isNaN(sst) ? sst : 29.85;
  const safeSal = typeof salinity === 'number' && !isNaN(salinity) ? salinity : 33.42;
  const safeO2 = typeof oxygen === 'number' && !isNaN(oxygen) ? oxygen : 6.85;
  const safeChl = typeof chlorophyll === 'number' && !isNaN(chlorophyll) ? chlorophyll : 1.25;

  return {
    timestamp: new Date().toISOString(),
    simulationTime: `${Math.floor(timeHour).toString().padStart(2, '0')}:${Math.floor((timeHour % 1) * 60).toString().padStart(2, '0')} UTC`,
    date: selectedDate || new Date().toISOString().split('T')[0],
    rawRegion: activeRegion,
    activeRegion: activeRegion,
    activeBasin: {
      id: activeRegion?.id || 'custom',
      name: activeRegion?.name || 'Custom Coordinates',
      coords: activeRegion?.coords || `${safeLat.toFixed(3)}° N, ${safeLon.toFixed(3)}° E`,
      coordinates: activeRegion?.coords || `${safeLat.toFixed(3)}° N, ${safeLon.toFixed(3)}° E`,
      lat: safeLat,
      lon: safeLon,
      latitude: safeLat,
      longitude: safeLon,
      sst: safeSst,
      salinity: safeSal,
      currentSpeed: activeRegion?.currentSpeed ?? currentSpeed,
      waveHeight: activeRegion?.waveHeight ?? waveHeight,
      chlorophyll: safeChl,
      oxygen: safeO2,
      pressure: activeRegion?.pressure ?? pressure,
      windSpeedKmH: activeRegion?.windSpeedKmH ?? windSpeed,
      stormProbability: activeRegion?.stormProbability ?? 30,
      rainProbability: activeRegion?.rainProbability ?? 35,
      rainRate: activeRegion?.rainRate ?? 2.0,
      activeStorm: activeRegion?.activeStorm,
      buoys: activeRegion?.buoys,
      isLiveSatelliteSync: activeRegion?.isLive ?? false
    },
    activeLayer: {
      parameter: selectedParam,
      name: getParamName(selectedParam),
      unit: getParamUnit(selectedParam),
      surfaceValue: getParamSurfaceValue(selectedParam, activeRegion),
      valueAtActiveDepth: paramAtDepth,
      depthMeters: depth,
      hydrostaticPressureBar: hydrostaticPressure?.bar || (Number(depth) * 0.101).toFixed(2),
      viewMode
    },
    meteorologyAndHazards: {
      stormCategory,
      stormName,
      stormProbabilityPercent: activeRegion?.stormProbability ?? 30,
      rainProbabilityPercent: activeRegion?.rainProbability ?? 35,
      rainRateMmH: activeRegion?.rainRate ?? 2.0,
      waveHeightMeters: waveHeight,
      currentSpeedMS: currentSpeed,
      windSpeedKmH: windSpeed,
      barometricPressureHPa: pressure,
      isStormLayerActive
    },
    climatologyAndENSO: {
      phase: ensoState?.phase || 'elnino',
      intensity: ensoState?.intensity || 0.75,
      description: ensoState?.phase === 'elnino' 
        ? 'El Niño Active: Weakened Pacific trade winds, eastward thermocline depression'
        : ensoState?.phase === 'lanina'
        ? 'La Niña Active: Supercharged trade winds, enhanced cold tongue upwelling'
        : 'ENSO Neutral: Standard Walker circulation'
    },
    oceanographicProfile: {
      surfaceSST: `${safeSst.toFixed(2)} °C`,
      surfaceSalinity: `${safeSal.toFixed(2)} PSU`,
      dissolvedOxygen: `${safeO2.toFixed(2)} mg/L`,
      chlorophyllA: `${safeChl.toFixed(2)} mg/m³`,
      buoyCount: activeRegion?.buoys?.length || 0,
      activeBuoyNames: (activeRegion?.buoys || []).slice(0, 3).map(b => b.name)
    },
    userContext: {
      language
    }
  };
}

function getParamName(param) {
  const map = {
    sst: 'Sea Surface Temperature',
    salinity: 'Salinity',
    currents: 'Ocean Current Velocity',
    wave: 'Significant Wave Height',
    chlorophyll: 'Chlorophyll-a Biomass',
    oxygen: 'Dissolved Oxygen'
  };
  return map[param] || param;
}

function getParamUnit(param) {
  const map = {
    sst: '°C',
    salinity: 'PSU',
    currents: 'm/s',
    wave: 'm',
    chlorophyll: 'mg/m³',
    oxygen: 'mg/L'
  };
  return map[param] || '';
}

function getParamSurfaceValue(param, region) {
  if (!region) return 0;
  switch (param) {
    case 'sst': return region.sst ?? 29.85;
    case 'salinity': return region.salinity ?? 33.42;
    case 'currents': return region.currentSpeed ?? 0.85;
    case 'wave': return region.waveHeight ?? 1.65;
    case 'chlorophyll': return region.chlorophyll ?? 1.25;
    case 'oxygen': return region.oxygen ?? 6.85;
    default: return 0;
  }
}
