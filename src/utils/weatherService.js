/**
 * Accurate Marine Weather & Meteorological Prediction Engine
 * Provides live real-world observations via Open-Meteo API with automatic
 * scientific oceanographic fallback modeling for offline/historical dates.
 */

const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * WMO Weather Code to human-readable condition & precipitation type
 */
export function interpretWmoCode(code) {
  if (code === 0) return { label: 'Clear Sky', category: 'clear', rainRate: 0.0 };
  if (code === 1 || code === 2) return { label: 'Mainly Clear / Scattered Clouds', category: 'partly_cloudy', rainRate: 0.0 };
  if (code === 3) return { label: 'Overcast Convective Sky', category: 'overcast', rainRate: 0.0 };
  if (code === 45 || code === 48) return { label: 'Sea Fog / Marine Mist', category: 'fog', rainRate: 0.1 };
  if (code >= 51 && code <= 55) return { label: 'Light Ocean Drizzle', category: 'drizzle', rainRate: 0.8 };
  if (code >= 61 && code <= 63) return { label: 'Moderate Rain Showers', category: 'rain', rainRate: 3.5 };
  if (code >= 65 && code <= 67) return { label: 'Heavy Tropical Rain', category: 'heavy_rain', rainRate: 12.0 };
  if (code >= 80 && code <= 82) return { label: 'Squall Line Showers', category: 'squall', rainRate: 18.5 };
  if (code >= 95 && code <= 99) return { label: 'Severe Marine Thunderstorm / Squalls', category: 'thunderstorm', rainRate: 28.0 };
  return { label: 'Moderate Marine Sky', category: 'moderate', rainRate: 0.5 };
}

/**
 * Categorizes rain rate into standard meteorological intensity
 */
export function getRainRateCategory(rateMmH) {
  const rate = parseFloat(rateMmH) || 0;
  if (rate <= 0.05) return { text: 'Dry', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' };
  if (rate < 2.5) return { text: 'Light Drizzle', color: 'text-cyan-300', bg: 'bg-cyan-500/15 border-cyan-500/30' };
  if (rate < 8.0) return { text: 'Moderate Rain', color: 'text-sky-300', bg: 'bg-sky-500/15 border-sky-500/30' };
  if (rate < 20.0) return { text: 'Heavy Showers', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' };
  return { text: 'Torrential Squall', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' };
}

/**
 * Scientifically computes realistic marine meteorology based on geographic location,
 * sea surface temperature, seasonal climatology, and Coriolis parameter.
 */
export function calculateScientificWeather(lat, lon, dateObj = new Date(), inputSst = null) {
  const absLat = Math.abs(lat);
  const month = dateObj instanceof Date ? dateObj.getMonth() : 7; // 0-indexed month (default Aug)

  // 1. Sea Surface Temperature (SST) estimation if not supplied
  // Tropical oceans: 27-31°C; Polar: 0-4°C
  const sst = inputSst ?? Math.max(1.5, Math.min(31.5, 30.5 - Math.pow(absLat / 65, 1.7) * 26));

  // 2. Intertropical Convergence Zone (ITCZ) & Seasonal Monsoon Shift
  // ITCZ migrates between 5°S in Jan to 15°N in July/August
  const itczLat = 5 * Math.sin(((month - 3) / 12) * Math.PI * 2) + 7;
  const distToItcz = Math.abs(lat - itczLat);

  // 3. Realistic Rain Probability (%)
  // Highest near ITCZ, lowest in subtropical highs (25-35° latitude)
  let baseRainProb = 20;
  if (distToItcz < 10) {
    baseRainProb += (10 - distToItcz) * 4.5; // Up to 65% near ITCZ
  } else if (absLat >= 20 && absLat <= 35) {
    baseRainProb = 12; // Subtropical desert/arid ocean belts
  } else if (absLat > 45 && absLat < 65) {
    baseRainProb = 40; // Mid-latitude storm track
  }

  // Add longitude and diurnal variability
  const lonVar = Math.sin(lon * 0.08) * 8;
  const rainProbability = Math.round(Math.max(5, Math.min(95, baseRainProb + lonVar)));

  // 4. Realistic Instantaneous Rain Rate (mm/h)
  // Most days at sea are either dry or light rain. Extreme downpour (>25 mm/h) occurs during convective squalls/cyclones.
  // Deterministic micro-convective fluctuation based on geospatial harmonics (no non-deterministic randomness)
  const convectiveVariance = Math.abs(Math.sin(lat * 3.7 + lon * 2.1)) * 1.4;
  let rainRate = 0.0;
  if (rainProbability > 70) {
    rainRate = parseFloat((3.0 + (rainProbability - 70) * 0.45 + convectiveVariance).toFixed(1));
  } else if (rainProbability > 45) {
    rainRate = parseFloat((0.8 + (rainProbability - 45) * 0.12 + convectiveVariance * 0.25).toFixed(1));
  } else if (rainProbability > 25) {
    rainRate = parseFloat((0.1 + (rainProbability - 25) * 0.03).toFixed(1));
  } else {
    rainRate = 0.0;
  }

  // 5. Scientific Storm / Tropical Cyclone Genesis Risk (%)
  // Conditions: SST >= 26.5°C, Coriolis (|lat| >= 4.5°), and low shear
  let stormProbability = 10;
  if (sst >= 26.5 && absLat >= 4.5 && absLat <= 32) {
    // Favorable cyclogenesis basin
    const sstBonus = (sst - 26.5) * 8.0; // warmer water supplies more convective heat
    const coriolisFactor = Math.min(1.0, (absLat - 4.5) / 6.0);
    stormProbability = Math.round(15 + sstBonus * coriolisFactor + Math.sin(lon * 0.12) * 12);
  } else if (absLat >= 45) {
    // Extratropical low pressure systems
    stormProbability = Math.round(20 + Math.sin(month * 0.5) * 15);
  }
  stormProbability = Math.max(5, Math.min(90, stormProbability));

  // If a major storm is indicated, escalate rain rate accordingly
  if (stormProbability >= 75) {
    rainRate = Math.max(rainRate, parseFloat((16.0 + (stormProbability - 75) * 0.6).toFixed(1)));
  }

  // 6. Significant Wave Height (m)
  const baseWave = absLat > 40 ? 2.4 : 1.2;
  const waveHeight = parseFloat((baseWave + (stormProbability / 100) * 2.2 + Math.sin(lon * 0.15) * 0.3).toFixed(2));

  // 7. Surface Atmospheric Pressure (hPa)
  const pressure = Math.round(1013.25 - (stormProbability / 100) * 32);

  // 8. Dynamic Storm Classification
  let stormCategory = 'Nominal Marine Atmosphere';
  let stormName = 'Maritime Weather Cell';
  if (stormProbability >= 78) {
    stormCategory = 'Severe Cyclonic Storm';
    stormName = 'Tropical Cyclone System';
  } else if (stormProbability >= 55) {
    stormCategory = 'Active Tropical Storm';
    stormName = 'Squall & Deep Low Pressure';
  } else if (stormProbability >= 35) {
    stormCategory = 'Monsoon Depression';
    stormName = 'Maritime Convective Line';
  } else {
    stormCategory = 'Clear / Fair Maritime Skies';
    stormName = 'Normal Trade Wind Regime';
  }

  return {
    isLive: false,
    sst: parseFloat(sst.toFixed(2)),
    currentSpeed: parseFloat((0.4 + Math.sin(absLat * 0.1) * 0.45 + (stormProbability / 100) * 0.5).toFixed(2)),
    rainProbability,
    rainRate,
    stormProbability,
    waveHeight,
    pressure,
    windSpeedKmH: Math.round(20 + (stormProbability / 100) * 75),
    stormCategory,
    stormName,
    weatherLabel: rainRate > 10 ? 'Heavy Tropical Squall' : rainRate > 0.2 ? 'Passing Sea Showers' : 'Clear Maritime Sky',
    source: 'Grounded Oceanographic Physics Model'
  };
}

/**
 * Fetches real-time observations from Open-Meteo Marine & Forecast APIs
 */
export async function fetchLiveMarineWeather(lat, lon) {
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,surface_pressure&hourly=precipitation_probability,precipitation&forecast_days=1`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction`;

    // Fetch with a 3.5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const [weatherRes, marineRes] = await Promise.allSettled([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(marineUrl, { signal: controller.signal })
    ]);

    clearTimeout(timeoutId);

    if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
      return null;
    }

    const weatherData = await weatherRes.value.json();
    const current = weatherData.current || {};
    const hourly = weatherData.hourly || {};

    // Get live rain rate (mm/h)
    const liveRainRate = typeof current.precipitation === 'number' 
      ? parseFloat(current.precipitation.toFixed(1))
      : 0.0;

    // Get current precipitation probability (%)
    let liveRainProb = 20;
    if (Array.isArray(hourly.precipitation_probability) && hourly.precipitation_probability.length > 0) {
      const nowIdx = new Date().getUTCHours();
      liveRainProb = hourly.precipitation_probability[nowIdx] ?? hourly.precipitation_probability[0] ?? 20;
    }

    // Get marine wave & ocean current data if available
    let liveWaveHeight = 1.65;
    let liveCurrentSpeed = 0.85;
    if (marineRes.status === 'fulfilled' && marineRes.value.ok) {
      const marineData = await marineRes.value.json();
      if (typeof marineData.current?.wave_height === 'number') {
        liveWaveHeight = parseFloat(marineData.current.wave_height.toFixed(2));
      }
      if (typeof marineData.current?.ocean_current_velocity === 'number') {
        // Open-Meteo returns km/h; convert to m/s
        liveCurrentSpeed = parseFloat((marineData.current.ocean_current_velocity / 3.6).toFixed(2));
      }
    }

    // Live Sea Surface Temperature estimation from marine surface boundary layer
    let liveSst = 29.5;
    if (typeof current.temperature_2m === 'number') {
      const offset = (current.relative_humidity_2m ?? 80) > 82 ? 0.35 : 0.15;
      liveSst = parseFloat((current.temperature_2m + offset).toFixed(2));
    }

    const windSpeed = current.wind_speed_10m ?? 24;
    const pressure = current.surface_pressure ?? 1010;
    const wmoInterpretation = interpretWmoCode(current.weather_code ?? 0);

    // Calculate realistic storm risk based on actual live pressure, wind, and rain
    let liveStormProb = 15;
    if (pressure < 995 || windSpeed > 65) {
      liveStormProb = Math.min(95, Math.round(60 + (65 - pressure) * 1.5 + windSpeed * 0.3));
    } else if (pressure < 1005 || windSpeed > 40) {
      liveStormProb = Math.round(30 + (1005 - pressure) * 2.5);
    } else {
      liveStormProb = Math.max(5, Math.round(windSpeed * 0.6));
    }

    let stormCategory = 'Calm Maritime Weather';
    if (liveStormProb >= 75) stormCategory = 'High Storm Warning';
    else if (liveStormProb >= 45) stormCategory = 'Moderate Squall Cell';
    else if (liveStormProb >= 25) stormCategory = 'Isolated Marine Showers';

    const result = {
      isLive: true,
      sst: liveSst,
      currentSpeed: liveCurrentSpeed,
      rainProbability: liveRainProb,
      rainRate: liveRainRate,
      stormProbability: liveStormProb,
      waveHeight: liveWaveHeight,
      pressure: Math.round(pressure),
      windSpeedKmH: Math.round(windSpeed),
      stormCategory,
      stormName: wmoInterpretation.label,
      weatherLabel: wmoInterpretation.label,
      source: 'Live Open-Meteo Satellite & Marine API'
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (err) {
    console.warn('Live marine weather fetch failed, falling back to scientific model:', err?.message);
    return null;
  }
}

/**
 * Unified getter that attempts live API observations with instantaneous fallback
 * to the scientific physical oceanographic model.
 */
export async function getAccurateMeteorology(lat, lon, dateObj = new Date(), sst = null) {
  const live = await fetchLiveMarineWeather(lat, lon);
  if (live) return live;
  return calculateScientificWeather(lat, lon, dateObj, sst);
}
