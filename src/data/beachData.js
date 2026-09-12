import { calculateScientificWeather } from '../utils/weatherService.js';

/**
 * Coastal Beaches & Marine Weather / Rain Prediction Engine
 * Provides accurate beach coordinates, rainfall projections, surf risks, and coastal alerts
 */

export const COASTAL_BEACHES = [
  // --- Bay of Bengal Coastlines ---
  {
    id: 'bch_puri',
    name: 'Puri Golden Beach',
    state: 'Odisha',
    country: 'India',
    region: 'bay_of_bengal',
    lat: 19.798,
    lon: 85.825,
    shoreFacing: 'South-East',
    normalWaveHeight: 1.4,
    description: 'Premier pilgrimage and surf coastline along the central Odisha seaboard, highly vulnerable to Bay of Bengal cyclonic tracks.'
  },
  {
    id: 'bch_digha',
    name: 'Digha Coastal Beach',
    state: 'West Bengal',
    country: 'India',
    region: 'bay_of_bengal',
    lat: 21.626,
    lon: 87.507,
    shoreFacing: 'South',
    normalWaveHeight: 1.2,
    description: 'Shallow gradient beach on the northern Bay coast, susceptible to monsoonal surge and heavy convective cloud bands.'
  },
  {
    id: 'bch_coxs_bazar',
    name: "Cox's Bazar Long Beach",
    state: 'Chittagong',
    country: 'Bangladesh',
    region: 'bay_of_bengal',
    lat: 21.427,
    lon: 91.978,
    shoreFacing: 'West',
    normalWaveHeight: 1.8,
    description: "The world's longest unbroken natural sea beach (120 km), prone to intense monsoon depressions and cyclonic landfall squalls."
  },
  {
    id: 'bch_marina',
    name: 'Marina Beach',
    state: 'Tamil Nadu (Chennai)',
    country: 'India',
    region: 'bay_of_bengal',
    lat: 13.050,
    lon: 80.282,
    shoreFacing: 'East',
    normalWaveHeight: 1.3,
    description: 'Historic urban coastline on the Coromandel coast, receiving strong northeast monsoon rainfall and coastal swells.'
  },
  {
    id: 'bch_rk_vizag',
    name: 'Ramakrishna (RK) Beach',
    state: 'Andhra Pradesh (Visakhapatnam)',
    country: 'India',
    region: 'bay_of_bengal',
    lat: 17.712,
    lon: 83.320,
    shoreFacing: 'South-East',
    normalWaveHeight: 1.6,
    description: 'Prominent eastern naval coastline flanked by Dolphin’s Nose headland, with active maritime swell channels.'
  },
  {
    id: 'bch_radhanagar',
    name: 'Radhanagar Beach',
    state: 'Andaman & Nicobar (Havelock)',
    country: 'India',
    region: 'bay_of_bengal',
    lat: 11.984,
    lon: 92.951,
    shoreFacing: 'West',
    normalWaveHeight: 0.9,
    description: 'Crystalline island shoreline directly situated in the tropical equatorial convective convergence corridor.'
  },
  {
    id: 'bch_kuakata',
    name: 'Kuakata Daughter of Sea Beach',
    state: 'Barisal',
    country: 'Bangladesh',
    region: 'bay_of_bengal',
    lat: 21.817,
    lon: 90.117,
    shoreFacing: 'South',
    normalWaveHeight: 1.5,
    description: 'Panoramic deltaic coast offering sunrise and sunset over the Bay, heavily shaped by Gangetic outflow currents.'
  },

  // --- Arabian Sea Coastlines ---
  {
    id: 'bch_juhu',
    name: 'Juhu Beach',
    state: 'Maharashtra (Mumbai)',
    country: 'India',
    region: 'arabian_sea',
    lat: 19.098,
    lon: 72.826,
    shoreFacing: 'West',
    normalWaveHeight: 1.5,
    description: 'Iconic Arabian Sea shore subject to intense summer southwest monsoon cloudbursts and high spring tidal surges.'
  },
  {
    id: 'bch_baga',
    name: 'Baga & Calangute Beach',
    state: 'Goa',
    country: 'India',
    region: 'arabian_sea',
    lat: 15.555,
    lon: 73.751,
    shoreFacing: 'West',
    normalWaveHeight: 1.3,
    description: 'Dynamic Konkan shoreline with active surf breaks, seasonal upwelling, and coastal squall activity.'
  },
  {
    id: 'bch_kovalam',
    name: 'Kovalam Lighthouse Beach',
    state: 'Kerala',
    country: 'India',
    region: 'arabian_sea',
    lat: 8.398,
    lon: 76.978,
    shoreFacing: 'South-West',
    normalWaveHeight: 1.7,
    description: 'Southern tip headland receiving the initial onset pulses of the Indian Ocean southwest monsoon with powerful swells.'
  },
  {
    id: 'bch_clifton',
    name: 'Clifton Beach',
    state: 'Sindh (Karachi)',
    country: 'Pakistan',
    region: 'arabian_sea',
    lat: 24.813,
    lon: 67.030,
    shoreFacing: 'South',
    normalWaveHeight: 1.4,
    description: 'Northern Arabian Sea coastal shelf influenced by Makran offshore currents and desert heat low atmospheric transitions.'
  },
  {
    id: 'bch_salalah',
    name: 'Al Mughsail Beach',
    state: 'Dhofar (Salalah)',
    country: 'Oman',
    region: 'arabian_sea',
    lat: 16.883,
    lon: 53.771,
    shoreFacing: 'South',
    normalWaveHeight: 2.1,
    description: 'Khareef monsoon misty coastal bluffs with blowholes, experiencing heavy seasonal swells and coastal fog.'
  },

  // --- South China Sea Coastlines ---
  {
    id: 'bch_danang',
    name: 'My Khe Beach (Da Nang)',
    state: 'Central Coast',
    country: 'Vietnam',
    region: 'south_china_sea',
    lat: 16.068,
    lon: 108.246,
    shoreFacing: 'East',
    normalWaveHeight: 1.6,
    description: 'Exposed South China Sea coastline facing typhoon tracks with powerful winter monsoonal waves.'
  },
  {
    id: 'bch_boracay',
    name: 'Boracay White Beach',
    state: 'Aklan',
    country: 'Philippines',
    region: 'south_china_sea',
    lat: 11.967,
    lon: 121.924,
    shoreFacing: 'West',
    normalWaveHeight: 0.8,
    description: 'Tropical coral island shoreline influenced by Habagat (southwest monsoon) rain and western Pacific typhoon squalls.'
  },
  {
    id: 'bch_yalong',
    name: 'Yalong Bay',
    state: 'Hainan (Sanya)',
    country: 'China',
    region: 'south_china_sea',
    lat: 18.204,
    lon: 109.645,
    shoreFacing: 'South',
    normalWaveHeight: 1.1,
    description: 'Crescent tropical bay on Hainan Island subject to frequent late-summer tropical storm warnings.'
  },
  {
    id: 'bch_pattaya',
    name: 'Pattaya Main Beach',
    state: 'Chon Buri',
    country: 'Thailand',
    region: 'south_china_sea',
    lat: 12.935,
    lon: 100.880,
    shoreFacing: 'West',
    normalWaveHeight: 0.7,
    description: 'Gulf of Thailand coastal resort zone experiencing diurnal sea breeze thunderstorms and localized squalls.'
  },

  // --- Gulf of Mexico Coastlines ---
  {
    id: 'bch_miami',
    name: 'South Beach (Miami)',
    state: 'Florida',
    country: 'USA',
    region: 'gulf_of_mexico',
    lat: 25.778,
    lon: -80.131,
    shoreFacing: 'East',
    normalWaveHeight: 1.0,
    description: 'Subtropical Atlantic-Gulf corridor beach with immediate proximity to the rapid Florida Current / Gulf Stream.'
  },
  {
    id: 'bch_galveston',
    name: 'Galveston Island Beach',
    state: 'Texas',
    country: 'USA',
    region: 'gulf_of_mexico',
    lat: 29.281,
    lon: -94.819,
    shoreFacing: 'South-East',
    normalWaveHeight: 1.2,
    description: 'Barrier island coastline with seawall defenses, exposed to western Gulf tropical storms and heavy rain squalls.'
  },
  {
    id: 'bch_cancun',
    name: 'Playa Delfines (Cancun)',
    state: 'Quintana Roo',
    country: 'Mexico',
    region: 'gulf_of_mexico',
    lat: 21.061,
    lon: -86.782,
    shoreFacing: 'East',
    normalWaveHeight: 1.5,
    description: 'Yucatan Channel turquoise shoreline with strong Caribbean surf and Caribbean tropical wave interactions.'
  },

  // --- North Atlantic Coastlines ---
  {
    id: 'bch_myrtle',
    name: 'Myrtle Beach Grand Strand',
    state: 'South Carolina',
    country: 'USA',
    region: 'north_atlantic',
    lat: 33.689,
    lon: -78.886,
    shoreFacing: 'East',
    normalWaveHeight: 1.3,
    description: 'Extensive Atlantic shoreline subject to Cape Hatteras low pressure developments and hurricane swell trains.'
  },
  {
    id: 'bch_biarritz',
    name: 'Biarritz Grande Plage',
    state: 'Basque Coast',
    country: 'France',
    region: 'north_atlantic',
    lat: 43.484,
    lon: -1.558,
    shoreFacing: 'West',
    normalWaveHeight: 2.2,
    description: 'Bay of Biscay surf mecca known for heavy Atlantic winter gales, rip currents, and high frontal rainfall.'
  },
  {
    id: 'bch_algarve',
    name: 'Praia da Rocha (Algarve)',
    state: 'Faro',
    country: 'Portugal',
    region: 'north_atlantic',
    lat: 37.118,
    lon: -8.536,
    shoreFacing: 'South',
    normalWaveHeight: 1.4,
    description: 'Golden cliff coastline on the Iberian southwest shelf with tempered Mediterranean-Atlantic climate.'
  },

  // --- Equatorial & Western Pacific Coastlines ---
  {
    id: 'bch_waikiki',
    name: 'Waikiki Beach',
    state: 'Hawaii (Honolulu)',
    country: 'USA',
    region: 'equatorial_pacific',
    lat: 21.276,
    lon: -157.828,
    shoreFacing: 'South',
    normalWaveHeight: 1.1,
    description: 'World renowned Pacific reef-protected bay with trade wind showers and southern hemisphere groundswells.'
  },
  {
    id: 'bch_bondi',
    name: 'Bondi Beach',
    state: 'New South Wales (Sydney)',
    country: 'Australia',
    region: 'equatorial_pacific',
    lat: -33.891,
    lon: 151.274,
    shoreFacing: 'South-East',
    normalWaveHeight: 1.9,
    description: 'Tasman Sea surf amphitheater characterized by powerful southerly busters and coastal cold fronts.'
  }
];

/**
 * Calculates Great Circle Haversine distance between two coordinates in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Finds the nearest coastal beaches to any given latitude & longitude
 */
export function getNearestBeaches(lat, lon, maxCount = 5) {
  const beachesWithDist = COASTAL_BEACHES.map((bch) => ({
    ...bch,
    distanceKm: calculateHaversineDistance(lat, lon, bch.lat, bch.lon)
  }));

  // Sort ascending by distance
  beachesWithDist.sort((a, b) => a.distanceKm - b.distanceKm);
  return beachesWithDist.slice(0, maxCount);
}

/**
 * Calculates deterministic, physically accurate meteorological rain and surf predictions for a specific beach.
 * Combines local coastal climatology (latitude, ITCZ, onshore flow) with distance-decayed regional storm coupling.
 *
 * @param {Object} beach - Coastal beach object with lat, lon, normalWaveHeight, distanceKm
 * @param {Object|number} optionsOrStormProb - Options object { regionalRainProb, regionalStormProb, regionalRainRate, activeStorm } or legacy numeric storm probability
 * @param {Object} [legacyStorm] - Optional legacy active storm object
 * @returns {Object} Comprehensive, individualized beach rain & surf forecast
 */
export function calculateBeachRainForecast(beach, optionsOrStormProb = 35, legacyStorm = null) {
  if (!beach) return null;

  // 1. Resolve calling arguments polymorphically
  let regionalRainProb = 40;
  let regionalStormProb = 25;
  let regionalRainRate = 1.0;
  let activeStorm = null;

  if (typeof optionsOrStormProb === 'object' && optionsOrStormProb !== null) {
    regionalRainProb = optionsOrStormProb.regionalRainProb ?? optionsOrStormProb.rainProbability ?? 40;
    regionalStormProb = optionsOrStormProb.regionalStormProb ?? optionsOrStormProb.stormProbability ?? 25;
    regionalRainRate = optionsOrStormProb.regionalRainRate ?? optionsOrStormProb.rainRate ?? 1.0;
    activeStorm = optionsOrStormProb.activeStorm ?? legacyStorm;
  } else if (typeof optionsOrStormProb === 'number') {
    regionalStormProb = optionsOrStormProb;
    regionalRainProb = Math.max(optionsOrStormProb, 35);
    activeStorm = legacyStorm;
  }

  // 2. Individualized coastal base meteorology directly computed from beach coordinates
  const localMet = calculateScientificWeather(beach.lat, beach.lon);

  // 3. Spatial convective coupling: influence decays with distance from marine center
  const dist = typeof beach.distanceKm === 'number' && beach.distanceKm > 0 ? beach.distanceKm : 450;
  const proximityWeight = Math.exp(-dist / 750); // e.g. 0.48 at ~550km, 0.35 at ~780km

  // 4. Coupled Rain Probability (%): blends local coastal baseline with regional convective storm
  const coupledRainProb = Math.round(
    localMet.rainProbability * (1 - proximityWeight * 0.7) +
    regionalRainProb * (proximityWeight * 0.7)
  );
  const rainProbability = Math.max(5, Math.min(98, coupledRainProb));

  // 5. Surf wave breakers (m): beach profile modulated by open ocean swell and onshore wind
  const stormFactor = regionalStormProb / 100;
  const surfWaveHeight = parseFloat(
    (Math.max(0.6, (beach.normalWaveHeight || 1.2) * (0.85 + (localMet.waveHeight / 2.0) * 0.28 + stormFactor * 0.35))).toFixed(1)
  );

  // 6. Precipitation Rate (mm/h), 24h Total (mm), Classification, and Beach Safety Flag
  let rainRateMmH = 0;
  let total24hPrecipMm = 0;
  let rainClassification = 'Fair / Mainly Dry';
  let safetyFlag = 'Green (Safe)';

  if (rainProbability >= 75) {
    rainRateMmH = parseFloat((4.5 + (rainProbability - 75) * 0.35 + regionalRainRate * 0.35).toFixed(1));
    total24hPrecipMm = Math.round(rainRateMmH * 8 + 16);
    rainClassification = 'Torrential Squalls & Cloudbursts';
    safetyFlag = surfWaveHeight > 2.0 ? 'Red (Hazardous Swell & Gale)' : 'Yellow (Heavy Surf)';
  } else if (rainProbability >= 50) {
    rainRateMmH = parseFloat((1.4 + (rainProbability - 50) * 0.11 + regionalRainRate * 0.15).toFixed(1));
    total24hPrecipMm = Math.round(rainRateMmH * 6 + 6);
    rainClassification = 'Moderate Rain Showers';
    safetyFlag = surfWaveHeight > 1.8 ? 'Yellow (Caution: Strong Breakers)' : 'Yellow (Moderate Swell)';
  } else if (rainProbability >= 25) {
    rainRateMmH = parseFloat((0.3 + (rainProbability - 25) * 0.04).toFixed(1));
    total24hPrecipMm = Math.max(1, Math.round(rainRateMmH * 5 + 1));
    rainClassification = 'Passing Coastal Drizzle & Showers';
    safetyFlag = 'Green (Safe)';
  } else {
    rainRateMmH = 0.0;
    total24hPrecipMm = 0;
    rainClassification = 'Fair / Mainly Dry';
    safetyFlag = 'Green (Safe)';
  }

  // 7. Coastal Wind Gusts (km/h)
  const beachWindGusts = Math.round(localMet.windSpeedKmH * 0.85 + stormFactor * 22);

  // 8. 3-Day Progressive Forecast
  const threeDayForecast = [
    {
      day: 'Today',
      rainMm: total24hPrecipMm,
      prob: rainProbability,
      condition: rainProbability >= 65 ? 'Heavy Showers' : rainProbability >= 35 ? 'Passing Rain' : 'Partly Cloudy'
    },
    {
      day: 'Tomorrow',
      rainMm: Math.round(total24hPrecipMm * 0.75),
      prob: Math.max(10, Math.round(rainProbability * 0.82)),
      condition: rainProbability >= 60 ? 'Scattered Rain' : 'Clearing Skies'
    },
    {
      day: 'Day 3',
      rainMm: Math.round(total24hPrecipMm * 0.45),
      prob: Math.max(5, Math.round(rainProbability * 0.65)),
      condition: rainProbability >= 70 ? 'Passing Showers' : 'Fair Maritime Sky'
    }
  ];

  const stormName = activeStorm?.name ? ` influenced by ${activeStorm.name}` : '';
  const advisoryText = `${rainClassification} forecast across ${beach.name}${stormName}. Wave breakers estimated at ${surfWaveHeight}m with wind gusts reaching ${beachWindGusts} km/h. Beachgoers and local fishermen advised: ${safetyFlag}.`;

  return {
    beachId: beach.id,
    beachName: beach.name,
    location: `${beach.state}, ${beach.country}`,
    lat: beach.lat,
    lon: beach.lon,
    distanceKm: beach.distanceKm ?? 0,
    rainProbability,
    rainRateMmH,
    total24hPrecipMm,
    rainClassification,
    surfWaveHeight,
    beachWindGusts,
    safetyFlag,
    threeDayForecast,
    advisoryText
  };
}
