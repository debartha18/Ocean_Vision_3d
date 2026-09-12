import { getFormattedCurrentDate } from '../utils/dateUtils.js';
import { calculateScientificWeather } from '../utils/weatherService.js';

export const REGIONS = {
  bay_of_bengal: {
    id: 'bay_of_bengal',
    name: 'Bay of Bengal',
    coords: '15.297° N, 87.860° E',
    lat: 15.297,
    lon: 87.860,
    cameraPosition: [0.1, 3.4, 4.8],
    cameraLookAt: [0, -0.35, 0.1],
    earthRotation: [Math.PI * 0.58, 0, -Math.PI * 0.12],
    sst: 29.85,
    salinity: 33.42,
    currentSpeed: 0.85,
    waveHeight: 1.65,
    chlorophyll: 1.25,
    oxygen: 6.85,
    stormProbability: 35,
    rainProbability: 42,
    rainRate: 3.2,
    pressure: 1008,
    windSpeedKmH: 26,
    activeStorm: {
      name: 'Monsoon Convective Squall Line',
      category: 'Seasonal Tropical Depression',
      windSpeed: '52 km/h (28 knots)',
      pressure: '1004 hPa',
      surge: '1.2m above normal tide',
      movement: 'North-Northeast at 14 km/h',
      rainfallForecast: 'Moderate to passing rain squalls (15-35mm/24h)'
    },
    buoys: [
      {
        id: 'RAMA-BD08',
        type: 'mooredBuoy',
        name: 'RAMA / OMNI Buoy BD08 (Central Bay)',
        lat: 15.297,
        lon: 87.860,
        x: 0.1,
        z: 0.05,
        sst: 29.85,
        salinity: 33.42,
        currentSpeed: 0.85,
        waveHeight: 1.65,
        battery: '98%',
        qcStatus: 'QC Passed',
        mooringDepth: 2850,
        lastTransmission: '10 mins ago',
        sensors: 'Seabird SBE-37 MicroCAT CTD, Gill 2D Sonic Anemometer, Rotronic Hygroclip',
        depthProfile: [
          { depth: 0, temp: 29.85, salinity: 33.42, oxygen: 6.85, chlorophyll: 1.25, velocity: 0.85, timestamp: '12:00 UTC' },
          { depth: 10, temp: 29.70, salinity: 33.55, oxygen: 6.90, chlorophyll: 1.60, velocity: 0.82, timestamp: '12:00 UTC' },
          { depth: 50, temp: 28.90, salinity: 34.20, oxygen: 6.45, chlorophyll: 2.35, velocity: 0.68, timestamp: '12:00 UTC' },
          { depth: 100, temp: 24.10, salinity: 34.85, oxygen: 3.20, chlorophyll: 0.65, velocity: 0.44, timestamp: '12:00 UTC' },
          { depth: 200, temp: 17.50, salinity: 35.10, oxygen: 1.45, chlorophyll: 0.08, velocity: 0.28, timestamp: '12:00 UTC' },
          { depth: 500, temp: 10.20, salinity: 35.05, oxygen: 2.15, chlorophyll: 0.01, velocity: 0.14, timestamp: '12:00 UTC' },
          { depth: 1000, temp: 6.80, salinity: 34.95, oxygen: 3.40, chlorophyll: 0.01, velocity: 0.08, timestamp: '12:00 UTC' },
          { depth: 2000, temp: 3.20, salinity: 34.80, oxygen: 4.10, chlorophyll: 0.00, velocity: 0.04, timestamp: '12:00 UTC' }
        ]
      },
      {
        id: 'GLIDER-SG642',
        type: 'gliderProfile',
        name: 'INCOIS Slocum Glider SG-642 (Andaman Trench)',
        lat: 13.450,
        lon: 92.400,
        x: 0.95,
        z: 0.50,
        sst: 29.70,
        salinity: 33.75,
        currentSpeed: 0.48,
        waveHeight: 1.55,
        battery: '82%',
        qcStatus: 'Active Mission (Dive #318)',
        mooringDepth: 1000,
        lastTransmission: '14 mins ago (Iridium SBD)',
        gliderTrajectory: 'Sawtooth V-Glide (18° Pitch Angle)',
        sensors: 'Seabird Glider Payload CTD, Aanderaa Optode 4330 (DO), WetLabs ECO Triplet Fluorometer',
        depthProfile: [
          { depth: 0, temp: 29.70, salinity: 33.75, oxygen: 6.95, chlorophyll: 1.15, velocity: 0.48, timestamp: '10:14 UTC' },
          { depth: 25, temp: 29.55, salinity: 33.82, oxygen: 7.10, chlorophyll: 1.85, velocity: 0.44, timestamp: '10:22 UTC' },
          { depth: 50, temp: 28.80, salinity: 34.15, oxygen: 6.80, chlorophyll: 2.45, velocity: 0.38, timestamp: '10:31 UTC' },
          { depth: 100, temp: 23.90, salinity: 34.80, oxygen: 3.40, chlorophyll: 0.85, velocity: 0.29, timestamp: '10:48 UTC' },
          { depth: 150, temp: 19.80, salinity: 35.05, oxygen: 1.95, chlorophyll: 0.12, velocity: 0.22, timestamp: '11:05 UTC' },
          { depth: 250, temp: 15.20, salinity: 35.12, oxygen: 1.45, chlorophyll: 0.02, velocity: 0.16, timestamp: '11:32 UTC' },
          { depth: 500, temp: 10.10, salinity: 35.04, oxygen: 2.10, chlorophyll: 0.01, velocity: 0.11, timestamp: '12:15 UTC' },
          { depth: 1000, temp: 6.70, salinity: 34.94, oxygen: 3.45, chlorophyll: 0.01, velocity: 0.06, timestamp: '13:05 UTC' }
        ]
      },
      {
        id: 'BGC-ARGO-2902188',
        type: 'bgcArgo',
        name: 'INCOIS BGC-Argo Profiler #2902188',
        lat: 16.800,
        lon: 88.500,
        x: 0.25,
        z: -0.35,
        sst: 29.40,
        salinity: 33.20,
        currentSpeed: 0.70,
        waveHeight: 1.60,
        battery: '91%',
        qcStatus: 'Profile Verified (Cycle 86)',
        mooringDepth: 2000,
        lastTransmission: '45 mins ago',
        sensors: 'SBE-41CP CTD, SBE-63 Optical O2, WET Labs ECO-FLBB Chl-a / Backscatter',
        depthProfile: [
          { depth: 0, temp: 29.40, salinity: 33.20, oxygen: 6.85, chlorophyll: 1.35, velocity: 0.70, timestamp: '08:45 UTC' },
          { depth: 20, temp: 29.35, salinity: 33.30, oxygen: 6.95, chlorophyll: 1.90, velocity: 0.65, timestamp: '08:55 UTC' },
          { depth: 50, temp: 28.50, salinity: 34.10, oxygen: 6.60, chlorophyll: 2.80, velocity: 0.52, timestamp: '09:12 UTC' },
          { depth: 100, temp: 24.20, salinity: 34.75, oxygen: 3.10, chlorophyll: 0.65, velocity: 0.38, timestamp: '09:35 UTC' },
          { depth: 200, temp: 17.60, salinity: 35.10, oxygen: 1.55, chlorophyll: 0.05, velocity: 0.24, timestamp: '10:15 UTC' },
          { depth: 500, temp: 10.30, salinity: 35.05, oxygen: 2.20, chlorophyll: 0.01, velocity: 0.12, timestamp: '11:10 UTC' },
          { depth: 1000, temp: 6.80, salinity: 34.95, oxygen: 3.50, chlorophyll: 0.01, velocity: 0.07, timestamp: '12:30 UTC' },
          { depth: 2000, temp: 3.25, salinity: 34.81, oxygen: 4.25, chlorophyll: 0.00, velocity: 0.04, timestamp: '14:20 UTC' }
        ]
      },
      {
        id: 'ADCP-MOOR-04',
        type: 'adcpMooring',
        name: 'Deep Current Profiler ADCP-04 (EICC Shear)',
        lat: 14.800,
        lon: 83.500,
        x: -0.75,
        z: 0.15,
        sst: 29.90,
        salinity: 33.80,
        currentSpeed: 1.35,
        waveHeight: 1.70,
        battery: '96%',
        qcStatus: 'Acoustic Beam Locked',
        mooringDepth: 1200,
        lastTransmission: '18 mins ago',
        sensors: 'Teledyne RDI 75 kHz Workhorse Long Ranger ADCP (4-beam Janus array)',
        depthProfile: [
          { depth: 20, temp: 29.80, salinity: 33.85, oxygen: 6.75, chlorophyll: 1.20, velocity: 1.35, timestamp: '11:00 UTC' },
          { depth: 50, temp: 28.70, salinity: 34.25, oxygen: 6.40, chlorophyll: 1.95, velocity: 1.22, timestamp: '11:00 UTC' },
          { depth: 100, temp: 23.80, salinity: 34.90, oxygen: 3.80, chlorophyll: 0.45, velocity: 0.98, timestamp: '11:00 UTC' },
          { depth: 200, temp: 17.20, salinity: 35.15, oxygen: 2.10, chlorophyll: 0.03, velocity: 0.65, timestamp: '11:00 UTC' },
          { depth: 400, temp: 12.40, salinity: 35.10, oxygen: 1.80, chlorophyll: 0.01, velocity: 0.42, timestamp: '11:00 UTC' },
          { depth: 600, temp: 9.20, salinity: 35.02, oxygen: 2.40, chlorophyll: 0.00, velocity: 0.28, timestamp: '11:00 UTC' },
          { depth: 800, temp: 7.50, salinity: 34.98, oxygen: 3.10, chlorophyll: 0.00, velocity: 0.18, timestamp: '11:00 UTC' },
          { depth: 1000, temp: 6.60, salinity: 34.94, oxygen: 3.65, chlorophyll: 0.00, velocity: 0.11, timestamp: '11:00 UTC' }
        ]
      },
      {
        id: 'OMNI-BD10',
        type: 'mooredBuoy',
        name: 'OMNI Buoy BD10 (North Bay)',
        lat: 18.250,
        lon: 89.650,
        x: 0.45,
        z: -0.65,
        sst: 28.40,
        salinity: 31.10,
        currentSpeed: 1.15,
        waveHeight: 1.40,
        battery: '94%',
        qcStatus: 'QC Passed',
        mooringDepth: 2200,
        lastTransmission: '25 mins ago',
        sensors: 'Aanderaa SEAGUARD CTD & Current Sensor',
        depthProfile: [
          { depth: 0, temp: 28.40, salinity: 31.10, oxygen: 6.70, chlorophyll: 1.45, velocity: 1.15, timestamp: '11:45 UTC' },
          { depth: 10, temp: 28.30, salinity: 31.40, oxygen: 6.75, chlorophyll: 1.70, velocity: 1.10, timestamp: '11:45 UTC' },
          { depth: 50, temp: 27.50, salinity: 33.80, oxygen: 6.30, chlorophyll: 2.10, velocity: 0.90, timestamp: '11:45 UTC' },
          { depth: 100, temp: 23.20, salinity: 34.70, oxygen: 3.30, chlorophyll: 0.55, velocity: 0.62, timestamp: '11:45 UTC' },
          { depth: 200, temp: 16.80, salinity: 35.00, oxygen: 1.40, chlorophyll: 0.05, velocity: 0.35, timestamp: '11:45 UTC' },
          { depth: 500, temp: 9.80, salinity: 35.02, oxygen: 2.05, chlorophyll: 0.01, velocity: 0.16, timestamp: '11:45 UTC' },
          { depth: 1000, temp: 6.40, salinity: 34.92, oxygen: 3.35, chlorophyll: 0.00, velocity: 0.09, timestamp: '11:45 UTC' }
        ]
      },
      {
        id: 'RAMA-BD12',
        type: 'mooredBuoy',
        name: 'RAMA Moored Buoy BD12 (South-West)',
        lat: 11.500,
        lon: 86.200,
        x: -0.55,
        z: 0.70,
        sst: 30.20,
        salinity: 34.15,
        currentSpeed: 0.72,
        waveHeight: 1.85,
        battery: '99%',
        qcStatus: 'QC Passed',
        mooringDepth: 3400,
        lastTransmission: '5 mins ago',
        sensors: 'Seabird SBE-37 MicroCAT CTD',
        depthProfile: [
          { depth: 0, temp: 30.20, salinity: 34.15, oxygen: 6.90, chlorophyll: 0.95, velocity: 0.72, timestamp: '12:10 UTC' },
          { depth: 50, temp: 29.30, salinity: 34.60, oxygen: 6.70, chlorophyll: 1.95, velocity: 0.58, timestamp: '12:10 UTC' },
          { depth: 100, temp: 25.40, salinity: 35.00, oxygen: 3.80, chlorophyll: 0.40, velocity: 0.38, timestamp: '12:10 UTC' },
          { depth: 500, temp: 11.00, salinity: 35.08, oxygen: 2.25, chlorophyll: 0.01, velocity: 0.12, timestamp: '12:10 UTC' }
        ]
      },
      {
        id: 'ARGO-2902184',
        type: 'argoFloat',
        name: 'INCOIS Argo Profiling Float #2902184',
        lat: 14.100,
        lon: 91.800,
        x: 0.85,
        z: 0.35,
        sst: 29.50,
        salinity: 33.90,
        currentSpeed: 0.65,
        waveHeight: 1.50,
        battery: '88%',
        qcStatus: 'Profile Completed (Cycle 142)',
        mooringDepth: 2000,
        lastTransmission: '2 hours ago',
        sensors: 'Seabird SBE-41CTD profiling package',
        depthProfile: [
          { depth: 0, temp: 29.50, salinity: 33.90, oxygen: 6.80, chlorophyll: 1.10, velocity: 0.65, timestamp: '06:30 UTC' },
          { depth: 10, temp: 29.40, salinity: 33.95, oxygen: 6.85, chlorophyll: 1.40, velocity: 0.62, timestamp: '06:35 UTC' },
          { depth: 50, temp: 28.70, salinity: 34.30, oxygen: 6.50, chlorophyll: 2.20, velocity: 0.50, timestamp: '06:50 UTC' },
          { depth: 100, temp: 24.50, salinity: 34.90, oxygen: 3.35, chlorophyll: 0.50, velocity: 0.35, timestamp: '07:15 UTC' },
          { depth: 200, temp: 18.00, salinity: 35.15, oxygen: 1.60, chlorophyll: 0.06, velocity: 0.22, timestamp: '07:50 UTC' },
          { depth: 500, temp: 10.50, salinity: 35.05, oxygen: 2.10, chlorophyll: 0.01, velocity: 0.12, timestamp: '08:45 UTC' },
          { depth: 1000, temp: 6.90, salinity: 34.96, oxygen: 3.45, chlorophyll: 0.01, velocity: 0.07, timestamp: '09:50 UTC' },
          { depth: 2000, temp: 3.30, salinity: 34.82, oxygen: 4.15, chlorophyll: 0.00, velocity: 0.04, timestamp: '11:20 UTC' }
        ]
      }
    ]
  },
  arabian_sea: {
    id: 'arabian_sea',
    name: 'Arabian Sea',
    coords: '18.420° N, 66.850° E',
    lat: 18.420,
    lon: 66.850,
    cameraPosition: [-0.6, 3.4, 4.8],
    cameraLookAt: [-0.2, -0.35, 0.1],
    earthRotation: [Math.PI * 0.58, 0, Math.PI * 0.15],
    sst: 28.90,
    salinity: 36.40,
    currentSpeed: 1.25,
    waveHeight: 1.85,
    chlorophyll: 1.85,
    oxygen: 6.40,
    stormProbability: 25,
    rainProbability: 20,
    rainRate: 0.8,
    pressure: 1012,
    windSpeedKmH: 22,
    activeStorm: {
      name: 'Southwest Arabian Sea Swell',
      category: 'Nominal Marine Flow',
      windSpeed: '42 km/h (23 knots)',
      pressure: '1010 hPa',
      surge: '0.8m above normal tide',
      movement: 'West-Northwest at 18 km/h',
      rainfallForecast: 'Passing light showers along shipping corridors'
    },
    buoys: [
      {
        id: 'RAMA-AD02',
        type: 'mooredBuoy',
        name: 'RAMA Moored Buoy AD02 (North Arabian Sea)',
        lat: 18.420,
        lon: 66.850,
        x: -0.2,
        z: -0.1,
        sst: 28.90,
        salinity: 36.40,
        currentSpeed: 1.25,
        waveHeight: 2.45,
        battery: '96%',
        qcStatus: 'QC Passed',
        mooringDepth: 3100,
        lastTransmission: '14 mins ago',
        depthProfile: [
          { depth: 0, temp: 28.90, salinity: 36.40 },
          { depth: 10, temp: 28.80, salinity: 36.45 },
          { depth: 50, temp: 27.10, salinity: 36.80 },
          { depth: 100, temp: 22.80, salinity: 36.50 },
          { depth: 500, temp: 11.20, salinity: 35.60 }
        ]
      },
      {
        id: 'OMNI-AD04',
        type: 'mooredBuoy',
        name: 'OMNI Buoy AD04 (Central Arabian Sea)',
        lat: 15.000,
        lon: 69.000,
        x: 0.3,
        z: 0.4,
        sst: 29.30,
        salinity: 36.15,
        currentSpeed: 0.95,
        waveHeight: 2.10,
        battery: '92%',
        qcStatus: 'QC Passed',
        mooringDepth: 3600,
        lastTransmission: '30 mins ago',
        depthProfile: [
          { depth: 0, temp: 29.30, salinity: 36.15 },
          { depth: 50, temp: 28.20, salinity: 36.50 },
          { depth: 100, temp: 23.50, salinity: 36.20 }
        ]
      }
    ]
  },
  south_china_sea: {
    id: 'south_china_sea',
    name: 'South China Sea',
    coords: '14.500° N, 114.200° E',
    lat: 14.500,
    lon: 114.200,
    cameraPosition: [0.8, 3.4, 4.6],
    cameraLookAt: [0.3, -0.35, 0.1],
    earthRotation: [Math.PI * 0.58, 0, -Math.PI * 0.35],
    sst: 30.40,
    salinity: 34.10,
    currentSpeed: 1.10,
    waveHeight: 2.10,
    chlorophyll: 0.95,
    oxygen: 6.70,
    stormProbability: 40,
    rainProbability: 52,
    rainRate: 4.2,
    pressure: 1006,
    windSpeedKmH: 34,
    activeStorm: {
      name: 'South China Sea Monsoon Trough',
      category: 'Tropical Convective Depression',
      windSpeed: '65 km/h (35 knots)',
      pressure: '1002 hPa',
      surge: '1.4m wave swell',
      movement: 'West-Northwest at 22 km/h',
      rainfallForecast: 'Intermittent tropical showers (25-50mm/24h) along Hainan/Vietnam'
    },
    buoys: [
      {
        id: 'SCS-BUOY-01',
        type: 'mooredBuoy',
        name: 'South China Sea Deep Basin Station #01',
        lat: 14.500,
        lon: 114.200,
        x: 0.2,
        z: 0.1,
        sst: 30.40,
        salinity: 34.10,
        currentSpeed: 1.10,
        waveHeight: 2.10,
        battery: '95%',
        qcStatus: 'QC Passed',
        mooringDepth: 4200,
        lastTransmission: '8 mins ago',
        depthProfile: [
          { depth: 0, temp: 30.40, salinity: 34.10 },
          { depth: 50, temp: 29.80, salinity: 34.40 },
          { depth: 100, temp: 25.10, salinity: 34.80 }
        ]
      }
    ]
  },
  gulf_of_mexico: {
    id: 'gulf_of_mexico',
    name: 'Gulf of Mexico',
    coords: '25.000° N, 90.000° W',
    lat: 25.000,
    lon: -90.000,
    cameraPosition: [-0.4, 3.5, 4.7],
    cameraLookAt: [-0.1, -0.35, 0.1],
    earthRotation: [Math.PI * 0.58, 0, Math.PI * 0.85],
    sst: 31.10,
    salinity: 36.20,
    currentSpeed: 1.40,
    waveHeight: 1.45,
    chlorophyll: 1.45,
    oxygen: 6.60,
    stormProbability: 28,
    rainProbability: 32,
    rainRate: 1.8,
    pressure: 1012,
    windSpeedKmH: 24,
    activeStorm: {
      name: 'Loop Current Convective Cluster',
      category: 'Nominal Tropical Marine',
      windSpeed: '45 km/h (24 knots)',
      pressure: '1010 hPa',
      surge: '0.9m normal swell',
      movement: 'Northwest at 20 km/h',
      rainfallForecast: 'Isolated maritime showers (5-15mm/24h)'
    },
    buoys: [
      {
        id: 'NOAA-42001',
        type: 'mooredBuoy',
        name: 'NOAA NDBC Moored Buoy 42001 (Central Gulf)',
        lat: 25.000,
        lon: -90.000,
        x: 0.1,
        z: -0.1,
        sst: 31.10,
        salinity: 36.20,
        currentSpeed: 1.40,
        waveHeight: 1.45,
        battery: '99%',
        qcStatus: 'QC Passed',
        mooringDepth: 3250,
        lastTransmission: '12 mins ago',
        depthProfile: [
          { depth: 0, temp: 31.10, salinity: 36.20 },
          { depth: 50, temp: 30.10, salinity: 36.50 },
          { depth: 100, temp: 26.20, salinity: 36.70 }
        ]
      }
    ]
  },
  north_atlantic: {
    id: 'north_atlantic',
    name: 'North Atlantic Ocean',
    coords: '38.000° N, 42.000° W',
    lat: 38.000,
    lon: -42.000,
    cameraPosition: [0.0, 3.5, 4.8],
    cameraLookAt: [0.0, -0.35, 0.1],
    earthRotation: [Math.PI * 0.52, 0, Math.PI * 0.65],
    sst: 22.40,
    salinity: 35.80,
    currentSpeed: 1.65,
    waveHeight: 2.60,
    chlorophyll: 0.75,
    oxygen: 7.20,
    stormProbability: 32,
    rainProbability: 48,
    rainRate: 2.9,
    pressure: 1010,
    windSpeedKmH: 38,
    activeStorm: {
      name: 'North Atlantic Frontal System',
      category: 'Extratropical Wave',
      windSpeed: '65 km/h (35 knots)',
      pressure: '1004 hPa',
      surge: '1.8m wave swell',
      movement: 'East-Northeast at 35 km/h',
      rainfallForecast: 'Frontal sea spray and passing rain bands (15-30mm/24h)'
    },
    buoys: [
      {
        id: 'PIRATA-41040',
        type: 'mooredBuoy',
        name: 'PIRATA / NDBC Ocean Buoy 41040',
        lat: 38.000,
        lon: -42.000,
        x: 0.0,
        z: 0.0,
        sst: 22.40,
        salinity: 35.80,
        currentSpeed: 1.65,
        waveHeight: 2.60,
        battery: '97%',
        qcStatus: 'QC Passed',
        mooringDepth: 4800,
        lastTransmission: '20 mins ago',
        depthProfile: [
          { depth: 0, temp: 22.40, salinity: 35.80 },
          { depth: 100, temp: 18.20, salinity: 35.90 },
          { depth: 500, temp: 12.10, salinity: 35.50 }
        ]
      }
    ]
  },
  equatorial_pacific: {
    id: 'equatorial_pacific',
    name: 'Equatorial Pacific (Niño 3.4 Basin)',
    coords: '0.000° N, 140.000° W',
    lat: 0.000,
    lon: -140.000,
    cameraPosition: [0.0, 3.4, 4.8],
    cameraLookAt: [0.0, -0.35, 0.1],
    earthRotation: [Math.PI * 0.50, 0, -Math.PI * 0.85],
    sst: 30.60,
    salinity: 34.80,
    currentSpeed: 1.35,
    waveHeight: 1.60,
    chlorophyll: 0.45,
    oxygen: 6.90,
    stormProbability: 24,
    rainProbability: 35,
    rainRate: 1.9,
    pressure: 1011,
    windSpeedKmH: 26,
    activeStorm: {
      name: 'Equatorial Kelvin Wave Surge',
      category: 'ENSO Thermal Wave Surge',
      windSpeed: '48 km/h Westerly Breeze',
      pressure: '1008 hPa',
      surge: '1.2m Kelvin pulse',
      movement: 'Eastward at 2.8 m/s (Wave Phase Speed)',
      rainfallForecast: 'Scattered equatorial convective clusters (10-25mm/24h)'
    },
    buoys: [
      {
        id: 'TAO-165E',
        type: 'mooredBuoy',
        name: 'TAO Array #51011 (Western Warm Pool)',
        lat: 0.000,
        lon: 165.000,
        x: -0.55,
        z: 0.05,
        sst: 30.80,
        salinity: 34.50,
        currentSpeed: 1.20,
        waveHeight: 1.60,
        battery: '99%',
        qcStatus: 'QC Passed',
        mooringDepth: 4500,
        lastTransmission: '8 mins ago',
        depthProfile: [
          { depth: 0, temp: 30.80, salinity: 34.50 },
          { depth: 50, temp: 30.20, salinity: 34.70 },
          { depth: 100, temp: 28.50, salinity: 35.10 },
          { depth: 150, temp: 24.20, salinity: 35.30 },
          { depth: 300, temp: 14.80, salinity: 34.90 }
        ]
      },
      {
        id: 'TAO-140W',
        type: 'mooredBuoy',
        name: 'TAO Array #51015 (Niño 3.4 Core)',
        lat: 0.000,
        lon: -140.000,
        x: 0.05,
        z: -0.05,
        sst: 30.20,
        salinity: 35.10,
        currentSpeed: 1.45,
        waveHeight: 1.85,
        battery: '98%',
        qcStatus: 'QC Passed',
        mooringDepth: 4400,
        lastTransmission: '14 mins ago',
        depthProfile: [
          { depth: 0, temp: 30.20, salinity: 35.10 },
          { depth: 50, temp: 29.40, salinity: 35.20 },
          { depth: 100, temp: 25.10, salinity: 35.40 },
          { depth: 150, temp: 19.80, salinity: 35.20 }
        ]
      },
      {
        id: 'TAO-110W',
        type: 'mooredBuoy',
        name: 'TAO Array #51020 (Eastern Upwelling Zone)',
        lat: 0.000,
        lon: -110.000,
        x: 0.65,
        z: 0.10,
        sst: 29.40,
        salinity: 35.30,
        currentSpeed: 1.10,
        waveHeight: 1.70,
        battery: '96%',
        qcStatus: 'QC Passed',
        mooringDepth: 4100,
        lastTransmission: '22 mins ago',
        depthProfile: [
          { depth: 0, temp: 29.40, salinity: 35.30 },
          { depth: 50, temp: 26.80, salinity: 35.40 },
          { depth: 100, temp: 21.00, salinity: 35.20 }
        ]
      }
    ]
  }
};

export const ENSO_METRICS = {
  normal: {
    id: 'normal',
    label: 'Neutral (Normal)',
    oniIndex: '+0.15°C',
    oniCategory: 'ENSO Neutral',
    soi: '+2.1',
    tradeWinds: 'Standard Easterlies (Westward)',
    tradeWindDirection: 'westward',
    thermoclineTilt: 'Normal Tilt (Deep West, Shallow East)',
    upwelling: 'Active Humboldt Upwelling',
    warmPoolLocation: 'Western Pacific (Indo-Pacific Warm Pool)',
    sstAnomaly: 0.0,
    surfaceTempDesc: 'Normal temperature gradient: ~30°C West, ~24°C East',
    impactDesc: 'Walker circulation cell intact. Typical seasonal monsoons in South Asia and standard hurricane activity.',
    arrowSymbol: '← ← ←',
    color: '#00f0ff',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  },
  elnino: {
    id: 'elnino',
    label: 'El Niño Active',
    oniIndex: '+1.85°C',
    oniCategory: 'Strong Warm Phase',
    soi: '-14.8',
    tradeWinds: 'Weakened / Reversed (Westerly Burst)',
    tradeWindDirection: 'eastward',
    thermoclineTilt: 'Depressed Eastward / Flattened',
    upwelling: 'Suppressed / Blocked',
    warmPoolLocation: 'Sloshing Eastward towards South America',
    sstAnomaly: +2.1,
    surfaceTempDesc: 'Severe warming across Central & Eastern Pacific (+2.1°C anomaly)',
    impactDesc: 'Trade winds collapse. Deep warm pool surges east (Kelvin wave). Drought in Indonesia/Australia, torrential floods in Peru, altered jet stream.',
    arrowSymbol: '→ → →',
    color: '#ef4444',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40'
  },
  lanina: {
    id: 'lanina',
    label: 'La Niña Active',
    oniIndex: '-1.65°C',
    oniCategory: 'Strong Cool Phase',
    soi: '+16.4',
    tradeWinds: 'Intensified Easterlies (Fast Westward)',
    tradeWindDirection: 'westward-fast',
    thermoclineTilt: 'Steep Slope (Extreme Shallow East)',
    upwelling: 'Hyper-Active Cold Nutrient Plume',
    warmPoolLocation: 'Concentrated Far West (Coral Sea / Indonesia)',
    sstAnomaly: -1.8,
    surfaceTempDesc: 'Intense cold tongue in Central & Eastern Pacific (-1.8°C anomaly)',
    impactDesc: 'Supercharged trade winds push warm water far west. Heavy monsoon rains in South Asia/Australia, dry conditions in US Southwest, cold nutrient surge.',
    arrowSymbol: '⇚ ⇚ ⇚',
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  }
};

export const PARAMETERS = {
  sst: {
    id: 'sst',
    name: 'Sea Surface Temperature',
    unit: '°C',
    min: 20,
    max: 32,
    ticks: [20, 23, 26, 29, 32],
    colorScale: ['#001f3f', '#0074D9', '#00d2be', '#2ECC40', '#FFDC00', '#FF851B', '#FF4136'],
    gradientCss: 'linear-gradient(to right, #001f3f, #0074D9, #00d2be, #2ECC40, #FFDC00, #FF851B, #FF4136)',
    icon: 'Thermometer',
    description: 'Upper ocean thermal state driving atmospheric convection & cyclone genesis.'
  },
  salinity: {
    id: 'salinity',
    name: 'Salinity',
    unit: 'PSU',
    min: 30,
    max: 37,
    ticks: [30, 31.8, 33.5, 35.2, 37],
    colorScale: ['#051e3e', '#0f4c81', '#1b98e0', '#56cbf9', '#00ffc8'],
    gradientCss: 'linear-gradient(to right, #051e3e, #0f4c81, #1b98e0, #56cbf9, #00ffc8)',
    icon: 'Droplets',
    description: 'Practical Salinity Units influenced by river discharge, precipitation & evaporation.'
  },
  currents: {
    id: 'currents',
    name: 'Ocean Currents',
    unit: 'm/s',
    min: 0.0,
    max: 2.2,
    ticks: [0.0, 0.5, 1.0, 1.5, 2.2],
    colorScale: ['#0a1128', '#034078', '#1282a2', '#00f0ff', '#ffffff'],
    gradientCss: 'linear-gradient(to right, #0a1128, #034078, #1282a2, #00f0ff, #ffffff)',
    icon: 'Wind',
    description: 'Geostrophic boundary currents and mesoscale cyclonic/anticyclonic eddy velocity.'
  },
  wave: {
    id: 'wave',
    name: 'Wave Height',
    unit: 'm',
    min: 0.5,
    max: 5.5,
    ticks: [0.5, 1.5, 2.5, 3.5, 5.5],
    colorScale: ['#1e1b4b', '#4338ca', '#8b5cf6', '#ec4899', '#f43f5e'],
    gradientCss: 'linear-gradient(to right, #1e1b4b, #4338ca, #8b5cf6, #ec4899, #f43f5e)',
    icon: 'Activity',
    description: 'Significant wave height (Hs) generated by seasonal wind swells and storm surges.'
  },
  chlorophyll: {
    id: 'chlorophyll',
    name: 'Chlorophyll-a',
    unit: 'mg/m³',
    min: 0.05,
    max: 4.5,
    ticks: [0.05, 0.5, 1.5, 3.0, 4.5],
    colorScale: ['#022c22', '#065f46', '#059669', '#10b981', '#a3e635', '#fef08a'],
    gradientCss: 'linear-gradient(to right, #022c22, #065f46, #059669, #10b981, #a3e635, #fef08a)',
    icon: 'Flower2',
    description: 'Phytoplankton biomass indicator and primary marine biological productivity.'
  },
  oxygen: {
    id: 'oxygen',
    name: 'Dissolved Oxygen',
    unit: 'mg/L',
    min: 1.5,
    max: 8.0,
    ticks: [1.5, 3.0, 4.5, 6.0, 8.0],
    colorScale: ['#4a044e', '#701a75', '#0284c7', '#06b6d4', '#67e8f9'],
    gradientCss: 'linear-gradient(to right, #4a044e, #701a75, #0284c7, #06b6d4, #67e8f9)',
    icon: 'Sparkles',
    description: 'Oxygen minimum zones (OMZ) at 100-500m depth critical for marine life ecosystems.'
  }
};

export const DEPTH_LEVELS = [0, 10, 50, 100, 200, 500, 1000, 2000, 4000, 6000];

export const VIEW_MODES = [
  { id: 'surface', label: 'Surface', icon: 'Layers' },
  { id: 'depth_slice', label: 'Depth Slice', icon: 'Box' },
  { id: 'volume', label: 'Volume', icon: 'Boxes' },
  { id: 'isosurface', label: 'Isosurface', icon: 'Maximize2' },
  { id: 'vector_field', label: 'Vector Field', icon: 'Compass' }
];

export const IN_SITU_SUMMARY = {
  driftingBuoy: { count: 12, label: 'Drifting Buoy', color: '#facc15', bg: 'bg-yellow-400' },
  mooredBuoy: { count: 8, label: 'Moored Buoy', color: '#4ade80', bg: 'bg-green-400' },
  argoFloat: { count: 24, label: 'Core Argo Float', color: '#38bdf8', bg: 'bg-sky-400' },
  bgcArgo: { count: 14, label: 'BGC-Argo Profiler', color: '#a855f7', bg: 'bg-purple-400' },
  gliderProfile: { count: 6, label: 'Underwater Glider', color: '#06b6d4', bg: 'bg-cyan-400' },
  adcpMooring: { count: 9, label: 'ADCP Current Mooring', color: '#f97316', bg: 'bg-orange-400' },
  tideGauge: { count: 5, label: 'Tide Gauge', color: '#ec4899', bg: 'bg-pink-400' }
};

export const BUOY_MARKERS = REGIONS.bay_of_bengal.buoys;

export function getDynamicValidationTimeSeries(baseDate = new Date(), baseSst = 29.5) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const series = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateLabel = `${d.getDate()} ${months[d.getMonth()]}`;
    const dayVar = Math.sin((d.getDate() + i) * 1.2) * 0.45;
    const model = parseFloat((baseSst + dayVar).toFixed(1));
    const observed = parseFloat((model + (Math.sin(i * 2.1) * 0.22 - 0.08)).toFixed(1));
    series.push({ time: dateLabel, model, observed });
  }
  return series;
}

export const VALIDATION_TIME_SERIES = getDynamicValidationTimeSeries();

/**
 * Scientifically computes oceanographic parameter value at any depth (0 - 6000m)
 * matching empirical CTD profiles (thermocline, halocline, oxygen minimum zones)
 */
export function calculateParameterAtDepth(paramId, depthMeters, region) {
  if (region == null) return 0;
  const z = Math.max(0, depthMeters);

  // Polymorphic helper: safely extract base surface parameter whether region is an object or a direct number
  const getSurfaceVal = (key, fallback) => {
    if (typeof region === 'number') return region;
    if (typeof region === 'object' && region !== null) {
      return region[key] ?? fallback;
    }
    return fallback;
  };

  switch (paramId) {
    case 'sst': {
      // Thermocline Profile:
      // Epipelagic mixed layer (0 - 35m): nearly isothermal
      // Main Thermocline (35 - 500m): exponential thermal gradient down to ~8-11°C
      // Bathypelagic & Abyssal (500 - 6000m): asymptotically approaches ~2.0°C deep water
      const surfaceSst = getSurfaceVal('sst', 29.5);
      const deepTemp = 2.0;
      if (z <= 35) return parseFloat(surfaceSst.toFixed(2));
      // Continuous physically grounded thermocline curve
      const decay = Math.exp(-(z - 35) / 280);
      const temp = deepTemp + (surfaceSst - deepTemp) * decay;
      return parseFloat(Math.max(1.8, temp).toFixed(2));
    }
    case 'salinity': {
      // Halocline Profile:
      // Surface salinity transitions towards universal deep ocean salinity (~34.85 PSU)
      const surfaceSal = getSurfaceVal('salinity', 34.0);
      if (z <= 30) return parseFloat(surfaceSal.toFixed(2));
      const deepSal = 34.85;
      const decay = Math.exp(-(z - 30) / 220);
      const sal = deepSal + (surfaceSal - deepSal) * decay;
      return parseFloat(sal.toFixed(2));
    }
    case 'currents': {
      // Current velocity decay with depth (Ekman spiral / geostrophic shear)
      const surfaceV = getSurfaceVal('currentSpeed', 0.85);
      const v = 0.04 + (surfaceV - 0.04) * Math.exp(-z / 160);
      return parseFloat(v.toFixed(2));
    }
    case 'wave': {
      // Wave orbital motion decay with depth: A(z) = H * exp(-2*pi*z / L)
      const surfaceH = getSurfaceVal('waveHeight', 1.65);
      if (z === 0) return parseFloat(surfaceH.toFixed(2));
      const waveSub = surfaceH * Math.exp(-z / 22);
      return parseFloat(waveSub.toFixed(2));
    }
    case 'chlorophyll': {
      // Photic zone bio-optics: Deep Chlorophyll Maximum (DCM at 35-55m), decays to ~0 below 160m
      const surfaceChl = getSurfaceVal('chlorophyll', 1.15);
      if (z > 160) return 0.01;
      const bg = surfaceChl * Math.exp(-z / 80);
      const dcmPeak = surfaceChl * 0.65 * Math.exp(-Math.pow(z - 45, 2) / 800);
      return parseFloat(Math.max(0.01, bg + dcmPeak).toFixed(2));
    }
    case 'oxygen': {
      // Dissolved Oxygen:
      // Epipelagic (0 - 45m): High surface saturation (~6.5 - 7.2 mg/L)
      // Mesopelagic (150 - 450m): Oxygen Minimum Zone (OMZ ~1.6 - 2.2 mg/L) due to sinking particulate remineralization
      // Bathypelagic (>1000m): Deep recovery (~3.8 - 4.2 mg/L) from cold polar deep-water mass ventilation
      const surfaceO2 = getSurfaceVal('oxygen', 6.8);
      if (z <= 45) return parseFloat(surfaceO2.toFixed(2));
      if (z <= 300) {
        const omzO2 = Math.min(2.1, surfaceO2 * 0.32);
        const progress = (z - 45) / 255;
        return parseFloat((surfaceO2 - (surfaceO2 - omzO2) * progress).toFixed(2));
      }
      if (z <= 1200) {
        const progress = (z - 300) / 900;
        return parseFloat((2.1 + progress * 1.9).toFixed(2));
      }
      return 4.15;
    }
    default:
      return 0;
  }
}

export const VALIDATION_METRICS = {
  parameter: 'Sea Surface Temperature',
  rmse: '0.78 °C',
  bias: '0.35 °C',
  correlation: '0.91',
  sampleCount: 1420
};

export const AI_ANOMALY = {
  title: 'Anomaly Detected',
  headline: 'Temperature is significantly higher than model prediction at 50m depth in this region.',
  confidence: '94.2%',
  detectedAt: `${getFormattedCurrentDate()} 11:30 UTC`,
  location: 'Central Bay of Bengal (15.297° N, 87.860° E)',
  depthRange: '45m – 110m',
  deviation: '+2.45 °C above ROMS/HYCOM baseline',
  anomalyType: 'Subsurface Marine Heatwave & Barrier Layer Thickening',
  details: 'A pronounced subsurface thermal anomaly of +2.45°C detected by RAMA-BD08 and confirmed across Argo float #2902184. High Gangetic freshwater cap creates strong halocline stratification, trapping solar insolation in the barrier layer and accelerating localized cyclone intensification potential.'
};

export const MARINE_NEWS_BULLETINS = [
  {
    id: 'NW-01',
    time: '30 mins ago',
    source: 'IMD Marine Met Centre',
    severity: 'critical',
    title: 'Gale Wind & Storm Surge Warning: Cyclone / Squall Alert',
    content: 'Squally wind speed reaching 110-130 kmph gusting to 145 kmph very likely over active storm sector. Sea condition will be phenomenal. Marine vessels advised extreme caution.'
  },
  {
    id: 'NW-02',
    time: '2 hours ago',
    source: 'Joint Typhoon Warning Center (JTWC)',
    severity: 'warning',
    title: 'Tropical Cyclone Genesis Potential: Elevated Probability within 24 Hours',
    content: 'High Ocean Heat Content (OHC) exceeding 115 kJ/cm² and low vertical wind shear provide hyper-favorable environmental conditions for rapid intensification.'
  },
  {
    id: 'NW-03',
    time: '4 hours ago',
    source: 'INCOIS Ocean State Forecast',
    severity: 'info',
    title: 'High Wave & Coastal Swell Warning',
    content: 'High waves in the range of 3.5 to 5.2 meters forecasted along active coastal zones during high tide cycles.'
  },
  {
    id: 'NW-04',
    time: '6 hours ago',
    source: 'NOAA Global Ocean Observing System',
    severity: 'info',
    title: 'Global Moored Buoy & Argo Fleet Telemetry Synchronized',
    content: 'Deep-ocean moorings and profiling floats reporting continuous CTD casts down to 2000m depth with 99.4% QC data completeness.'
  }
];

export function createLocationData(lat, lon, customName = null, dateStr = null) {
  const effectiveDate = dateStr || getFormattedCurrentDate();
  const absLat = Math.abs(lat);
  // Realistic SST based on latitude and seasonal cycle
  const baseSst = Math.max(1.5, Math.min(31.5, 30.5 - Math.pow(absLat / 65, 1.7) * 26));
  const salinity = 33.0 + Math.sin(absLat * 0.1) * 3.5;
  const currentSpeed = 0.5 + Math.abs(Math.sin(lat * 0.2 + lon * 0.1)) * 1.2;
  const chlorophyll = parseFloat((0.35 + Math.sin(absLat * 0.12) * 1.2).toFixed(2));
  const oxygen = parseFloat((6.2 + Math.cos(absLat * 0.08) * 1.0).toFixed(2));
  
  // Scientific meteorological model for accurate rain, storm, and wave prediction
  const weather = calculateScientificWeather(lat, lon, new Date(), baseSst);

  const formattedCoords = `${absLat.toFixed(3)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(3)}° ${lon >= 0 ? 'E' : 'W'}`;
  const displayName = customName || `Station (${absLat.toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'})`;

  return {
    id: `coord_${lat.toFixed(2)}_${lon.toFixed(2)}`,
    name: displayName,
    coords: formattedCoords,
    lat,
    lon,
    cameraPosition: [0, 3.4, 4.8],
    cameraLookAt: [0, -0.35, 0.1],
    earthRotation: [Math.PI * 0.58, 0, (lon / 180) * Math.PI],
    sst: parseFloat(baseSst.toFixed(2)),
    salinity: parseFloat(salinity.toFixed(2)),
    currentSpeed: parseFloat(currentSpeed.toFixed(2)),
    waveHeight: weather.waveHeight,
    chlorophyll,
    oxygen,
    stormProbability: weather.stormProbability,
    rainProbability: weather.rainProbability,
    rainRate: weather.rainRate,
    pressure: weather.pressure,
    windSpeedKmH: weather.windSpeedKmH,
    isLive: false,
    date: effectiveDate,
    activeStorm: {
      name: weather.stormName,
      category: weather.stormCategory,
      windSpeed: `${weather.windSpeedKmH} km/h`,
      pressure: `${weather.pressure} hPa`,
      surge: `${(0.4 + (weather.stormProbability / 100) * 1.5).toFixed(1)}m above normal tide`,
      movement: 'Northwest at 16 km/h',
      rainfallForecast: `Precipitation probability: ${weather.rainProbability}% | Rate: ${weather.rainRate} mm/h (${weather.weatherLabel})`
    },
    buoys: [
      {
        id: `BUOY-${Math.abs(Math.round(lat))}${Math.abs(Math.round(lon))}`,
        type: 'mooredBuoy',
        name: `Deep Ocean Station (${formattedCoords})`,
        lat,
        lon,
        x: 0.1,
        z: 0.0,
        sst: parseFloat(baseSst.toFixed(2)),
        salinity: parseFloat(salinity.toFixed(2)),
        currentSpeed: parseFloat(currentSpeed.toFixed(2)),
        waveHeight: parseFloat(weather.waveHeight),
        battery: '98%',
        qcStatus: 'Real-time Synchronized',
        mooringDepth: Math.round(2500 + Math.abs(Math.sin(lat)) * 2000),
        lastTransmission: '3 mins ago',
        depthProfile: [
          { depth: 0, temp: parseFloat(baseSst.toFixed(2)), salinity: parseFloat(salinity.toFixed(2)) },
          { depth: 50, temp: parseFloat((baseSst - 0.9).toFixed(2)), salinity: parseFloat((salinity + 0.3).toFixed(2)) },
          { depth: 100, temp: parseFloat((baseSst - 4.5).toFixed(2)), salinity: parseFloat((salinity + 0.6).toFixed(2)) },
          { depth: 500, temp: parseFloat((baseSst - 17.0).toFixed(2)), salinity: parseFloat((salinity + 0.4).toFixed(2)) }
        ]
      }
    ]
  };
}

