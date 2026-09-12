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
  onOpenDepthPressure,
  onAskCopilot
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
    <aside className="w-72 h-full flex flex-col gap-2.5 p-2.5 select-none overflow-y-auto z-20 custom-scrollbar text-[#CCD0CF]">
      {/* 0. Location & Coordinates Operator Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            <Compass className="w-3.5 h-3.5 text-[#0C969C]" />
            <span>{t('controls.positionCoords', 'Position / Coordinates')}</span>
          </div>
          <button
            onClick={onOpenLocationModal}
            className="text-[10px] font-medium text-[#CCD0CF] hover:text-white bg-[#142D3A] hover:bg-[#183746] px-2 py-0.5 rounded border border-[#214555] transition-colors cursor-pointer"
          >
            {t('controls.changeBasin', 'Change Basin')}
          </button>
        </div>

        <div className="mb-2">
          <div className="text-xs font-semibold text-[#CCD0CF] truncate">{activeRegion?.name || 'Bay of Bengal'}</div>
          <div className="text-[10px] font-mono text-[#637C87]">{activeRegion?.coords || '15.297° N, 87.860° E'}</div>
        </div>

        {/* Inline Latitude & Longitude Input Form */}
        <form onSubmit={handleApplyCoords} className="bg-[#0A1720] p-2 rounded-lg border border-[#193544] flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] font-mono text-[#637C87] block mb-0.5">Lat (°N/°S)</span>
              <input
                type="number"
                step="0.001"
                min="-90"
                max="90"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                placeholder="15.297"
                className="w-full px-2 py-1 rounded bg-[#06141B] border border-[#193544] text-xs font-mono text-[#CCD0CF] focus:outline-none focus:border-[#0C969C]"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#637C87] block mb-0.5">Lon (°E/°W)</span>
              <input
                type="number"
                step="0.001"
                min="-180"
                max="180"
                value={inputLon}
                onChange={(e) => setInputLon(e.target.value)}
                placeholder="87.860"
                className="w-full px-2 py-1 rounded bg-[#06141B] border border-[#193544] text-xs font-mono text-[#CCD0CF] focus:outline-none focus:border-[#0C969C]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-[#142D3A] hover:bg-[#183746] border border-[#214555] hover:border-[#0C969C] text-[#CCD0CF] text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{t('locationModal.targetCustom', 'Target Custom Coordinates')}</span>
            <ArrowRight className="w-3 h-3 text-[#6BA3BE]" />
          </button>
        </form>
      </div>

      {/* 1. Parameters Selection Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            {t('controls.oceanParameters', 'Ocean Parameters')}
          </span>
          <div className="flex items-center gap-1.5">
            {onAskCopilot && (
              <button
                onClick={() => onAskCopilot(`Explain ocean parameter ${selectedParam.toUpperCase()} at ${depth}m depth in ${activeRegion?.name || 'this basin'}`)}
                className="text-[10px] font-mono text-[#6BA3BE] hover:text-white bg-[#142D3A] hover:bg-[#183746] px-2 py-0.5 rounded border border-[#214555] flex items-center gap-1 transition-colors cursor-pointer"
                title="Ask AI Copilot to explain this parameter"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#0C969C]" />
                <span>Explain</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {Object.values(PARAMETERS).map((param) => {
            const Icon = paramIcons[param.id] || Activity;
            const isSelected = selectedParam === param.id;

            return (
              <button
                key={param.id}
                onClick={() => setSelectedParam(param.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-[rgba(12,150,156,0.12)] border-[rgba(12,150,156,0.65)] text-[#CCD0CF]'
                    : 'bg-[#0A1720] hover:bg-[#142D3A] text-[#8FA8B2] hover:text-[#CCD0CF] border-[#193544]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${isSelected ? 'text-[#0C969C]' : 'text-[#637C87]'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className={`text-xs ${isSelected ? 'font-semibold text-[#CCD0CF]' : 'font-medium text-[#8FA8B2]'}`}>
                      {t(`parameters.${param.id}`, param.name)}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-[#CCD0CF]">
                      {calculateParameterAtDepth(param.id, depth, activeRegion)} {param.unit}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  isSelected 
                    ? 'text-[#6BA3BE] bg-[#142D3A] border-[#214555]' 
                    : 'text-[#637C87] bg-[#0D202B] border-[#193544]'
                }`}>
                  {depth}m ›
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Stepped Depth (m) Vertical Slider Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            {t('controls.verticalDepth', 'Depth (m)')}
          </span>
          <span className="text-xs font-mono font-semibold text-[#0C969C] bg-[#142D3A] px-2 py-0.5 rounded border border-[#214555]">
            {depth} m
          </span>
        </div>

        {/* Stepped vertical depth track */}
        <div className="relative flex flex-col gap-1 pl-2 py-0.5">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-[#193544] -z-0" />
          
          {DEPTH_LEVELS.map((lvl) => {
            const isCurrent = depth === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setDepth(lvl)}
                className="relative z-10 flex items-center gap-2.5 text-left py-0.5 group transition-colors cursor-pointer"
              >
                <div
                  className={`w-3 h-3 rounded-full border transition-all duration-150 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#0C969C] border-[#CCD0CF]'
                      : 'bg-[#06141B] border-[#214555] group-hover:border-[#0C969C]'
                  }`}
                >
                  {isCurrent && <div className="w-1 h-1 rounded-full bg-[#06141B]" />}
                </div>
                <span
                  className={`text-xs font-mono transition-colors ${
                    isCurrent ? 'text-[#CCD0CF] font-semibold' : 'text-[#637C87] group-hover:text-[#8FA8B2]'
                  }`}
                >
                  {lvl}m
                </span>
              </button>
            );
          })}
        </div>

        {/* Depth & Hydrostatic Pressure Quick Tool Button */}
        <button
          onClick={onOpenDepthPressure}
          className="w-full mt-2.5 py-1.5 px-2.5 rounded-lg bg-[#142D3A] hover:bg-[#183746] border border-[#214555] hover:border-[#0C969C] text-[11px] font-medium text-[#CCD0CF] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#0C969C]" />
            <span>{t('controls.hydrostaticPressure', 'Pressure Calculator')}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#637C87]" />
        </button>
      </div>

      {/* 3. Time Scrubber & Playback Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            {t('controls.timeStepper', 'Time Stepper')}
          </span>
          <span className="text-xs font-mono text-[#0C969C] font-medium">
            {formatTime(timeHour)} UTC
          </span>
        </div>

        {/* Date Selector Badge */}
        <div 
          onClick={onOpenDatePicker}
          className="flex items-center justify-between px-2.5 py-1.5 mb-2 bg-[#0A1720] hover:bg-[#142D3A] border border-[#193544] hover:border-[#214555] rounded-lg text-xs cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#0C969C]" />
            <span className="font-semibold text-[#CCD0CF]">{selectedDate}</span>
          </div>
          <span className="text-[10px] text-[#6BA3BE] font-medium">{t('common.change', 'Change')}</span>
        </div>

        {/* Scrubber Range Slider */}
        <div className="mb-2">
          <input
            type="range"
            min="0"
            max="23"
            step="0.25"
            value={timeHour}
            onChange={(e) => setTimeHour(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#193544] rounded-lg appearance-none cursor-pointer accent-[#0C969C]"
          />
          <div className="flex justify-between text-[9px] font-mono text-[#637C87] mt-0.5">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex items-center justify-between pt-2 border-t border-[#193544]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-[#142D3A] text-[#CCD0CF] hover:text-white hover:bg-[#183746] border border-[#214555] transition-colors flex items-center justify-center cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5" />}
          </button>

          <div className="flex items-center gap-1 bg-[#0A1720] p-0.5 rounded-lg border border-[#193544] text-[10px] font-mono">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                  simSpeed === spd
                    ? 'bg-[#0C969C] text-[#06141B] font-bold'
                    : 'text-[#8FA8B2] hover:text-[#CCD0CF]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Storm, Rain & Marine Cyclone Threat Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            <Zap className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>{t('controls.meteorologicalThreatLayer', 'Storm Threat')}</span>
          </div>
          <button
            onClick={() => setIsStormLayerActive && setIsStormLayerActive(!isStormLayerActive)}
            className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              isStormLayerActive
                ? 'bg-[#C85A5A]/20 text-[#CCD0CF] border-[#C85A5A]/50 font-semibold'
                : 'bg-[#0A1720] text-[#8FA8B2] border-[#193544]'
            }`}
          >
            {isStormLayerActive ? t('controls.stormOn', '3D Storm: ON') : t('controls.stormOff', '3D Storm: OFF')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-2 font-mono text-center">
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[8px] text-[#637C87] uppercase">{t('stormModal.rainChance', 'Rain Chance')}</div>
            <div className="text-xs font-semibold text-[#CCD0CF]">
              {activeRegion?.rainProbability ?? 35}%
            </div>
          </div>
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[8px] text-[#637C87] uppercase">{t('stormModal.rainRate', 'Rain Rate')}</div>
            <div className="text-xs font-semibold text-[#CCD0CF]">
              {activeRegion?.rainRate ?? 1.5} <span className="text-[8px] text-[#637C87]">mm/h</span>
            </div>
          </div>
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[8px] text-[#637C87] uppercase">{t('stormModal.stormRisk', 'Storm Risk')}</div>
            <div className="text-xs font-semibold text-[#D6A84F]">
              {activeRegion?.stormProbability ?? 30}%
            </div>
          </div>
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[8px] text-[#637C87] uppercase">{t('stormModal.breakerSwell', 'Wave Swell')}</div>
            <div className="text-xs font-semibold text-[#6BA3BE]">
              {activeRegion?.waveHeight ?? 1.65} <span className="text-[8px] text-[#637C87]">m</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenStormNews}
          className="w-full py-1.5 px-2.5 rounded-lg bg-[#142D3A] hover:bg-[#183746] border border-[#214555] hover:border-[#0C969C] text-xs font-medium text-[#CCD0CF] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-[#0C969C]" />
            <span>{t('controls.severeStormTracks', 'Storm Bulletins')}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#637C87]" />
        </button>
      </div>
    </aside>
  );
}
