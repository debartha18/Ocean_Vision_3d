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
      <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
        <div 
          onClick={onOpenLocationModal}
          title="Click to change ocean basin or coordinates"
          className="bg-[#0D202B] px-3 py-1.5 rounded-xl flex items-center gap-2 border border-[#193544] hover:border-[#214555] shadow-sm cursor-pointer transition-colors"
        >
          <div className="p-1 rounded-lg bg-[#142D3A] text-[#0C969C]">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#CCD0CF] flex items-center gap-1.5">
              {regionName}
              <ChevronDown className="w-3 h-3 text-[#637C87]" />
            </div>
            <div className="text-[10px] font-mono text-[#6BA3BE]">
              {regionCoords}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Left Floating Tool Stack */}
      <div className="absolute top-18 left-3.5 z-20 flex flex-col gap-1">
        <div className="bg-[#0D202B] p-1 rounded-xl flex flex-col gap-1 border border-[#193544] shadow-sm">
          <button
            onClick={onResetCamera}
            title="Reset Camera View (Home)"
            className="p-2 rounded-lg text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenWorldMap || onToggleGlobe}
            title="Open Interactive World Map"
            className="p-2 rounded-lg text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsStormLayerActive && setIsStormLayerActive(!isStormLayerActive)}
            title="Toggle 3D Storm System"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isStormLayerActive
                ? 'bg-[#C85A5A]/20 text-[#CCD0CF] border border-[#C85A5A]/40'
                : 'text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A]'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenColorbarSettings}
            title="Colorbar Editor, Opacity & 3D Depth Exaggeration"
            className="p-2 rounded-lg text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Top-Right Dynamic Colorbar Legend */}
      <div className="absolute top-3.5 right-3.5 z-20">
        <div 
          onClick={onOpenColorbarSettings}
          title="Click to customize palette, bounds, log scale, or vertical depth exaggeration"
          className="bg-[#0D202B] px-3.5 py-2 rounded-xl border border-[#193544] hover:border-[#214555] shadow-sm min-w-[240px] cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#CCD0CF] mb-1.5">
            <div className="flex items-center gap-1.5">
              <span>{t(`parameters.${currentParam.id}`, currentParam.name)}</span>
              {isLogScale && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#142D3A] text-[#6BA3BE] font-mono">log₁₀</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[#6BA3BE] text-[10px]">({currentParam.unit})</span>
              <Sliders className="w-3 h-3 text-[#637C87] group-hover:text-[#0C969C] transition-colors" />
            </div>
          </div>

          {/* Continuous gradient strip */}
          <div
            className="h-2 w-full rounded border border-[#193544] mb-1"
            style={{ background: activeGradient }}
          />

          {/* Scale tick numbers */}
          <div className="flex justify-between text-[9px] font-mono text-[#8FA8B2] font-medium">
            {ticks.map((val, idx) => (
              <span key={idx}>{val}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Center-Bottom 3D View Mode Selector Bar */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-[#0D202B] p-1 rounded-xl flex items-center gap-1 border border-[#193544] shadow-sm">
          {VIEW_MODES.map((mode) => {
            const Icon = modeIcons[mode.id] || Layers;
            const isActive = viewMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0C969C]/15 text-[#CCD0CF] font-semibold border border-[#0C969C]/45'
                    : 'text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0C969C]' : 'text-[#8FA8B2]'}`} />
                <span>{t(`viewModes.${mode.id}`, mode.label)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
