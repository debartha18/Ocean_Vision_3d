import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Layers, 
  Eye, 
  Palette, 
  Sliders, 
  Clock, 
  Play, 
  Pause, 
  Compass, 
  Zap, 
  ShieldAlert, 
  Radio, 
  Gauge, 
  Database, 
  FileText, 
  Calendar,
  Waves,
  Maximize2
} from 'lucide-react';
import { VIEW_MODES, DEPTH_LEVELS, PARAMETERS } from '../../data/oceanData';
import { COLOR_PALETTES } from './ColorbarSettingsModal';

export default function AdvancedControlsDrawer({
  isOpen,
  onClose,
  viewMode,
  setViewMode,
  depth,
  setDepth,
  selectedParam,
  setSelectedParam,
  palette,
  setPalette,
  layerOpacity,
  setLayerOpacity,
  verticalExaggeration,
  setVerticalExaggeration,
  isLogScale,
  setIsLogScale,
  timeHour,
  setTimeHour,
  isPlaying,
  setIsPlaying,
  simSpeed,
  setSimSpeed,
  selectedDate,
  onOpenDatePicker,
  activeRegion,
  onCustomCoords,
  isStormLayerActive,
  setIsStormLayerActive,
  onOpenStormNews,
  onOpenFleetModal,
  onOpenAlerts,
  onOpenDepthPressure,
  onOpenNetcdfIngestion,
  onOpenAnalyticReport,
  onOpenLocationModal
}) {
  const { t } = useTranslation();
  const [inputLat, setInputLat] = useState(activeRegion?.lat?.toString() || '15.297');
  const [inputLon, setInputLon] = useState(activeRegion?.lon?.toString() || '87.860');

  // Sync inputs with active region changes
  useEffect(() => {
    if (activeRegion?.lat !== undefined) {
      setInputLat(activeRegion.lat.toString());
    }
    if (activeRegion?.lon !== undefined) {
      setInputLon(activeRegion.lon.toString());
    }
  }, [activeRegion?.lat, activeRegion?.lon]);

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleApplyCoords = (e) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lon = parseFloat(inputLon);
    if (!isNaN(lat) && !isNaN(lon) && onCustomCoords) {
      onCustomCoords(lat, lon);
    }
  };

  const formatTime = (h) => {
    const hh = String(Math.floor(h)).padStart(2, '0');
    const mm = String(Math.floor((h % 1) * 60)).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over Content */}
      <aside 
        role="dialog"
        aria-modal="true"
        aria-label={t('story.controls', 'Advanced Controls')}
        className="w-full max-w-md h-full bg-[#06112c]/95 border-l border-sky-500/30 shadow-2xl backdrop-blur-xl flex flex-col select-none overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-sky-500/20 bg-[#08173d]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {t('story.controls', 'Advanced Controls')}
              </h2>
              <p className="text-[10px] text-sky-300/70 font-mono">
                {activeRegion?.name || 'Ocean Basin'} • {depth}m depth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Controls Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
          {/* SECTION 1: 3D Visualization Mode */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                {t('controls.viewMode', '3D View Mode')}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {VIEW_MODES[viewMode]?.label || viewMode}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(VIEW_MODES).map(([k, mode]) => {
                const isSel = viewMode === k;
                return (
                  <button
                    key={k}
                    onClick={() => setViewMode(k)}
                    className={`px-3 py-2 rounded-xl text-left font-medium transition-all cursor-pointer border flex flex-col justify-between ${
                      isSel
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-[#0a183d]/60 border-sky-500/20 text-slate-300 hover:bg-[#0f2356] hover:text-white'
                    }`}
                  >
                    <span className="font-semibold text-xs">{mode.label}</span>
                    <span className="text-[9px] text-sky-300/60 truncate mt-0.5">{mode.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: Shaders, Palettes & 3D Optics */}
          <section className="space-y-3 p-3.5 rounded-2xl bg-[#09183d]/50 border border-sky-500/20">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('colorbar.settings', 'Colorbar & Shaders')}</span>
            </div>

            {/* Palette selection */}
            <div>
              <label className="text-[10px] text-slate-300 block mb-1 font-semibold">
                {t('colorbar.palette', 'Spectral Color Palette')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_PALETTES.map((p) => {
                  const isSel = palette === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPalette(p.id)}
                      className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isSel 
                          ? 'border-cyan-400 bg-cyan-500/20 text-white font-bold' 
                          : 'border-sky-500/20 bg-[#06122d]/60 text-slate-300 hover:bg-[#0b1d47]'
                      }`}
                    >
                      <div className="h-2 rounded mb-1 w-full" style={{ background: p.gradientCss }} />
                      <span className="text-[10px] capitalize">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opacity & Exaggeration */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-300">{t('colorbar.layerOpacity', 'Layer Opacity')}</span>
                  <span className="font-mono text-cyan-300">{Math.round(layerOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={layerOpacity}
                  onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-300">{t('colorbar.verticalExaggeration', 'Vertical Exaggeration')}</span>
                  <span className="font-mono text-cyan-300">{verticalExaggeration.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={verticalExaggeration}
                  onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Log Scale Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-300 font-medium">
                  {t('colorbar.logScale', 'Logarithmic Mapping')}
                </span>
                <button
                  onClick={() => setIsLogScale(!isLogScale)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    isLogScale ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isLogScale ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 3: Vertical Depth Stratification */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                {t('controls.verticalDepth', 'Vertical Depth Stratification')}
              </span>
              <span className="text-[11px] font-mono font-bold text-cyan-300">{depth}m</span>
            </div>

            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-950 rounded-lg appearance-none cursor-pointer accent-cyan-300"
            />

            {/* Depth presets */}
            <div className="flex flex-wrap gap-1">
              {[0, 20, 50, 100, 200, 500, 1000, 2000].map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    depth === d
                      ? 'bg-cyan-500 text-white font-bold'
                      : 'bg-[#0b1d47]/80 text-sky-300 hover:bg-[#122c6b] hover:text-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 4: Temporal Engine & Forecast Loop */}
          <section className="space-y-3 p-3.5 rounded-2xl bg-[#09183d]/50 border border-sky-500/20">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {t('controls.timeStepper', 'Time Stepper & Forecast')}
              </span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                {formatTime(timeHour)} UTC
              </span>
            </div>

            {/* Timeline Slider */}
            <input
              type="range"
              min="0"
              max="24"
              step="0.1"
              value={timeHour}
              onChange={(e) => setTimeHour(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Play/Pause & Speed Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? t('controls.pause', 'Pause') : t('controls.play', 'Play')}</span>
              </button>

              <div className="flex items-center gap-1 bg-[#06122d] p-1 rounded-xl border border-sky-500/20">
                {[0.5, 1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      simSpeed === speed
                        ? 'bg-cyan-500 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker Button */}
            <button
              onClick={onOpenDatePicker}
              className="w-full py-2 rounded-xl bg-[#0a183d] hover:bg-[#102761] border border-sky-500/30 text-sky-200 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedDate || 'Select Observation Date'}</span>
            </button>
          </section>

          {/* SECTION 5: Custom Coordinates Input */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                {t('controls.positionCoords', 'Custom Coordinates')}
              </span>
              <button
                onClick={onOpenLocationModal}
                className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                {t('controls.changeBasin', 'Change Basin')}
              </button>
            </div>

            <form onSubmit={handleApplyCoords} className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5 font-mono">
                  {t('controls.latitude', 'Latitude (°N)')}
                </label>
                <input
                  type="text"
                  value={inputLat}
                  onChange={(e) => setInputLat(e.target.value)}
                  placeholder="15.297"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#040c20] border border-sky-500/30 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5 font-mono">
                  {t('controls.longitude', 'Longitude (°E)')}
                </label>
                <input
                  type="text"
                  value={inputLon}
                  onChange={(e) => setInputLon(e.target.value)}
                  placeholder="87.860"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#040c20] border border-sky-500/30 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                className="col-span-2 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all cursor-pointer shadow-glow-cyan"
              >
                {t('controls.apply', 'Apply Coordinates')}
              </button>
            </form>
          </section>

          {/* SECTION 6: Specialized Tools & Modals Shortcuts */}
          <section className="space-y-2 pt-2 border-t border-sky-500/20">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('navbar.tools', 'Oceanographic Tool Suites')}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Storm Layer Toggle */}
              <button
                onClick={() => setIsStormLayerActive(!isStormLayerActive)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isStormLayerActive
                    ? 'bg-red-500/20 border-red-500/50 text-red-300'
                    : 'bg-[#09183d]/60 border-sky-500/20 text-slate-300 hover:bg-[#0e245a]'
                }`}
              >
                <Zap className={`w-4 h-4 ${isStormLayerActive ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                <div className="leading-tight">
                  <div className="font-bold text-[11px]">{t('controls.meteorologicalThreatLayer', 'Storm Tracks')}</div>
                  <div className="text-[9px] text-slate-400">{isStormLayerActive ? 'Active' : 'Off'}</div>
                </div>
              </button>

              {/* Storm News */}
              <button
                onClick={onOpenStormNews}
                className="p-2.5 rounded-xl bg-[#09183d]/60 hover:bg-[#0e245a] border border-sky-500/20 text-left flex items-center gap-2 text-slate-300 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-white">Storm Bulletins</div>
                  <div className="text-[9px] text-slate-400">IMD / JTWC Tracks</div>
                </div>
              </button>

              {/* In-Situ Fleet */}
              <button
                onClick={onOpenFleetModal}
                className="p-2.5 rounded-xl bg-[#09183d]/60 hover:bg-[#0e245a] border border-sky-500/20 text-left flex items-center gap-2 text-slate-300 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-white">Observing Fleet</div>
                  <div className="text-[9px] text-slate-400">49 Platforms</div>
                </div>
              </button>

              {/* Anomaly Alerts */}
              <button
                onClick={onOpenAlerts}
                className="p-2.5 rounded-xl bg-[#09183d]/60 hover:bg-[#0e245a] border border-sky-500/20 text-left flex items-center gap-2 text-slate-300 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-white">AI Anomalies</div>
                  <div className="text-[9px] text-slate-400">Marine Heatwaves</div>
                </div>
              </button>

              {/* Depth Pressure */}
              <button
                onClick={onOpenDepthPressure}
                className="p-2.5 rounded-xl bg-[#09183d]/60 hover:bg-[#0e245a] border border-sky-500/20 text-left flex items-center gap-2 text-slate-300 transition-all cursor-pointer"
              >
                <Gauge className="w-4 h-4 text-indigo-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-white">TEOS-10 Pressure</div>
                  <div className="text-[9px] text-slate-400">Hydrostatic dbar</div>
                </div>
              </button>

              {/* NetCDF Ingest */}
              <button
                onClick={onOpenNetcdfIngestion}
                className="p-2.5 rounded-xl bg-[#09183d]/60 hover:bg-[#0e245a] border border-sky-500/20 text-left flex items-center gap-2 text-slate-300 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-white">NetCDF Ingestion</div>
                  <div className="text-[9px] text-slate-400">CF-1.8 Format</div>
                </div>
              </button>
            </div>

            {/* Analytic Report */}
            <button
              onClick={onOpenAnalyticReport}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600/30 to-cyan-600/30 hover:from-sky-600/50 hover:to-cyan-600/50 border border-cyan-500/30 text-cyan-200 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-300" />
              <span>{t('analytics.reportModalTitle', 'Generate In-Situ Validation Report')}</span>
            </button>
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-sky-500/20 bg-[#08173d]/80 text-center text-[10px] text-sky-300/60 font-mono">
          Ocean Vision 3D Digital Twin Platform • v2.4 Live
        </div>
      </aside>
    </div>
  );
}
