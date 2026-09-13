import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  CloudRain, 
  Compass,
  Umbrella,
  Layers,
  Plus,
  Minus
} from 'lucide-react';
import { REGIONS, createLocationData } from '../../data/oceanData';
import { COASTAL_BEACHES, calculateBeachRainForecast } from '../../data/beachData';
import { calculateHydrostaticPressure } from '../../utils/pressureCalculator';

export default function WorldMapView({ 
  activeRegion, 
  onSelectRegion, 
  onCustomCoords, 
  onBackTo3D 
}) {
  const { t } = useTranslation();
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [mapLayer, setMapLayer] = useState('Currents'); // 'Currents', 'SST', 'Waves', 'Salinity', 'Active Cyclones', 'Sensor Fleet'
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBeach, setSelectedBeach] = useState(null);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Live Inspector Coordinates (Default: 13.32° N, 166.32° E as in reference image)
  const [inspectorData, setInspectorData] = useState({
    lat: 13.32,
    lon: 166.32,
    depth: 5606,
    pressure: '5772.54 dbar (569.71 atm)',
    sst: 28.6,
    salinity: 34.7,
    oxygen: 5.8,
    chlorophyll: 0.21,
    waveHeight: 1.35,
    windSpeed: 6.2,
    windDir: '215° SW'
  });

  const containerRef = useRef(null);

  // Transform lat/lon into SVG canvas coordinates (2000 x 1000 standard equirectangular)
  const geoToSvg = (lat, lon) => {
    const x = ((lon + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  const svgToGeo = (svgX, svgY) => {
    const lon = (svgX / 1000) * 360 - 180;
    const lat = 90 - (svgY / 500) * 180;
    return {
      lat: parseFloat(lat.toFixed(2)),
      lon: parseFloat(lon.toFixed(2))
    };
  };

  // Fixed Station Cards matching the reference image exactly
  const stationCards = [
    {
      id: 'st_46001',
      name: 'Station 46001',
      lat: 28.2,
      lon: -145.6,
      cardX: 68,
      cardY: 155,
      cardW: 64,
      cardH: 46,
      color: '#eab308',
      type: 'inSitu',
      metrics: ['28.2 °N, 145.6 °W', 'SST: 26.1 °C', 'Wave: 1.2 m']
    },
    {
      id: 'st_equatorial_pacific',
      name: 'Equatorial Pacific (El Niño Basin)',
      lat: 0.0,
      lon: -140.0,
      cardX: 52,
      cardY: 238,
      cardW: 106,
      cardH: 33,
      color: '#0284c7',
      type: 'inSitu',
      metrics: ['SST: 29.8 °C', 'Current: 0.17 m/s']
    },
    {
      id: 'st_55012',
      name: 'Station 55012',
      lat: -32.4,
      lon: -123.7,
      cardX: 154,
      cardY: 318,
      cardW: 66,
      cardH: 46,
      color: '#a855f7',
      type: 'drifter',
      metrics: ['32.4 °S, 123.7 °W', 'SST: 18.7 °C', 'Wave: 2.1 m']
    },
    {
      id: 'st_62019',
      name: 'Station 62019',
      lat: 48.3,
      lon: -12.6,
      cardX: 415,
      cardY: 120,
      cardW: 64,
      cardH: 46,
      color: '#10b981',
      type: 'argo',
      metrics: ['48.3 °N, 12.6 °W', 'SST: 17.3 °C', 'Wave: 1.8 m']
    },
    {
      id: 'st_north_atlantic',
      name: 'North Atlantic Ocean',
      lat: 35.0,
      lon: -40.0,
      cardX: 326,
      cardY: 165,
      cardW: 78,
      cardH: 33,
      color: '#38bdf8',
      type: 'inSitu',
      metrics: ['SST: 22.4 °C', 'Current: 0.34 m/s']
    },
    {
      id: 'st_bay_of_bengal',
      name: 'Bay of Bengal',
      lat: 15.3,
      lon: 87.9,
      cardX: 688,
      cardY: 180,
      cardW: 62,
      cardH: 33,
      color: '#00f0ff',
      type: 'inSitu',
      metrics: ['SST: 28.9 °C', 'Current: 0.42 m/s']
    },
    {
      id: 'st_arabian_sea',
      name: 'Arabian Sea',
      lat: 18.4,
      lon: 66.8,
      cardX: 778,
      cardY: 235,
      cardW: 65,
      cardH: 33,
      color: '#f97316',
      type: 'wave',
      metrics: ['SST: 29.1 °C', 'Current: 0.49 m/s']
    },
    {
      id: 'st_71023',
      name: 'Station 71023',
      lat: -41.2,
      lon: 86.8,
      cardX: 615,
      cardY: 365,
      cardW: 65,
      cardH: 46,
      color: '#818cf8',
      type: 'drifter',
      metrics: ['41.2 °S, 86.8 °E', 'SST: 12.4 °C', 'Wave: 2.4 m']
    },
    {
      id: 'st_80045',
      name: 'Station 80045',
      lat: -20.5,
      lon: 114.3,
      cardX: 815,
      cardY: 345,
      cardW: 65,
      cardH: 46,
      color: '#eab308',
      type: 'inSitu',
      metrics: ['20.5 °S, 114.3 °E', 'SST: 24.6 °C', 'Wave: 1.6 m']
    }
  ];

  // Buoy Fleet Markers Array with various types matching the legend
  const buoyFleet = [
    // Indian Ocean & Arabian Sea cluster
    { id: 'b-01', lat: 12.5, lon: 74.5, type: 'tide', color: '#38bdf8' },
    { id: 'b-02', lat: 8.8, lon: 76.5, type: 'wave', color: '#f97316' },
    { id: 'b-03', lat: 14.8, lon: 82.2, type: 'inSitu', color: '#eab308' },
    { id: 'b-04', lat: 17.5, lon: 86.5, type: 'argo', color: '#10b981' },
    { id: 'b-05', lat: 11.2, lon: 92.8, type: 'drifter', color: '#a855f7' },
    { id: 'b-06', lat: 5.5, lon: 80.5, type: 'tide', color: '#38bdf8' },
    { id: 'b-07', lat: 21.0, lon: 68.2, type: 'wave', color: '#f97316' },
    { id: 'b-08', lat: 16.0, lon: 63.5, type: 'argo', color: '#10b981' },
    { id: 'b-09', lat: 19.5, lon: 89.0, type: 'inSitu', color: '#eab308' },
    { id: 'b-10', lat: 2.0, lon: 68.0, type: 'drifter', color: '#a855f7' },
    { id: 'b-11', lat: -5.0, lon: 85.0, type: 'argo', color: '#10b981' },
    { id: 'b-12', lat: -12.0, lon: 65.0, type: 'wave', color: '#f97316' },
    { id: 'b-13', lat: -25.0, lon: 75.0, type: 'drifter', color: '#a855f7' },
    { id: 'b-14', lat: 22.5, lon: 38.5, type: 'tide', color: '#38bdf8' }, // Red Sea
    { id: 'b-15', lat: 26.0, lon: 52.0, type: 'inSitu', color: '#eab308' }, // Persian Gulf

    // Pacific Cluster
    { id: 'b-16', lat: 22.0, lon: -157.0, type: 'wave', color: '#f97316' }, // Hawaii
    { id: 'b-17', lat: 34.0, lon: -121.0, type: 'tide', color: '#38bdf8' }, // California
    { id: 'b-18', lat: -15.0, lon: -175.0, type: 'drifter', color: '#a855f7' }, // Fiji
    { id: 'b-19', lat: 15.0, lon: 135.0, type: 'argo', color: '#10b981' }, // Philippine Sea
    { id: 'b-20', lat: 32.0, lon: 135.0, type: 'inSitu', color: '#eab308' }, // Japan south
    { id: 'b-21', lat: -35.0, lon: 152.0, type: 'wave', color: '#f97316' }, // Sydney
    { id: 'b-22', lat: -42.0, lon: 172.0, type: 'tide', color: '#38bdf8' }, // New Zealand

    // Atlantic Cluster
    { id: 'b-23', lat: 25.0, lon: -70.0, type: 'argo', color: '#10b981' },
    { id: 'b-24', lat: 15.0, lon: -45.0, type: 'drifter', color: '#a855f7' },
    { id: 'b-25', lat: 0.0, lon: -25.0, type: 'inSitu', color: '#eab308' },
    { id: 'b-26', lat: -15.0, lon: -10.0, type: 'wave', color: '#f97316' },
    { id: 'b-27', lat: 36.0, lon: -5.0, type: 'tide', color: '#38bdf8' }, // Gibraltar
    { id: 'b-28', lat: 55.0, lon: -30.0, type: 'argo', color: '#10b981' }
  ];

  // Ocean Currents matching the reference map with directional arrows
  const warmCurrents = [
    {
      id: 'gulf_stream',
      name: 'Gulf Stream',
      path: 'M 230 205 Q 310 160 450 120',
      labelX: 275,
      labelY: 195
    },
    {
      id: 'north_equatorial',
      name: 'North Equatorial Current',
      path: 'M 470 270 Q 380 270 290 260',
      labelX: 350,
      labelY: 258
    },
    {
      id: 'agulhas_current',
      name: 'Agulhas Current',
      path: 'M 600 240 Q 590 320 540 375',
      labelX: 615,
      labelY: 305
    },
    {
      id: 'west_australian',
      name: 'West Australian Current Drift',
      path: 'M 785 380 Q 770 340 780 320',
      labelX: 740,
      labelY: 355
    }
  ];

  const coldCurrents = [
    {
      id: 'antarctic_circumpolar',
      name: 'Antarctic Circumpolar Current',
      path: 'M 150 400 Q 250 415 350 405 T 550 400 T 750 390 T 900 420',
      labelX: 420,
      labelY: 395
    },
    {
      id: 'california_current',
      name: 'California Current',
      path: 'M 160 140 Q 170 180 195 210',
      labelX: 180,
      labelY: 165
    },
    {
      id: 'humboldt_current',
      name: 'Humboldt / Peru Current',
      path: 'M 255 420 Q 240 340 260 270',
      labelX: 245,
      labelY: 360
    },
    {
      id: 'benguela_current',
      name: 'Benguela Current',
      path: 'M 480 370 Q 460 300 480 240',
      labelX: 470,
      labelY: 320
    }
  ];

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const svgX = (clickX - pan.x) / zoom;
      const svgY = (clickY - pan.y) / zoom;

      if (svgX >= 0 && svgX <= 1000 && svgY >= 0 && svgY <= 500) {
        const geo = svgToGeo(svgX, svgY);
        // Deterministic realistic bathymetry
        const depthEst = Math.max(45, Math.round(4800 + Math.sin(geo.lat * 0.1) * 2100 - Math.cos(geo.lon * 0.05) * 900));
        const pressureEst = calculateHydrostaticPressure(depthEst, geo.lat);
        const sstEst = Math.max(2.1, Math.min(31.2, 30.2 - Math.pow(Math.abs(geo.lat) / 68, 1.8) * 27));
        const salinityEst = (33.5 + Math.sin(Math.abs(geo.lat) * 0.08) * 3.2).toFixed(1);

        setInspectorData({
          lat: Math.abs(geo.lat),
          latDir: geo.lat >= 0 ? 'N' : 'S',
          lon: Math.abs(geo.lon),
          lonDir: geo.lon >= 0 ? 'E' : 'W',
          depth: depthEst,
          pressure: `${pressureEst.dbar.toFixed(2)} dbar (${pressureEst.atm.toFixed(2)} atm)`,
          sst: sstEst.toFixed(1),
          salinity: salinityEst,
          oxygen: (5.4 + Math.cos(geo.lat * 0.1) * 1.5).toFixed(1),
          chlorophyll: (0.15 + Math.abs(Math.sin(geo.lon * 0.2)) * 0.35).toFixed(2),
          waveHeight: (1.2 + Math.abs(Math.sin(geo.lat * 0.15)) * 1.6).toFixed(2),
          windSpeed: (5.5 + Math.abs(Math.sin(geo.lon * 0.1)) * 3.8).toFixed(1),
          windDir: '215° SW'
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapClick = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const svgX = (clickX - pan.x) / zoom;
      const svgY = (clickY - pan.y) / zoom;

      if (svgX >= 0 && svgX <= 1000 && svgY >= 0 && svgY <= 500) {
        const geo = svgToGeo(svgX, svgY);
        const depthEst = Math.max(45, Math.round(4800 + Math.sin(geo.lat * 0.1) * 2100));
        const pressureEst = calculateHydrostaticPressure(depthEst, geo.lat);
        setPinnedLocation({ ...geo, depth: depthEst, pressure: pressureEst });
      }
    }
  };

  const handleZoom = (delta) => {
    setZoom((prev) => Math.min(4.5, Math.max(1, parseFloat((prev + delta).toFixed(1)))));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const query = q.toLowerCase();
    const matchedBeaches = COASTAL_BEACHES.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.state.toLowerCase().includes(query) ||
        b.country.toLowerCase().includes(query)
    );
    const matchedRegions = Object.values(REGIONS).filter((r) =>
      r.name.toLowerCase().includes(query)
    );

    setSearchResults([
      ...matchedRegions.map((r) => ({ type: 'region', data: r, name: r.name, lat: r.lat, lon: r.lon })),
      ...matchedBeaches.map((b) => ({ type: 'beach', data: b, name: b.name, lat: b.lat, lon: b.lon }))
    ]);
  };

  const handleSelectSearchResult = (res) => {
    const pos = geoToSvg(res.lat, res.lon);
    setPan({
      x: 500 - pos.x * 2,
      y: 250 - pos.y * 2
    });
    setZoom(2.2);
    setSearchQuery(res.name);
    setSearchResults([]);

    if (res.type === 'beach') {
      setSelectedBeach(calculateBeachRainForecast(res.data));
      setPinnedLocation({ lat: res.lat, lon: res.lon, name: res.name, depth: 35 });
    } else {
      onSelectRegion(res.data);
    }
  };

  const handleTargetPinned = () => {
    if (pinnedLocation) {
      const regionData = createLocationData(pinnedLocation.lat, pinnedLocation.lon, pinnedLocation.name);
      onCustomCoords(regionData);
      onBackTo3D();
    }
  };

  // Viewport calculation for the mini-map rectangle
  const miniMapBox = useMemo(() => {
    const normZoom = zoom;
    const boxW = Math.max(15, 100 / normZoom);
    const boxH = Math.max(12, 50 / normZoom);
    const boxX = Math.max(0, Math.min(100 - boxW, 50 - (pan.x / 10) / normZoom - boxW / 2));
    const boxY = Math.max(0, Math.min(50 - boxH, 25 - (pan.y / 10) / normZoom - boxH / 2));
    return { x: boxX, y: boxY, w: boxW, h: boxH };
  }, [zoom, pan]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#030712] overflow-hidden select-none animate-in fade-in duration-200">
      {/* 1. Top Subheader Map Control Bar */}
      <div className="h-14 px-5 border-b border-sky-500/20 bg-[#061026]/90 backdrop-blur-md flex items-center justify-between z-20 gap-3">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackTo3D}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-cyan-300 border border-sky-500/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('mapView.backTo3D', 'Back to 3D Twin')}</span>
          </button>
          <div className="h-4 w-px bg-sky-500/20" />
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs md:text-sm font-bold text-white hidden sm:block">
              {t('mapView.title', 'Global Oceanographic Satellite Altimetry & Current Map')}
            </h2>
          </div>
        </div>

        {/* Center: Search Box */}
        <div className="relative flex-1 max-w-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#09183d] border border-sky-500/30 text-xs text-sky-200">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="text"
              placeholder={t('mapView.searchPlaceholder', 'Search ocean or beach...')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-slate-400 font-normal"
            />
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-[#071536] border border-sky-500/40 rounded-xl shadow-2xl p-1.5 z-40 max-h-56 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2 rounded-lg hover:bg-sky-500/20 text-xs flex items-center justify-between transition-colors text-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {res.type === 'beach' ? (
                      <Umbrella className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span className="font-bold text-white">{res.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">
                    {res.lat}°N, {res.lon}°E
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Layer Pills & Zoom Tools */}
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-1 bg-[#09183d] p-1 rounded-xl border border-sky-500/20">
            {[
              { id: 'Currents', label: t('mapView.currents', 'Currents') },
              { id: 'SST', label: t('mapView.sst', 'SST') },
              { id: 'Waves', label: t('mapView.waves', 'Waves') },
              { id: 'Salinity', label: t('mapView.salinity', 'Salinity') },
              { id: 'Active Cyclones', label: t('mapView.cyclones', 'Active Cyclones') },
              { id: 'Sensor Fleet', label: t('mapView.fleet', 'Sensor Fleet') }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setMapLayer(id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapLayer === id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-sky-500/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#09183d] p-1 rounded-xl border border-sky-500/20">
            <button
              onClick={() => handleZoom(0.3)}
              title={t('mapView.zoomIn', 'Zoom In')}
              className="p-1.5 rounded-lg hover:bg-sky-500/20 text-cyan-300 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.3)}
              title={t('mapView.zoomOut', 'Zoom Out')}
              className="p-1.5 rounded-lg hover:bg-sky-500/20 text-cyan-300 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title={t('mapView.resetView', 'Reset Map')}
              className="p-1.5 rounded-lg hover:bg-sky-500/20 text-cyan-300 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Map Viewport Surface */}
      <div 
        className="relative flex-1 bg-[#020713] overflow-hidden flex items-center justify-center p-2 md:p-3 select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* SVG Container with NASA Satellite Basemap */}
        <div 
          ref={containerRef}
          onClick={handleMapClick}
          className="relative w-full h-full max-w-[1550px] max-h-[820px] rounded-3xl border border-sky-500/30 overflow-hidden shadow-2xl bg-[#030919] cursor-crosshair"
        >
          <svg 
            viewBox="0 0 1000 500" 
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '500px 250px'
            }}
          >
            <defs>
              {/* Cyclone Radar Gradient */}
              <radialGradient id="cyclonePulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              {/* Arrow Marker for Warm Currents */}
              <marker id="arrowWarm" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
              </marker>
              {/* Arrow Marker for Cold Currents */}
              <marker id="arrowCold" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
              </marker>
            </defs>

            {/* A. PHOTOREALISTIC NASA BLUE MARBLE SATELLITE BASEMAP */}
            <image 
              href="/world_map_satellite.jpg" 
              x="0" 
              y="0" 
              width="1000" 
              height="500" 
              preserveAspectRatio="none"
              className="opacity-90"
            />

            {/* Subtle dark ocean border vignette */}
            <rect width="1000" height="500" fill="none" stroke="rgba(2, 6, 23, 0.4)" strokeWidth="10" />

            {/* B. LONGITUDINAL MERIDIAN LINES & LABELS */}
            {[
              { x: 0, label: '180°W' },
              { x: 166.7, label: '120°W' },
              { x: 333.3, label: '60°W' },
              { x: 500, label: '0° Meridian' },
              { x: 666.7, label: '60°E' },
              { x: 833.3, label: '120°E' },
              { x: 1000, label: '180°E' }
            ].map((m, idx) => (
              <g key={idx}>
                <line
                  x1={m.x}
                  y1={0}
                  x2={m.x}
                  y2={500}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                />
                <text
                  x={m.x === 0 ? 8 : m.x === 1000 ? 992 : m.x}
                  y="12"
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="7.5"
                  fontFamily="monospace"
                  textAnchor={m.x === 0 ? 'start' : m.x === 1000 ? 'end' : 'middle'}
                  className="pointer-events-none"
                >
                  {m.label}
                </text>
              </g>
            ))}

            {/* C. LATITUDINAL CIRCLES & LABELS */}
            {/* Arctic Circle 66.5° N */}
            <line x1="0" y1="65.3" x2="1000" y2="65.3" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="980" y="62" fill="rgba(56, 189, 248, 0.75)" fontSize="7" fontFamily="monospace" textAnchor="end">Arctic Circle 66.5° N</text>

            {/* 60° N */}
            <line x1="0" y1="83.3" x2="1000" y2="83.3" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.6" strokeDasharray="2 2" />
            <text x="12" y="81" fill="rgba(255, 255, 255, 0.5)" fontSize="7" fontFamily="monospace">60°N</text>

            {/* 30° N */}
            <line x1="0" y1="166.7" x2="1000" y2="166.7" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.6" strokeDasharray="2 2" />
            <text x="12" y="164" fill="rgba(255, 255, 255, 0.5)" fontSize="7" fontFamily="monospace">30°N</text>

            {/* Tropic of Cancer 23.5° N */}
            <line x1="0" y1="184.7" x2="1000" y2="184.7" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" strokeDasharray="4 3" />
            <text x="920" y="181" fill="rgba(255, 255, 255, 0.65)" fontSize="7" fontFamily="monospace" textAnchor="end">Tropic of Cancer 23.5° N</text>

            {/* 0° Equator (Yellow Dashed Line) */}
            <line x1="0" y1="250" x2="1000" y2="250" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.85" />
            <text x="12" y="247" fill="#fbbf24" fontSize="8" fontFamily="monospace" fontWeight="bold">0° Equator</text>
            <text x="920" y="247" fill="#fbbf24" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">Equator 0°</text>

            {/* Tropic of Capricorn 23.5° S */}
            <line x1="0" y1="315.3" x2="1000" y2="315.3" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" strokeDasharray="4 3" />
            <text x="910" y="312" fill="rgba(255, 255, 255, 0.65)" fontSize="7" fontFamily="monospace" textAnchor="end">Tropic of Capricorn 23.5° S</text>

            {/* 30° S */}
            <line x1="0" y1="333.3" x2="1000" y2="333.3" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.6" strokeDasharray="2 2" />
            <text x="12" y="331" fill="rgba(255, 255, 255, 0.5)" fontSize="7" fontFamily="monospace">30°S</text>

            {/* Antarctic Circle 66.5° S */}
            <line x1="0" y1="434.7" x2="1000" y2="434.7" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="950" y="432" fill="rgba(56, 189, 248, 0.75)" fontSize="7" fontFamily="monospace" textAnchor="end">Antarctic Circle 66.5° S</text>

            {/* D. OCEAN CURRENTS (Warm: Red dashed with arrows, Cold: Blue dashed with arrows) */}
            {(mapLayer === 'Currents' || mapLayer === 'Waves' || mapLayer === 'SST') && (
              <g className="pointer-events-none">
                {/* Warm currents */}
                {warmCurrents.map((cur) => (
                  <g key={cur.id}>
                    <path
                      d={cur.path}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.8"
                      strokeDasharray="5 3"
                      markerMid="url(#arrowWarm)"
                      markerEnd="url(#arrowWarm)"
                      opacity="0.85"
                    />
                    <text
                      x={cur.labelX}
                      y={cur.labelY}
                      fill="#fca5a5"
                      fontSize="6.5"
                      fontFamily="sans-serif"
                      fontWeight="600"
                    >
                      {cur.name}
                    </text>
                  </g>
                ))}

                {/* Cold currents */}
                {coldCurrents.map((cur) => (
                  <g key={cur.id}>
                    <path
                      d={cur.path}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                      strokeDasharray="5 3"
                      markerMid="url(#arrowCold)"
                      markerEnd="url(#arrowCold)"
                      opacity="0.85"
                    />
                    <text
                      x={cur.labelX}
                      y={cur.labelY}
                      fill="#bae6fd"
                      fontSize="6.5"
                      fontFamily="sans-serif"
                      fontWeight="600"
                    >
                      {cur.name}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* E. SENSOR FLEET BUOY PINS (Categorized dots matching legend) */}
            {(mapLayer === 'Sensor Fleet' || mapLayer === 'Currents' || mapLayer === 'Salinity') && (
              <g className="cursor-pointer">
                {buoyFleet.map((buoy) => {
                  const pos = geoToSvg(buoy.lat, buoy.lon);
                  return (
                    <g key={buoy.id} className="hover:scale-125 transition-transform">
                      <circle cx={pos.x} cy={pos.y} r="5.5" fill={buoy.color} opacity="0.3" />
                      <circle cx={pos.x} cy={pos.y} r="3" fill={buoy.color} stroke="#ffffff" strokeWidth="0.8" />
                    </g>
                  );
                })}
              </g>
            )}

            {/* F. ACTIVE CYCLONES OVERLAY */}
            {(mapLayer === 'Active Cyclones' || mapLayer === 'Currents') && (
              <g className="cursor-pointer">
                {[
                  { name: 'Cyclone REMAL', cat: 'Cat 3', lat: 16.5, lon: 88.2 },
                  { name: 'Typhoon YAGI', cat: 'Cat 4', lat: 15.8, lon: 115.4 }
                ].map((storm, idx) => {
                  const pos = geoToSvg(storm.lat, storm.lon);
                  return (
                    <g key={idx} className="animate-pulse">
                      <circle cx={pos.x} cy={pos.y} r="22" fill="url(#cyclonePulse)" />
                      <circle cx={pos.x} cy={pos.y} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />
                      <text x={pos.x + 8} y={pos.y - 3} fill="#fca5a5" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">
                        {storm.name} ({storm.cat})
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* G. STATION CARDS (Glass cards matching reference image layout) */}
            {stationCards.map((st) => {
              const pos = geoToSvg(st.lat, st.lon);
              const cardX = st.cardX ?? (pos.x - 45);
              const cardY = st.cardY ?? (pos.y - 25);
              const cardW = st.cardW ?? 75;
              const cardH = st.cardH ?? (24 + st.metrics.length * 9);
              const isActive = activeRegion && st.name.toLowerCase().includes(activeRegion.name.toLowerCase());

              return (
                <g
                  key={st.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    const reg = Object.values(REGIONS).find((r) => r.name.toLowerCase().includes(st.name.toLowerCase()));
                    if (reg) {
                      onSelectRegion(reg);
                      onBackTo3D();
                    } else {
                      setPinnedLocation({ lat: st.lat, lon: st.lon, name: st.name, depth: 3200 });
                    }
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  {/* Subtle connection line from dot to card */}
                  <line
                    x1={pos.x}
                    y1={pos.y}
                    x2={pos.x < cardX ? cardX : pos.x > cardX + cardW ? cardX + cardW : cardX + cardW / 2}
                    y2={pos.y < cardY ? cardY : pos.y > cardY + cardH ? cardY + cardH : cardY + cardH / 2}
                    stroke={st.color}
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                    opacity="0.55"
                  />

                  {/* Station Location Pin Dot */}
                  <circle cx={pos.x} cy={pos.y} r={isActive ? 4.5 : 3.5} fill={isActive ? '#00f0ff' : st.color} stroke="#ffffff" strokeWidth="0.8" />

                  {/* Glassmorphic Station Card */}
                  <rect
                    x={cardX}
                    y={cardY}
                    width={cardW}
                    height={cardH}
                    rx="4"
                    fill="rgba(4, 14, 34, 0.88)"
                    stroke={isActive ? '#00f0ff' : st.color}
                    strokeWidth={isActive ? '1.5' : '1'}
                    className="shadow-lg backdrop-blur-md"
                  />

                  {/* Title Icon and Name */}
                  <circle cx={cardX + 6.5} cy={cardY + 8} r="2.2" fill={st.color} />
                  <text
                    x={cardX + 11.5}
                    y={cardY + 10}
                    fill="#ffffff"
                    fontSize="6.5"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {st.name.length > 25 ? st.name.slice(0, 25) + '...' : st.name}
                  </text>

                  {/* Metrics text lines */}
                  {st.metrics.map((metric, mIdx) => (
                    <text
                      key={mIdx}
                      x={cardX + 6.5}
                      y={cardY + 19 + mIdx * 8.5}
                      fill="#93c5fd"
                      fontSize="5.5"
                      fontFamily="monospace"
                    >
                      {metric}
                    </text>
                  ))}
                </g>
              );
            })}

            {/* H. PINNED TARGET COORDINATES MARKER */}
            {pinnedLocation && (() => {
              const pos = geoToSvg(pinnedLocation.lat, pinnedLocation.lon);
              return (
                <g className="animate-bounce pointer-events-none">
                  <circle cx={pos.x} cy={pos.y} r="8" fill="#00f0ff" stroke="#ffffff" strokeWidth="2" />
                  <line x1={pos.x} y1={pos.y - 22} x2={pos.x} y2={pos.y} stroke="#00f0ff" strokeWidth="2.5" />
                </g>
              );
            })()}
          </svg>

          {/* 3. FLOATING OVERLAYS (Exact match to reference image) */}

          {/* A. LEGEND (Top Right) */}
          <div className="absolute top-4 right-4 bg-[#05112e]/90 backdrop-blur-md p-3.5 rounded-2xl border border-sky-500/30 text-xs shadow-2xl z-30 min-w-[140px]">
            <div className="flex items-center justify-between font-bold text-white tracking-wider text-[11px] mb-2 uppercase border-b border-sky-500/20 pb-1">
              <span>{t('mapView.legend', 'LEGEND')}</span>
              <button 
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className="text-slate-400 hover:text-white text-[10px]"
              >
                {isLegendOpen ? '–' : '+'}
              </button>
            </div>

            {isLegendOpen && (
              <div className="flex flex-col gap-1.5 text-[10px] text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                  <span>{t('mapView.inSitu', 'In-situ Station')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                  <span>{t('mapView.drifter', 'Drifter Buoy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>{t('mapView.argo', 'Argo Float')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                  <span>{t('mapView.tideGauge', 'Tide Gauge')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span>{t('mapView.waveBuoy', 'Wave Buoy')}</span>
                </div>

                <div className="h-px bg-sky-500/20 my-1" />

                <div className="text-[9px] uppercase font-bold text-slate-400">{t('mapView.oceanCurrents', 'Ocean Currents')}</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500" />
                  <span>{t('mapView.warmCurrent', 'Warm Current')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-sky-400" />
                  <span>{t('mapView.coldCurrent', 'Cold Current')}</span>
                </div>
              </div>
            )}
          </div>

          {/* B. ZOOM & LAYER CONTROLS (Middle Right edge) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30">
            <button
              onClick={() => handleZoom(0.3)}
              className="w-8 h-8 rounded-xl bg-[#061438]/90 hover:bg-[#0c2466] border border-sky-500/30 text-white flex items-center justify-center shadow-lg cursor-pointer transition-colors"
              title={t('mapView.zoomIn', 'Zoom In')}
            >
              <Plus className="w-4 h-4 text-cyan-300" />
            </button>
            <button
              onClick={() => handleZoom(-0.3)}
              className="w-8 h-8 rounded-xl bg-[#061438]/90 hover:bg-[#0c2466] border border-sky-500/30 text-white flex items-center justify-center shadow-lg cursor-pointer transition-colors"
              title={t('mapView.zoomOut', 'Zoom Out')}
            >
              <Minus className="w-4 h-4 text-cyan-300" />
            </button>
            <button
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="w-8 h-8 rounded-xl bg-[#061438]/90 hover:bg-[#0c2466] border border-sky-500/30 text-white flex items-center justify-center shadow-lg cursor-pointer transition-colors"
              title={t('mapView.legend', 'Toggle Legend')}
            >
              <Layers className="w-4 h-4 text-cyan-300" />
            </button>
          </div>

          {/* C. REAL-TIME INSPECTOR HUD (Bottom Left) matching reference image */}
          <div className="absolute bottom-4 left-4 bg-[#05112e]/92 backdrop-blur-md p-3.5 rounded-2xl border border-sky-500/30 text-[11px] font-mono shadow-2xl z-30 max-w-sm pointer-events-none">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('mapView.inspector', 'Inspector')}: {inspectorData.lat}° {inspectorData.latDir || 'N'}, {inspectorData.lon}° {inspectorData.lonDir || 'E'}</span>
            </div>
            <div className="text-slate-300 leading-snug">
              <div>{t('mapView.depth', 'Bathymetry')}: <b className="text-white">{inspectorData.depth}m</b></div>
              <div>{t('mapView.pressure', 'Pressure')}: <b className="text-amber-300">{inspectorData.pressure}</b></div>
              <div>{t('mapView.seaTemp', 'Sea Surface Temp')}: <b className="text-cyan-200">{inspectorData.sst} °C</b></div>
              <div>{t('mapView.salinity', 'Salinity')}: <b className="text-emerald-300">{inspectorData.salinity} PSU</b></div>
              <div>{t('mapView.oxygen', 'Dissolved Oxygen')}: <b className="text-sky-300">{inspectorData.oxygen} mg/L</b></div>
              <div>{t('mapView.chlorophyll', 'Chlorophyll-a')}: <b className="text-green-300">{inspectorData.chlorophyll} mg/m³</b></div>
              <div>{t('mapView.waves', 'Wave Height')}: <b className="text-white">{inspectorData.waveHeight}m</b></div>
              <div>{t('mapView.windSpeed', 'Wind Speed')}: <b className="text-slate-200">{inspectorData.windSpeed} m/s</b></div>
              <div>Wind Direction: <b className="text-slate-200">{inspectorData.windDir}</b></div>
            </div>
          </div>

          {/* D. TARGET PINNED ACTION CARD */}
          {pinnedLocation && (
            <div className="absolute bottom-4 left-80 bg-[#07163d]/95 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-400/50 shadow-glow-cyan z-30 max-w-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{pinnedLocation.name || 'Selected Point'}</span>
                </div>
                <button 
                  onClick={() => { setPinnedLocation(null); setSelectedBeach(null); }}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs font-mono font-bold text-white mb-2">
                {pinnedLocation.lat}° {pinnedLocation.lat >= 0 ? 'N' : 'S'}, {pinnedLocation.lon}° {pinnedLocation.lon >= 0 ? 'E' : 'W'}
              </div>

              {selectedBeach ? (
                <div className="mb-2 text-[10px] text-slate-300 bg-[#040e28] p-2 rounded-xl">
                  <div className="text-amber-300 font-bold flex items-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    <span>Rain: {selectedBeach.rainProbability}% ({selectedBeach.total24hPrecipMm} mm)</span>
                  </div>
                  <div className="italic text-slate-400 mt-0.5">{selectedBeach.advisoryText}</div>
                </div>
              ) : (
                <div className="mb-2 text-[10px] text-slate-300 font-mono">
                  {t('mapView.depth', 'Bathymetry')}: ~{pinnedLocation.depth || 3200}m • {t('mapView.pressure', 'Pressure')}: ~{pinnedLocation.pressure?.dbar || 3250} dbar
                </div>
              )}

              <button
                onClick={handleTargetPinned}
                className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>{t('mapView.load3d', 'Load 3D Simulation Here')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* E. MINI-MAP (Bottom Right inside map container) */}
          <div className="absolute bottom-4 right-4 bg-[#05112e]/90 backdrop-blur-md p-2 rounded-2xl border border-sky-500/30 shadow-2xl z-30 flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 mb-1">{t('mapView.miniMap', 'Mini Map')}</span>
            <div className="relative w-28 h-14 rounded-lg overflow-hidden border border-sky-500/20 bg-[#030919]">
              <img 
                src="/world_map_satellite.jpg" 
                alt="Mini Map" 
                className="w-full h-full object-cover opacity-60 pointer-events-none"
              />
              {/* Dynamic Viewport Rectangle */}
              <div 
                className="absolute border border-cyan-400 border-dashed bg-cyan-400/10 pointer-events-none"
                style={{
                  left: `${miniMapBox.x}%`,
                  top: `${miniMapBox.y}%`,
                  width: `${miniMapBox.w}%`,
                  height: `${miniMapBox.h}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
