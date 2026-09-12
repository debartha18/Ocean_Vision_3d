import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sliders, Palette, Eye, RotateCcw, Activity, Layers } from 'lucide-react';
import { PARAMETERS } from '../../data/oceanData';

export const COLOR_PALETTES = [
  {
    id: 'turbo',
    name: 'Turbo (Perceptual Rainbow)',
    desc: 'Google DeepMind rainbow with smooth luminance & high perceptual contrast',
    gradientCss: 'linear-gradient(to right, #30123b, #4675ed, #1bcfd4, #61fc4c, #d1e834, #fe9b2d, #d93806, #7a0402)'
  },
  {
    id: 'viridis',
    name: 'Viridis (Colorblind-Safe)',
    desc: 'Matplotlib standard perceptually uniform colormap (Purple -> Teal -> Yellow)',
    gradientCss: 'linear-gradient(to right, #440154, #3b528b, #21918c, #5ec962, #fde725)'
  },
  {
    id: 'thermal',
    name: 'Thermal / Magma',
    desc: 'Deep oceanic thermal radiation from dark violet to incandescent heat',
    gradientCss: 'linear-gradient(to right, #000004, #3b0f70, #8c2981, #de4968, #fe9f6d, #fcfdbf)'
  },
  {
    id: 'coolwarm',
    name: 'Coolwarm (Diverging)',
    desc: 'Diverging blue-to-red gradient for thermal & salinity anomalies',
    gradientCss: 'linear-gradient(to right, #3b4cc0, #8cb2e9, #f2f2f2, #f49a7a, #b40426)'
  },
  {
    id: 'jet',
    name: 'Jet (Classic Ocean)',
    desc: 'Traditional high-contrast meteorological & physical oceanography scale',
    gradientCss: 'linear-gradient(to right, #00007f, #007fff, #00ffff, #7fff7f, #ffff00, #ff0000)'
  },
  {
    id: 'default',
    name: 'Parameter-Calibrated Default',
    desc: 'Scientifically tuned gradient specific to the active ocean parameter',
    gradientCss: 'linear-gradient(to right, #001f3f, #00d2be, #FFDC00, #FF4136)'
  }
];

export default function ColorbarSettingsModal({
  isOpen,
  onClose,
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
  customRanges = {},
  setCustomRanges
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const currentParamConfig = PARAMETERS[selectedParam] || PARAMETERS.sst;
  const currentRange = customRanges[selectedParam] || {
    min: currentParamConfig.min,
    max: currentParamConfig.max
  };

  const handleMinChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setCustomRanges((prev) => ({
        ...prev,
        [selectedParam]: { ...currentRange, min: val }
      }));
    }
  };

  const handleMaxChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setCustomRanges((prev) => ({
        ...prev,
        [selectedParam]: { ...currentRange, max: val }
      }));
    }
  };

  const handleResetDefaults = () => {
    setPalette('turbo');
    setLayerOpacity(0.95);
    setVerticalExaggeration(1.0);
    setIsLogScale(false);
    setCustomRanges((prev) => {
      const next = { ...prev };
      delete next[selectedParam];
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl p-6 border border-sky-400/40 shadow-glow-blue max-w-xl w-full relative max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-sky-500/10 text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 shadow-glow-cyan">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              {t('colorbar.title', 'Colorbar & 3D Volumetric Controls')}
            </h2>
            <p className="text-xs text-sky-300/70 font-mono">
              {t('colorbar.subtitle', 'Palette Editor • Min/Max Physical Bounds • Layer Opacity • Depth Exaggeration')}
            </p>
          </div>
        </div>

        {/* 1. Variable Selector Strip */}
        <div className="mb-4">
          <label className="text-xs font-bold text-sky-200 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            {t('controls.oceanParameters', 'Active Ocean Parameter')}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {Object.values(PARAMETERS).map((p) => {
              const isSelected = selectedParam === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedParam(p.id)}
                  className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan'
                      : 'bg-[#081533] text-slate-300 hover:text-white border-sky-500/20 hover:border-sky-400'
                  }`}
                >
                  <div className="truncate">{t('parameters.' + p.id, p.name).split(' ')[0]}</div>
                  <div className="text-[10px] font-mono opacity-75">{p.unit}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Color Palette Selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-sky-200 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            {t('colorbar.palette', 'Color Palette Selection')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = palette === pal.id;
              return (
                <div
                  key={pal.id}
                  onClick={() => setPalette(pal.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0d2250] border-cyan-400 shadow-glow-cyan'
                      : 'bg-[#06122c] border-sky-500/20 hover:border-sky-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span>{pal.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  {/* Continuous gradient strip */}
                  <div
                    className="h-3 w-full rounded-md shadow-inner border border-white/20 mb-1.5"
                    style={{ background: pal.gradientCss }}
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {pal.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Min/Max Range & Log/Linear Scale */}
        <div className="bg-[#050c1e] p-4 rounded-2xl border border-sky-500/20 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">
              {t('colorbar.dataBounds', 'Data Bounds & Scale Mode')} ({currentParamConfig.unit})
            </span>
            {/* Log / Linear scale toggle */}
            <div className="flex items-center bg-[#081533] p-0.5 rounded-lg border border-sky-500/30">
              <button
                onClick={() => setIsLogScale(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  !isLogScale
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('common.linear', 'Linear')}
              </button>
              <button
                onClick={() => setIsLogScale(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  isLogScale
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('common.logarithmic', 'Logarithmic (log₁₀)')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1">
                {t('colorbar.minVal', 'Minimum Value')} ({currentParamConfig.unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={currentRange.min}
                onChange={handleMinChange}
                className="w-full bg-[#081533] border border-sky-500/30 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1">
                {t('colorbar.maxVal', 'Maximum Value')} ({currentParamConfig.unit})
              </label>
              <input
                type="number"
                step="0.1"
                value={currentRange.max}
                onChange={handleMaxChange}
                className="w-full bg-[#081533] border border-sky-500/30 rounded-xl px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* 4. Layer Opacity Slider & Vertical Exaggeration Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Layer Opacity */}
          <div className="bg-[#050c1e] p-3.5 rounded-2xl border border-sky-500/20">
            <div className="flex items-center justify-between text-xs font-bold text-sky-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                {t('colorbar.layerOpacity', 'Layer Opacity')}
              </span>
              <span className="font-mono text-cyan-300">{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>20%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Vertical Exaggeration Slider */}
          <div className="bg-[#050c1e] p-3.5 rounded-2xl border border-sky-500/20">
            <div className="flex items-center justify-between text-xs font-bold text-sky-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                {t('colorbar.verticalExaggeration', 'Vertical Exaggeration')}
              </span>
              <span className="font-mono text-amber-300">{verticalExaggeration.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={verticalExaggeration}
              onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>3.0x</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-sky-500/20">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('colorbar.resetStandard', 'Reset to Standard')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all cursor-pointer"
          >
            {t('colorbar.apply3d', 'Apply & View 3D Scene')}
          </button>
        </div>
      </div>
    </div>
  );
}

