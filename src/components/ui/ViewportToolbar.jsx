import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Globe, 
  Layers, 
  MapPin, 
  ChevronDown,
  Box,
  Boxes,
  Maximize2,
  Compass,
  Zap,
  Sliders
} from 'lucide-react';
import { PARAMETERS, VIEW_MODES } from '../../data/oceanData';
import { COLOR_PALETTES } from './ColorbarSettingsModal';

export default function ViewportToolbar({
  selectedParam,
  viewMode,
  setViewMode,
  onResetCamera,
  onToggleGlobe,
  onOpenLocationModal,
  onOpenWorldMap,
  isStormLayerActive,
  setIsStormLayerActive,
  onOpenColorbarSettings,
  palette = 'turbo',
  isLogScale = false,
  customRanges = {},
  regionName = 'Bay of Bengal',
  regionCoords = '15.297° N, 87.860° E'
}) {
  const { t } = useTranslation();
  const currentParam = PARAMETERS[selectedParam] || PARAMETERS.sst;

  const activeRange = customRanges[selectedParam] || {
    min: currentParam.min,
    max: currentParam.max
  };

  const activePaletteObj = COLOR_PALETTES.find((p) => p.id === palette) || COLOR_PALETTES[0];
  const activeGradient = palette === 'default' ? currentParam.gradientCss : activePaletteObj.gradientCss;

  // Generate 5 dynamic tick labels
  const ticks = React.useMemo(() => {
    const min = activeRange.min;
    const max = activeRange.max;
    if (isLogScale && min > 0) {
      const logMin = Math.log10(min);
      const logMax = Math.log10(max);
      return [0, 0.25, 0.5, 0.75, 1].map((r) => {
        const val = Math.pow(10, logMin + r * (logMax - logMin));
        return parseFloat(val.toFixed(val < 1 ? 2 : 1));
      });
    }
    return [0, 0.25, 0.5, 0.75, 1].map((r) => {
      const val = min + r * (max - min);
      return parseFloat(val.toFixed(val < 10 ? 1 : 0));
    });
  }, [activeRange, isLogScale]);

  const modeIcons = {
    surface: Layers,
    depth_slice: Box,
    volume: Boxes,
    isosurface: Maximize2,
    vector_field: Compass
  };

  return (
    <>
      {/* 1. Top-Left Location Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div 
          onClick={onOpenLocationModal}
          title="Click to change ocean basin or coordinates"
          className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-2.5 border border-sky-500/30 shadow-cockpit cursor-pointer hover:border-cyan-400 hover:scale-[1.02] transition-all"
        >
          <div className="p-1 rounded-lg bg-sky-500/20 text-cyan-300">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              {regionName}
              <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-[10px] font-mono text-sky-300/80">
              {regionCoords}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Left Floating Tool Stack */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-1.5">
        <div className="glass-panel p-1.5 rounded-2xl flex flex-col gap-1 border border-sky-500/20 shadow-cockpit">
          <button
            onClick={onResetCamera}
            title="Reset Camera View (Home)"
            className="p-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenWorldMap || onToggleGlobe}
            title="Open Interactive World Map"
            className="p-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsStormLayerActive && setIsStormLayerActive(!isStormLayerActive)}
            title="Toggle 3D Storm, Tornado & Cyclone System"
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              isStormLayerActive
                ? 'bg-red-500/30 text-red-300 shadow-glow-red'
                : 'text-sky-300 hover:text-white hover:bg-sky-500/20'
            }`}
          >
            <Zap className={`w-4 h-4 ${isStormLayerActive ? 'animate-pulse' : ''}`} />
          </button>
          <button
            onClick={onOpenColorbarSettings}
            title="Colorbar Editor, Opacity & 3D Depth Exaggeration"
            className="p-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Top-Right Dynamic Colorbar Legend */}
      <div className="absolute top-4 right-4 z-20">
        <div 
          onClick={onOpenColorbarSettings}
          title="Click to customize palette, bounds, log scale, or vertical depth exaggeration"
          className="glass-panel px-4 py-2.5 rounded-2xl border border-sky-500/30 shadow-cockpit min-w-[250px] cursor-pointer hover:border-cyan-400/60 hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span>{t(`parameters.${currentParam.id}`, currentParam.name)}</span>
              {isLogScale && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">log₁₀</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300 text-[11px]">({currentParam.unit})</span>
              <div className="p-1 rounded bg-sky-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Continuous gradient strip */}
          <div
            className="h-2.5 w-full rounded-md shadow-inner border border-white/20 mb-1"
            style={{ background: activeGradient }}
          />

          {/* Scale tick numbers */}
          <div className="flex justify-between text-[10px] font-mono text-sky-200/90 font-medium">
            {ticks.map((val, idx) => (
              <span key={idx}>{val}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Center-Bottom 3D View Mode Selector Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 border border-sky-500/30 shadow-cockpit">
          {VIEW_MODES.map((mode) => {
            const Icon = modeIcons[mode.id] || Layers;
            const isActive = viewMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-glow-cyan border border-cyan-300/40'
                    : 'text-slate-300 hover:text-white hover:bg-sky-500/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(`viewModes.${mode.id}`, mode.label)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom-Right OCEANOVA 3D Ocean Model Insignia Badge */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto hidden sm:block">
        <div 
          title="OCEANOVA | Explore • Analyze • Preserve"
          className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-2.5 border border-sky-500/30 shadow-cockpit backdrop-blur-md bg-[#050e26]/85 hover:border-cyan-400/60 transition-all group"
        >
          <img
            src="/oceanova-logo.jpg"
            alt="OCEANOVA 3D Model"
            className="w-9 h-9 rounded-xl object-cover border border-cyan-400/50 shadow-glow-cyan group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                OCEANOVA
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                {t('brand.badge3d', '3D MODEL')}
              </span>
            </div>
            <span className="text-[9px] font-semibold tracking-wider text-sky-300/75 uppercase">
              {t('brand.motto', 'Explore • Analyze • Preserve')}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
