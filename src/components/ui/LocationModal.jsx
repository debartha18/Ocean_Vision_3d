import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Compass, Navigation, Globe, Check, Search, ArrowRight } from 'lucide-react';
import { REGIONS } from '../../data/oceanData';

export default function LocationModal({ isOpen, onClose, activeRegion, onSelectRegion, onCustomCoords }) {
  const { t } = useTranslation();
  const [customLat, setCustomLat] = useState('15.297');
  const [customLon, setCustomLon] = useState('87.860');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredRegions = Object.values(REGIONS).filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.coords.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyCustom = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      onCustomCoords({
        id: 'custom',
        name: `Custom (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
        coords: `${Math.abs(lat).toFixed(3)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(3)}° ${lon >= 0 ? 'E' : 'W'}`,
        lat,
        lon,
        cameraPosition: [0, 3.4, 4.8],
        cameraLookAt: [0, -0.35, 0.1],
        earthRotation: [Math.PI * 0.58, 0, (lon / 180) * Math.PI],
        sst: 28.5 + Math.sin(lat * 0.1) * 3,
        salinity: 34.5,
        currentSpeed: 1.0,
        waveHeight: 2.0,
        stormProbability: Math.min(95, Math.max(10, Math.floor(Math.abs(lat) * 4))),
        rainRate: 25.0,
        activeStorm: {
          name: 'Tropical Disturbance',
          category: 'Low Pressure Alert',
          windSpeed: '65 km/h',
          pressure: '998 hPa',
          surge: '1.2m',
          movement: 'Westward',
          rainfallForecast: 'Moderate showers across coordinates'
        },
        buoys: [
          {
            id: 'CUSTOM-BUOY-01',
            type: 'mooredBuoy',
            name: `Ocean Observation Station (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
            lat,
            lon,
            x: 0,
            z: 0,
            sst: 28.8,
            salinity: 34.8,
            currentSpeed: 0.9,
            waveHeight: 1.8,
            battery: '99%',
            qcStatus: 'Target Locked',
            mooringDepth: 3500,
            lastTransmission: 'Just now',
            depthProfile: [
              { depth: 0, temp: 28.8, salinity: 34.8 },
              { depth: 50, temp: 27.5, salinity: 35.1 },
              { depth: 100, temp: 22.1, salinity: 35.4 },
              { depth: 500, temp: 10.5, salinity: 35.2 }
            ]
          }
        ]
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl p-6 border border-cyan-400/40 shadow-glow-cyan max-w-xl w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-sky-500/10 text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 shadow-glow-cyan flex items-center justify-center text-cyan-400">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide">
              {t('locationModal.title', 'Global Ocean Basin & Coordinate Navigator')}
            </h2>
            <p className="text-xs text-sky-300/70 font-mono">
              {t('locationModal.subtitle', 'Select ocean basin or enter exact Latitude & Longitude coordinates')}
            </p>
          </div>
        </div>

        {/* Custom Coordinates Input Card */}
        <form onSubmit={handleApplyCustom} className="bg-[#071536]/90 p-3.5 rounded-2xl border border-sky-500/25 mb-4">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5" />
            <span>{t('locationModal.targetCustom', 'Target Custom Coordinates')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                {t('locationModal.latitudePrompt', 'Latitude (-90.0° to +90.0°)')}
              </label>
              <input
                type="number"
                step="0.001"
                min="-90"
                max="90"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                placeholder="15.297"
                className="w-full px-3 py-2 rounded-xl bg-[#030b1e] border border-sky-500/30 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                {t('locationModal.longitudePrompt', 'Longitude (-180.0° to +180.0°)')}
              </label>
              <input
                type="number"
                step="0.001"
                min="-180"
                max="180"
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value)}
                placeholder="87.860"
                className="w-full px-3 py-2 rounded-xl bg-[#030b1e] border border-sky-500/30 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan flex items-center justify-center gap-2 transition-all"
          >
            <span>{t('locationModal.flyCamera', 'Fly Camera to Coordinates')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Ocean Basin Directory */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
            {t('locationModal.majorBasins', 'Major Ocean Basins & Seas')}
          </span>
          <span className="text-[10px] font-mono text-cyan-400">{t('locationModal.globalBasins', '6 Global Basins')}</span>
        </div>

        {/* Search filter */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('locationModal.searchPlaceholder', 'Search sea or coordinates...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#05102a] border border-sky-500/20 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Region List */}
        <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-2">
          {filteredRegions.map((region) => {
            const isSelected = activeRegion.id === region.id;
            return (
              <div
                key={region.id}
                onClick={() => {
                  onSelectRegion(region);
                  onClose();
                }}
                className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-glow-cyan'
                    : 'bg-[#061433]/70 hover:bg-[#0c2356] border border-sky-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-sky-500/10 text-cyan-400'}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {region.name}
                      {region.activeStorm && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                          {region.activeStorm.name}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-sky-300/80 mt-0.5">
                      {region.coords} • SST: {region.sst}°C • {t('stormModal.stormRisk', 'Storm Risk')}: {region.stormProbability}%
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
