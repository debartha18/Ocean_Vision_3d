import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Wind, 
  Newspaper, 
  Umbrella, 
  CloudRain, 
  Compass,
  CheckCircle2
} from 'lucide-react';
import { MARINE_NEWS_BULLETINS } from '../../data/oceanData';
import { getNearestBeaches, calculateBeachRainForecast } from '../../data/beachData';

export default function StormNewsModal({ 
  isOpen, 
  onClose, 
  activeRegion, 
  isStormLayerActive, 
  setIsStormLayerActive 
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('beaches'); // 'beaches' or 'news'

  if (!isOpen) return null;

  const storm = activeRegion?.activeStorm;
  const rainRate = activeRegion?.rainRate || 35.0;
  const stormProb = activeRegion?.stormProbability || 75;
  const lat = activeRegion?.lat || 15.297;
  const lon = activeRegion?.lon || 87.860;

  // Retrieve nearest beaches to this exact coordinate
  const nearestBeaches = getNearestBeaches(lat, lon, 6);
  const beachForecasts = nearestBeaches.map((b) => calculateBeachRainForecast(b, stormProb, storm));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 select-none animate-in fade-in duration-200">
      <div className="glass-panel glow-border-red rounded-3xl p-6 border border-red-500/50 shadow-glow-red max-w-3xl w-full relative max-h-[92vh] flex flex-col bg-gradient-to-b from-[#1a0818] via-[#0b142d] to-[#040b1e]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-300 hover:text-white hover:bg-red-500/25 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/40 shadow-glow-red flex items-center justify-center text-red-400 animate-pulse">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-wide">
                {t('stormModal.title', 'Coastal Weather Forecast & Beach Rain Radar')}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-500/30 text-red-200 border border-red-400/40 animate-pulse">
                {storm?.category || t('stormModal.activeSystem', 'Active Weather System')}
              </span>
            </div>
            <p className="text-xs text-sky-300/80 font-mono">
              {t('stormModal.targetSector', 'Target Maritime Sector')}: {activeRegion?.name} ({activeRegion?.coords})
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs: Beaches vs Marine Bulletins */}
        <div className="flex items-center gap-2 mb-4 border-b border-sky-500/20 pb-3">
          <button
            onClick={() => setActiveTab('beaches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'beaches'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-glow-cyan'
                : 'bg-[#091738] text-slate-300 hover:text-white hover:bg-[#102454]'
            }`}
          >
            <Umbrella className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('stormModal.beachesTab', 'Near Sea Beaches & Coastal Rain Forecast')} ({nearestBeaches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'news'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-glow-red'
                : 'bg-[#091738] text-slate-300 hover:text-white hover:bg-[#102454]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-red-400" />
            <span>{t('stormModal.newsTab', 'Marine Meteorological News & Bulletins')}</span>
          </button>
        </div>

        {/* Global Storm Metrics Strip */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-[#19081e] p-2.5 rounded-2xl border border-red-500/30 text-center">
            <div className="text-[9px] text-slate-400 uppercase font-mono">{t('stormModal.stormRisk', 'Storm Risk')}</div>
            <div className="text-base font-mono font-black text-red-400 mt-0.5">{stormProb}%</div>
            <div className="text-[9px] text-red-300/70">{t('stormModal.probability', 'Probability')}</div>
          </div>
          <div className="bg-[#19081e] p-2.5 rounded-2xl border border-red-500/30 text-center">
            <div className="text-[9px] text-slate-400 uppercase font-mono">{t('stormModal.precipitation', 'Precipitation')}</div>
            <div className="text-base font-mono font-black text-amber-300 mt-0.5">{rainRate} mm/h</div>
            <div className="text-[9px] text-amber-300/70">{t('stormModal.rainRate', 'Rain Rate')}</div>
          </div>
          <div className="bg-[#19081e] p-2.5 rounded-2xl border border-red-500/30 text-center">
            <div className="text-[9px] text-slate-400 uppercase font-mono">{t('stormModal.windGusts', 'Wind Gusts')}</div>
            <div className="text-base font-mono font-black text-orange-400 mt-0.5">
              {storm ? storm.windSpeed.split(' ')[0] : '110'} km/h
            </div>
            <div className="text-[9px] text-orange-300/70">{t('stormModal.galeVelocity', 'Gale Velocity')}</div>
          </div>
          <div className="bg-[#19081e] p-2.5 rounded-2xl border border-red-500/30 text-center">
            <div className="text-[9px] text-slate-400 uppercase font-mono">{t('stormModal.cyclone3d', '3D Cyclone')}</div>
            <button
              onClick={() => setIsStormLayerActive(!isStormLayerActive)}
              className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                isStormLayerActive
                  ? 'bg-red-500 text-white shadow-glow-red'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isStormLayerActive ? t('stormModal.active', 'ACTIVE') : t('stormModal.off', 'OFF')}
            </button>
          </div>
        </div>

        {/* TAB 1: Coastal Beaches & Side Areas Rain Forecast */}
        {activeTab === 'beaches' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('stormModal.nearbyZones', 'Nearby Coastal Zones & Beach Rain Predictions (Sorted by Proximity)')}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {t('stormModal.surgeCorrected', 'Corrected for Distance & Monsoon Surge')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {beachForecasts.map((b) => (
                <div
                  key={b.beachId}
                  className="bg-[#071738]/90 p-4 rounded-2xl border border-sky-500/25 hover:border-cyan-400/50 transition-all flex flex-col justify-between shadow-cockpit"
                >
                  <div>
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{b.beachName}</span>
                          <span className="text-[10px] font-normal text-slate-400 font-mono">
                            ({b.distanceKm} km)
                          </span>
                        </h4>
                        <div className="text-[11px] text-cyan-300 font-mono">{b.location}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        b.safetyFlag.includes('Red')
                          ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                          : b.safetyFlag.includes('Yellow')
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {b.safetyFlag.split(' ')[0]} {t('stormModal.flag', 'Flag')}
                      </span>
                    </div>

                    {/* Meteorological Matrix */}
                    <div className="grid grid-cols-3 gap-2 my-2.5 text-center">
                      <div className="bg-[#030d24] p-2 rounded-xl border border-sky-500/15">
                        <div className="text-[9px] text-slate-400 uppercase font-mono">{t('stormModal.rainChance', 'Rain Chance')}</div>
                        <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
                          {b.rainProbability}%
                        </div>
                        <div className="text-[8px] text-amber-400/60">{b.rainRateMmH} mm/h</div>
                      </div>

                      <div className="bg-[#030d24] p-2 rounded-xl border border-sky-500/15">
                        <div className="text-[9px] text-slate-400 uppercase font-mono">{t('stormModal.total24h', '24h Total')}</div>
                        <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                          {b.total24hPrecipMm} mm
                        </div>
                        <div className="text-[8px] text-cyan-400/60">{t('stormModal.accumulation', 'Accumulation')}</div>
                      </div>

                      <div className="bg-[#030d24] p-2 rounded-xl border border-sky-500/15">
                        <div className="text-[9px] text-slate-400 uppercase font-mono">{t('stormModal.breakerSwell', 'Breaker Swell')}</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {b.surfWaveHeight} m
                        </div>
                        <div className="text-[8px] text-slate-400">{t('stormModal.wind', 'Wind')}: {b.beachWindGusts} km/h</div>
                      </div>
                    </div>

                    {/* 3-Day Lookahead Micro Strip */}
                    <div className="flex items-center justify-between text-[10px] font-mono bg-[#030a1c] p-2 rounded-xl mb-2 text-slate-300">
                      {b.threeDayForecast.map((day, i) => (
                        <div key={i} className="text-center">
                          <span className="text-slate-400 block">{day.day}</span>
                          <span className="font-bold text-white">{day.rainMm} mm</span>
                          <span className="text-[8px] text-amber-300 block">{day.prob}%</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed italic bg-[#030e28]/50 p-2 rounded-xl border border-white/5">
                      "{b.advisoryText}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Marine Meteorological Bulletins & News */}
        {activeTab === 'news' && (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
            {/* Active Storm Deep Dive */}
            <div className="bg-[#0b1738] p-4 rounded-2xl border border-sky-500/30 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-1">
                <Wind className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span>{storm?.name || 'Tropical Convective Vortex Alert'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal mb-2">
                {storm?.rainfallForecast || 'Heavy squalls, ocean wave height exceeding 3.5m, and gale force winds detected.'}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>{t('stormModal.movement', 'Movement')}: <b className="text-white">{storm?.movement || 'Northwest at 16 km/h'}</b></span>
                <span>{t('stormModal.centralPressure', 'Central Pressure')}: <b className="text-amber-300">{storm?.pressure || '975 hPa'}</b></span>
              </div>
            </div>

            {MARINE_NEWS_BULLETINS.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.severity === 'critical'
                    ? 'bg-red-950/40 border-red-500/40 hover:border-red-400'
                    : 'bg-[#081533]/80 border-sky-500/20 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                      item.severity === 'critical'
                        ? 'bg-red-500/30 text-red-300'
                        : 'bg-sky-500/20 text-cyan-300'
                    }`}>
                      {item.source}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-sky-500/20 mt-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('stormModal.syncFooter', 'High-accuracy rain models synchronized with IMD, NOAA, and ECMWF standards')}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
          >
            {t('stormModal.closeRadar', 'Close Weather Radar')}
          </button>
        </div>
      </div>
    </div>
  );
}
