/**
 * Ocean Hydrostatic Pressure & Physical Oceanography Calculator
 * Based on UNESCO 1983 (IES 80) and TEOS-10 standard formulations
 */

/**
 * Calculates local gravitational acceleration based on latitude using the Somigliana equation (WGS-84 / UNESCO)
 * @param {number} lat - Latitude in degrees (-90 to +90)
 * @returns {number} Gravitational acceleration in m/s^2
 */
export function calculateGravity(lat) {
  const phi = (Math.abs(lat) * Math.PI) / 180;
  const sinPhi = Math.sin(phi);
  
  // Somigliana formula approximation for sea level
  // g(phi) = 9.780318 * (1 + 5.2788e-3 * sin^2(phi) - 2.36e-5 * sin^4(phi))
  const g = 9.780318 * (1 + 0.0052788 * Math.pow(sinPhi, 2) - 0.0000236 * Math.pow(sinPhi, 4));
  return parseFloat(g.toFixed(4));
}

/**
 * Calculates approximate seawater density at depth z considering compressibility, temperature, and salinity
 * @param {number} depth - Depth in meters (z >= 0)
 * @param {number} sst - Surface temperature in °C (default ~28°C)
 * @param {number} salinity - Salinity in PSU (default ~34.5)
 * @returns {number} Density in kg/m^3
 */
export function calculateSeawaterDensity(depth, sst = 28.0, salinity = 34.5) {
  // Typical surface density: ~1024 - 1027 kg/m^3 depending on SST and salinity
  const baseSurfaceDensity = 1028.1 - 0.15 * sst + 0.75 * (salinity - 35);
  // Compressibility increases density by approximately 4.4e-3 kg/m^3 per meter of depth
  const compressibilityCorrection = 0.0044 * depth;
  // Deep cold water density increase below thermocline (depth > 200m)
  const thermoclineCooling = depth > 200 ? Math.min(2.5, (depth / 1000) * 1.8) : (depth / 200) * 0.5;
  
  const density = baseSurfaceDensity + compressibilityCorrection + thermoclineCooling;
  return parseFloat(density.toFixed(2));
}

/**
 * Calculates underwater speed of sound in seawater using the Mackenzie (1981) 9-term equation
 * Valid for T: 2 to 30°C, S: 25 to 40 PSU, Depth: 0 to 8000m
 * @param {number} depth - Depth in meters
 * @param {number} temp - Seawater temperature in °C
 * @param {number} salinity - Salinity in PSU
 * @returns {number} Sound speed in m/s
 */
export function calculateSoundSpeed(depth, temp = 28.0, salinity = 34.5) {
  const D = Math.max(0, depth);
  const T = temp;
  const S = salinity;
  const c = 1448.96 + 
    4.591 * T - 
    5.304e-2 * Math.pow(T, 2) + 
    2.374e-4 * Math.pow(T, 3) + 
    1.340 * (S - 35) + 
    1.630e-2 * D + 
    1.675e-7 * Math.pow(D, 2) - 
    1.025e-2 * T * (S - 35) - 
    7.139e-13 * T * Math.pow(D, 3);
  return parseFloat(c.toFixed(1));
}

/**
 * Calculates SOFAR (Sound Fixing and Ranging) channel axis depth based on latitude
 * Sound speed reaches minimum at this depth, allowing acoustic waves to propagate thousands of km
 * @param {number} lat - Latitude in degrees
 * @returns {number} SOFAR axis depth in meters
 */
export function calculateSofarChannelDepth(lat = 15.0) {
  const absLat = Math.abs(lat);
  // Polar waters: surface SOFAR channel (~50-150m); Tropical/Equatorial: deep axis (~950-1200m)
  if (absLat >= 60) return 100;
  if (absLat >= 45) return 600;
  return Math.round(1100 - absLat * 8);
}

/**
 * Calculates complete hydrostatic pressure parameters for a given depth and latitude
 * @param {number} depth - Depth in meters (z >= 0)
 * @param {number} lat - Latitude in degrees (-90 to +90)
 * @param {number} sst - Surface temperature in °C
 * @param {number} salinity - Salinity in PSU
 * @returns {Object} Pressure measurements across all major standard scientific units
 */
export function calculateHydrostaticPressure(depth, lat = 15.0, sst = 28.0, salinity = 34.5) {
  const g = calculateGravity(lat);
  const density = calculateSeawaterDensity(depth, sst, salinity);
  const atmosphericPressurePa = 101325; // 1 standard atm in Pascals (1013.25 hPa)

  // Hydrostatic gauge pressure in Pascals: P_gauge = rho * g * depth
  const gaugePressurePa = density * g * depth;
  const totalPressurePa = atmosphericPressurePa + gaugePressurePa;

  // Oceanographic standard (UNESCO / IOC / TEOS-10):
  // CTD instrument pressure (dbar) is defined as gauge pressure (0 dbar at the sea surface).
  // 1 dbar = 10,000 Pa (~1 meter of seawater column).
  const gaugeDbar = gaugePressurePa / 10000;
  const totalDbar = totalPressurePa / 10000;
  const pressureAtm = totalPressurePa / 101325; // 1 atm = 101,325 Pa
  const pressureBar = totalPressurePa / 100000; // 1 bar = 100,000 Pa
  const pressureMpa = totalPressurePa / 1000000; // 1 MPa = 1,000,000 Pa
  const pressurePsi = totalPressurePa / 6894.757; // 1 PSI = 6894.76 Pa

  // Underwater acoustic sound speed at this depth
  const soundSpeed = calculateSoundSpeed(depth, sst, salinity);
  const sofarDepth = calculateSofarChannelDepth(lat);

  // Water column mass over 1 square meter: Mass = rho_mean * depth
  const columnMassKgPerM2 = density * depth;

  // Comparison benchmark
  let benchmark = 'Surface / Intertidal Zone';
  let benchmarkKey = 'surfaceIntertidal';
  if (depth >= 10000) {
    benchmark = 'Challenger Deep (Mariana Trench Hadal Zone)';
    benchmarkKey = 'challengerDeep';
  } else if (depth >= 6000) {
    benchmark = 'Abyssopelagic Ocean Trench';
    benchmarkKey = 'abyssalTrench';
  } else if (depth >= 4000) {
    benchmark = 'Abyssal Plain (Titanic Depth Range)';
    benchmarkKey = 'abyssalPlain';
  } else if (depth >= 2000) {
    benchmark = 'Bathypelagic Midnight Zone (Deep In-Situ Profiling Limit)';
    benchmarkKey = 'bathypelagic';
  } else if (depth >= 1000) {
    benchmark = 'Mesopelagic Twilight Zone (Argo Float Drift Parking)';
    benchmarkKey = 'mesopelagic';
  } else if (depth >= 500) {
    benchmark = 'Permanent Thermocline Base';
    benchmarkKey = 'thermoclineBase';
  } else if (depth >= 200) {
    benchmark = 'Euphotic Photic Zone Boundary';
    benchmarkKey = 'euphoticBoundary';
  } else if (depth >= 100) {
    benchmark = 'Epipelagic Photic Zone (Commercial Diving Limit)';
    benchmarkKey = 'epipelagic100';
  } else if (depth >= 50) {
    benchmark = 'Epipelagic Photic Zone (Commercial Diving Limit)';
    benchmarkKey = 'epipelagic50';
  } else if (depth > 0) {
    benchmark = 'Recreational Scuba Dive Range';
    benchmarkKey = 'scubaRange';
  }

  return {
    depth,
    lat,
    gravity: g,
    density,
    totalPa: Math.round(totalPressurePa),
    gaugePa: Math.round(gaugePressurePa),
    dbar: parseFloat(gaugeDbar.toFixed(2)),
    totalDbar: parseFloat(totalDbar.toFixed(2)),
    gaugeDbar: parseFloat(gaugeDbar.toFixed(2)),
    atm: parseFloat(pressureAtm.toFixed(2)),
    bar: parseFloat(pressureBar.toFixed(2)),
    mpa: parseFloat(pressureMpa.toFixed(3)),
    psi: parseFloat(pressurePsi.toFixed(1)),
    soundSpeed,
    sofarDepth,
    columnMassKgPerM2: Math.round(columnMassKgPerM2),
    benchmark,
    benchmarkKey
  };
}

/**
 * Standard depth profile levels in meters
 */
export const STANDARD_DEPTH_LEVELS = [0, 10, 25, 50, 100, 200, 500, 1000, 1500, 2000, 3000, 4000, 5000];

/**
 * Generates an entire water column pressure profile array for a given latitude
 * @param {number} lat - Latitude
 * @param {number} sst - Surface temperature
 * @param {number} salinity - Salinity
 * @returns {Array<Object>} Profile array across standard depth levels
 */
export function generatePressureDepthProfile(lat = 15.0, sst = 28.0, salinity = 34.5) {
  return STANDARD_DEPTH_LEVELS.map(depth => {
    return calculateHydrostaticPressure(depth, lat, sst, salinity);
  });
}
