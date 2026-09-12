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
        className="w-full max-w-md h-full bg-[#0A1720]/98 border-l border-[#193544] shadow-2xl backdrop-blur-xl flex flex-col select-none overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#193544] bg-[#0D202B]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#142D3A] border border-[#214555] flex items-center justify-center">
              <Sliders className="w-4 h-4 text-[#0C969C]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#CCD0CF] tracking-wide">
                {t('story.controls', 'Advanced Controls')}
              </h2>
              <p className="text-[10px] text-[#8FA8B2] font-mono">
                {activeRegion?.name || 'Ocean Basin'} • {depth}m depth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
            title={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Controls Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
          {/* SECTION 1: 3D Visualization Mode */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8FA8B2] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0C969C]" />
                {t('controls.viewMode', '3D View Mode')}
              </span>
              <span className="text-[10px] font-mono text-[#0C969C]">
                {VIEW_MODES.find(m => m.id === viewMode)?.label || viewMode}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {VIEW_MODES.map((mode) => {
                const isSel = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-3 py-2 rounded-xl text-left font-medium transition-all cursor-pointer border flex flex-col justify-between ${
                      isSel
                        ? 'bg-[#0C969C]/15 border-[#0C969C]/50 text-[#CCD0CF] shadow-sm'
                        : 'bg-[#0D202B] border-[#193544] text-[#8FA8B2] hover:bg-[#142D3A] hover:text-[#CCD0CF]'
                    }`}
                  >
                    <span className="font-semibold text-xs text-[#CCD0CF]">{mode.label}</span>
                    <span className="text-[9px] text-[#637C87] truncate mt-0.5">{mode.id}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: Shaders, Palettes & 3D Optics */}
          <section className="space-y-3 p-3.5 rounded-xl bg-[#0D202B] border border-[#193544]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8FA8B2] uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-[#0C969C]" />
              <span>{t('colorbar.settings', 'Colorbar & Shaders')}</span>
            </div>

            {/* Palette selection */}
            <div>
              <label className="text-[10px] text-[#8FA8B2] block mb-1 font-semibold">
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
                          ? 'border-[#0C969C] bg-[#0C969C]/15 text-[#CCD0CF] font-bold' 
                          : 'border-[#193544] bg-[#0A1720] text-[#8FA8B2] hover:bg-[#142D3A]'
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
                  <span className="text-[#8FA8B2]">{t('colorbar.layerOpacity', 'Layer Opacity')}</span>
                  <span className="font-mono text-[#0C969C]">{Math.round(layerOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={layerOpacity}
                  onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#142D3A] rounded-lg appearance-none cursor-pointer accent-[#0C969C]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#8FA8B2]">{t('colorbar.verticalExaggeration', 'Vertical Exaggeration')}</span>
                  <span className="font-mono text-[#0C969C]">{verticalExaggeration.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={verticalExaggeration}
                  onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#142D3A] rounded-lg appearance-none cursor-pointer accent-[#0C969C]"
                />
              </div>

              {/* Log Scale Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#8FA8B2] font-medium">
                  {t('colorbar.logScale', 'Logarithmic Mapping')}
                </span>
                <button
                  onClick={() => setIsLogScale(!isLogScale)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    isLogScale ? 'bg-[#0C969C]' : 'bg-[#193544]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isLogScale ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 3: Vertical Depth Stratification */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8FA8B2] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#0C969C]" />
                {t('controls.verticalDepth', 'Vertical Depth Stratification')}
              </span>
              <span className="text-[11px] font-mono font-bold text-[#0C969C]">{depth}m</span>
            </div>

            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#142D3A] rounded-lg appearance-none cursor-pointer accent-[#0C969C]"
            />

            {/* Depth presets */}
            <div className="flex flex-wrap gap-1">
              {[0, 20, 50, 100, 200, 500, 1000, 2000].map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer border ${
                    depth === d
                      ? 'bg-[#0C969C] text-[#06141B] font-bold border-[#0C969C]'
                      : 'bg-[#0D202B] text-[#8FA8B2] hover:bg-[#142D3A] hover:text-[#CCD0CF] border-[#193544]'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 4: Temporal Engine & Forecast Loop */}
          <section className="space-y-3 p-3.5 rounded-xl bg-[#0D202B] border border-[#193544]">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8FA8B2] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0C969C]" />
                {t('controls.timeStepper', 'Time Stepper & Forecast')}
              </span>
              <span className="text-[10px] font-mono text-[#0C969C] font-bold">
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
              className="w-full h-1.5 bg-[#142D3A] rounded-lg appearance-none cursor-pointer accent-[#0C969C]"
            />

            {/* Play/Pause & Speed Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-[#0C969C]/20 text-[#0C969C] border border-[#0C969C]/40'
                    : 'bg-[#142D3A] text-[#CCD0CF] border border-[#214555] hover:bg-[#183746]'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? t('controls.pause', 'Pause') : t('controls.play', 'Play')}</span>
              </button>

              <div className="flex items-center gap-1 bg-[#0A1720] p-1 rounded-xl border border-[#193544]">
                {[0.5, 1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimSpeed(speed)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      simSpeed === speed
                        ? 'bg-[#0C969C] text-[#06141B] font-bold'
                        : 'text-[#8FA8B2] hover:text-[#CCD0CF]'
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
              className="w-full py-2 rounded-xl bg-[#0A1720] hover:bg-[#142D3A] border border-[#193544] text-[#CCD0CF] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0C969C]" />
              <span>{selectedDate || 'Select Observation Date'}</span>
            </button>
          </section>

          {/* SECTION 5: Custom Coordinates Input */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8FA8B2] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#0C969C]" />
                {t('controls.positionCoords', 'Custom Coordinates')}
              </span>
              <button
                onClick={onOpenLocationModal}
                className="text-[10px] font-bold text-[#0C969C] hover:underline cursor-pointer"
              >
                {t('controls.changeBasin', 'Change Basin')}
              </button>
            </div>

            <form onSubmit={handleApplyCoords} className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-[#637C87] block mb-0.5 font-mono">
                  {t('controls.latitude', 'Latitude (°N)')}
                </label>
                <input
                  type="text"
                  value={inputLat}
                  onChange={(e) => setInputLat(e.target.value)}
                  placeholder="15.297"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#06141B] border border-[#193544] text-xs text-[#CCD0CF] font-mono focus:outline-none focus:border-[#0C969C]"
                />
              </div>
              <div>
                <label className="text-[9px] text-[#637C87] block mb-0.5 font-mono">
                  {t('controls.longitude', 'Longitude (°E)')}
                </label>
                <input
                  type="text"
                  value={inputLon}
                  onChange={(e) => setInputLon(e.target.value)}
                  placeholder="87.860"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#06141B] border border-[#193544] text-xs text-[#CCD0CF] font-mono focus:outline-none focus:border-[#0C969C]"
                />
              </div>
              <button
                type="submit"
                className="col-span-2 py-1.5 rounded-lg bg-[#0C969C] hover:bg-[#168FA0] text-[#06141B] font-bold transition-all cursor-pointer shadow-sm"
              >
                {t('controls.apply', 'Apply Coordinates')}
              </button>
            </form>
          </section>

          {/* SECTION 6: Specialized Tools & Modals Shortcuts */}
          <section className="space-y-2 pt-2 border-t border-[#193544]">
            <span className="text-[10px] font-bold text-[#637C87] uppercase tracking-wider block">
              {t('navbar.tools', 'Oceanographic Tool Suites')}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Storm Layer Toggle */}
              <button
                onClick={() => setIsStormLayerActive(!isStormLayerActive)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  isStormLayerActive
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-[#0D202B] border-[#193544] text-[#8FA8B2] hover:bg-[#142D3A] hover:text-[#CCD0CF]'
                }`}
              >
                <Zap className={`w-4 h-4 ${isStormLayerActive ? 'text-amber-400' : 'text-[#637C87]'}`} />
                <div className="leading-tight">
                  <div className="font-bold text-[11px]">{t('controls.meteorologicalThreatLayer', 'Storm Tracks')}</div>
                  <div className="text-[9px] text-[#637C87]">{isStormLayerActive ? 'Active' : 'Off'}</div>
                </div>
              </button>

              {/* Storm News */}
              <button
                onClick={onOpenStormNews}
                className="p-2.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] text-left flex items-center gap-2 text-[#8FA8B2] hover:text-[#CCD0CF] transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-[#CCD0CF]">Storm Bulletins</div>
                  <div className="text-[9px] text-[#637C87]">IMD / JTWC Tracks</div>
                </div>
              </button>

              {/* In-Situ Fleet */}
              <button
                onClick={onOpenFleetModal}
                className="p-2.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] text-left flex items-center gap-2 text-[#8FA8B2] hover:text-[#CCD0CF] transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 text-[#0C969C]" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-[#CCD0CF]">Observing Fleet</div>
                  <div className="text-[9px] text-[#637C87]">49 Platforms</div>
                </div>
              </button>

              {/* Anomaly Alerts */}
              <button
                onClick={onOpenAlerts}
                className="p-2.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] text-left flex items-center gap-2 text-[#8FA8B2] hover:text-[#CCD0CF] transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-[#CCD0CF]">AI Anomalies</div>
                  <div className="text-[9px] text-[#637C87]">Marine Heatwaves</div>
                </div>
              </button>

              {/* Depth Pressure */}
              <button
                onClick={onOpenDepthPressure}
                className="p-2.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] text-left flex items-center gap-2 text-[#8FA8B2] hover:text-[#CCD0CF] transition-all cursor-pointer"
              >
                <Gauge className="w-4 h-4 text-[#6BA3BE]" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-[#CCD0CF]">TEOS-10 Pressure</div>
                  <div className="text-[9px] text-[#637C87]">Hydrostatic dbar</div>
                </div>
              </button>

              {/* NetCDF Ingest */}
              <button
                onClick={onOpenNetcdfIngestion}
                className="p-2.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] text-left flex items-center gap-2 text-[#8FA8B2] hover:text-[#CCD0CF] transition-all cursor-pointer"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <div className="leading-tight">
                  <div className="font-bold text-[11px] text-[#CCD0CF]">NetCDF Ingestion</div>
                  <div className="text-[9px] text-[#637C87]">CF-1.8 Format</div>
                </div>
              </button>
            </div>

            {/* Analytic Report */}
            <button
              onClick={onOpenAnalyticReport}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] text-[#CCD0CF] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#0C969C]" />
              <span>{t('analytics.reportModalTitle', 'Generate In-Situ Validation Report')}</span>
            </button>
          </section>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#193544] bg-[#0D202B] text-center text-[10px] text-[#637C87] font-mono">
          Ocean Vision 3D Digital Twin Platform • v2.4 Live
        </div>
      </aside>
    </div>
  );
}
