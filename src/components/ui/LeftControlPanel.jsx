import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Flower2, 
  Sparkles, 
  Play, 
  Pause, 
  Calendar,
  ChevronRight,
  Compass,
  ArrowRight,
  Zap,
  Newspaper,
  Gauge
} from 'lucide-react';
import { PARAMETERS, DEPTH_LEVELS, calculateParameterAtDepth } from '../../data/oceanData';
import { getFormattedCurrentDate } from '../../utils/dateUtils';

export default function LeftControlPanel({
  selectedParam,
  setSelectedParam,
  depth,
  setDepth,
  timeHour,
  setTimeHour,
  isPlaying,
  setIsPlaying,
  simSpeed,
  setSimSpeed,
  activeRegion,
  onOpenLocationModal,
  onCustomCoords,
  selectedDate = getFormattedCurrentDate(),
  onOpenDatePicker,
  onOpenStormNews,
  isStormLayerActive,
  setIsStormLayerActive,
  onOpenDepthPressure
}) {
  const { t } = useTranslation();
  const [prevRegionId, setPrevRegionId] = useState(activeRegion?.id);
  const [inputLat, setInputLat] = useState(activeRegion?.lat?.toString() || '15.297');
  const [inputLon, setInputLon] = useState(activeRegion?.lon?.toString() || '87.860');

  if (activeRegion && activeRegion.id !== prevRegionId) {
    setPrevRegionId(activeRegion.id);
    setInputLat(activeRegion.lat?.toString() || '');
    setInputLon(activeRegion.lon?.toString() || '');
  }

  const handleApplyCoords = (e) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lon = parseFloat(inputLon);
    if (!isNaN(lat) && !isNaN(lon) && onCustomCoords) {
      onCustomCoords(lat, lon);
    }
  };

  const paramIcons = {
    sst: Thermometer,
    salinity: Droplets,
    currents: Wind,
    wave: Activity,
    chlorophyll: Flower2,
    oxygen: Sparkles
  };

  const formatTime = (h) => {
    const hh = String(Math.floor(h)).padStart(2, '0');
    const mm = String(Math.floor((h % 1) * 60)).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return (
    <aside className="w-72 h-full flex flex-col gap-3 p-3 select-none overflow-y-auto z-20">
      {/* 0. Location & Coordinates Operator Card */}
      <div className="glass-panel rounded-2xl p-3.5 border border-sky-500/30 shadow-cockpit">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('controls.positionCoords', 'Position / Coordinates')}</span>
          </div>
          <button
            onClick={onOpenLocationModal}
            className="text-[10px] font-bold text-cyan-400 hover:text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/30 transition-colors cursor-pointer"
          >
            {t('controls.changeBasin', 'Change Basin')}
          </button>
        </div>

        <div className="mb-2 px-1">
          <div className="text-xs font-bold text-white truncate">{activeRegion?.name || 'Bay of Bengal'}</div>
          <div className="text-[10px] font-mono text-sky-300/80">{activeRegion?.coords || '15.297° N, 87.860° E'}</div>
        </div>

        {/* Inline Latitude & Longitude Input Form */}
        <form onSubmit={handleApplyCoords} className="bg-[#050e24]/90 p-2.5 rounded-xl border border-sky-500/20 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] font-mono text-slate-400 block mb-0.5">Lat (°N/S)</span>
              <input
                type="number"
                step="0.001"
                min="-90"
                max="90"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                placeholder="15.297"
                className="w-full px-2 py-1 rounded-lg bg-[#020817] border border-sky-500/30 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block mb-0.5">Lon (°E/W)</span>
              <input
                type="number"
                step="0.001"
                min="-180"
                max="180"
                value={inputLon}
                onChange={(e) => setInputLon(e.target.value)}
                placeholder="87.860"
                className="w-full px-2 py-1 rounded-lg bg-[#020817] border border-sky-500/30 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1 rounded-lg bg-sky-600/70 hover:bg-cyan-500 hover:text-slate-950 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-glow-cyan"
          >
            <span>{t('locationModal.targetCustom', 'Target Coordinates')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 1. Parameters Selection Card */}
      <div className="glass-panel rounded-2xl p-3.5 border border-sky-500/20">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
            {t('controls.oceanParameters', 'Parameters')}
          </span>
          <span className="text-[10px] text-sky-400/80 font-mono">{t('enso.variablesCount', '6 Variables')}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {Object.values(PARAMETERS).map((param) => {
            const Icon = paramIcons[param.id] || Activity;
            const isSelected = selectedParam === param.id;

            return (
              <button
                key={param.id}
                onClick={() => setSelectedParam(param.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-600/90 to-blue-700/90 text-white shadow-glow-cyan border border-cyan-400/50'
                    : 'bg-[#0a1838]/60 text-slate-300 hover:bg-[#112450]/80 hover:text-white border border-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-sky-500/10 text-sky-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-tight">
                      {t(`parameters.${param.id}`, param.name)}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-cyan-300">
                      {calculateParameterAtDepth(param.id, depth, activeRegion)} {param.unit}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'text-cyan-100 bg-cyan-500/30 border border-cyan-400/40' : 'text-slate-400 bg-[#06122d]'}`}>
                  {depth}m
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Stepped Depth (m) Vertical Slider Card */}
      <div className="glass-panel rounded-2xl p-3.5 border border-sky-500/20">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
            {t('controls.verticalDepth', 'Depth (m)')}
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/30">
            {depth} m
          </span>
        </div>

        {/* Stepped vertical depth track */}
        <div className="relative flex flex-col gap-1.5 pl-3 py-1">
          {/* Vertical line connector */}
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-sky-900/80 -z-0" />
          
          {DEPTH_LEVELS.map((lvl) => {
            const isCurrent = depth === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setDepth(lvl)}
                className="relative z-10 flex items-center gap-3 text-left py-0.5 group transition-colors"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-cyan-400 border-white shadow-glow-cyan scale-125'
                      : 'bg-[#081530] border-sky-600 group-hover:border-cyan-400 group-hover:scale-110'
                  }`}
                >
                  {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-[#030712]" />}
                </div>
                <span
                  className={`text-xs font-mono transition-colors ${
                    isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </span>
              </button>
            );
          })}
        </div>

        {/* Depth & Hydrostatic Pressure Quick Tool Button */}
        <button
          onClick={onOpenDepthPressure}
          className="w-full mt-3 py-2 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-[11px] font-bold text-cyan-300 flex items-center justify-between transition-all cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('controls.hydrostaticPressure', 'Pressure Calculator')} (dbar/atm)</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Time Scrubber & Playback Card */}
      <div className="glass-panel rounded-2xl p-3.5 border border-sky-500/20">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
            {t('controls.timeStepper', 'Time')}
          </span>
          <span className="text-xs font-mono text-cyan-300 font-semibold">
            {formatTime(timeHour)} UTC
          </span>
        </div>

        {/* Date Selector Badge */}
        <div 
          onClick={onOpenDatePicker}
          className="flex items-center justify-between px-3 py-1.5 mb-3 bg-[#0a1838]/80 hover:bg-[#12285a] border border-sky-500/20 hover:border-cyan-400 rounded-xl text-xs text-sky-200 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white">{selectedDate}</span>
          </div>
          <button className="text-[11px] text-cyan-400 hover:underline">{t('common.change', 'Change')}</button>
        </div>

        {/* Scrubber Range Slider */}
        <div className="px-1 mb-2">
          <input
            type="range"
            min="0"
            max="23"
            step="0.25"
            value={timeHour}
            onChange={(e) => setTimeHour(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-sky-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/30 transition-all flex items-center justify-center shadow-glow-cyan"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
          </button>

          <div className="flex items-center gap-1 bg-[#091636] p-1 rounded-xl border border-sky-500/20 text-[11px] font-mono">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  simSpeed === spd
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-sky-300 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Storm, Rain & Marine Cyclone Threat Card */}
      <div className="glass-panel rounded-2xl p-3.5 border border-red-500/30 bg-gradient-to-b from-[#18091c]/80 to-[#07132e]/80">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
            <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>{t('controls.meteorologicalThreatLayer', 'Storm & Rain Threat')}</span>
          </div>
          <button
            onClick={() => setIsStormLayerActive && setIsStormLayerActive(!isStormLayerActive)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              isStormLayerActive
                ? 'bg-red-500/30 text-red-300 border-red-400/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
          >
            {isStormLayerActive ? t('controls.stormOn', '3D Storm: ON') : t('controls.stormOff', '3D Storm: OFF')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-2.5 font-mono text-center">
          <div className="bg-[#120716] p-1.5 rounded-xl border border-sky-500/20">
            <div className="text-[8.5px] text-slate-400 uppercase">{t('stormModal.rainChance', 'Rain Chance')}</div>
            <div className="text-xs font-bold text-cyan-300">
              {activeRegion?.rainProbability ?? 35}%
            </div>
          </div>
          <div className="bg-[#120716] p-1.5 rounded-xl border border-sky-500/20">
            <div className="text-[8.5px] text-slate-400 uppercase">{t('stormModal.rainRate', 'Rain Rate')}</div>
            <div className="text-xs font-bold text-amber-300">
              {activeRegion?.rainRate ?? 1.5} <span className="text-[7.5px]">mm/h</span>
            </div>
          </div>
          <div className="bg-[#120716] p-1.5 rounded-xl border border-red-500/20">
            <div className="text-[8.5px] text-slate-400 uppercase">{t('stormModal.stormRisk', 'Storm Risk')}</div>
            <div className="text-xs font-bold text-red-400">
              {activeRegion?.stormProbability ?? 30}%
            </div>
          </div>
          <div className="bg-[#120716] p-1.5 rounded-xl border border-sky-500/20">
            <div className="text-[8.5px] text-slate-400 uppercase">{t('stormModal.breakerSwell', 'Wave Swell')}</div>
            <div className="text-xs font-bold text-sky-200">
              {activeRegion?.waveHeight ?? 1.65} <span className="text-[7.5px]">m</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenStormNews}
          className="w-full py-1.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-300 flex items-center justify-between transition-colors shadow-glow-red cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5" />
            <span>{t('controls.severeStormTracks', 'Position Storm News')}</span>
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
