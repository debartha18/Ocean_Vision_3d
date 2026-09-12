import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ThermometerSun, 
  ChevronUp, 
  ChevronDown, 
  Wind,
  Info
} from 'lucide-react';
import { ENSO_METRICS } from '../../data/oceanData';

export default function EnsoSimulationDock({
  ensoState,
  setEnsoState,
  onFocusPacific,
  isPacificBasin
}) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const currentPhase = ensoState?.phase || 'elnino';
  const currentIntensity = ensoState?.intensity ?? 0.75;
  const isPlaying = ensoState?.isPlaying ?? true;
  const metrics = ENSO_METRICS[currentPhase] || ENSO_METRICS.elnino;

  const handlePhaseSelect = (phase) => {
    setEnsoState((prev) => ({
      ...prev,
      phase,
      intensity: phase === 'normal' ? 0.2 : (prev.intensity < 0.3 ? 0.75 : prev.intensity)
    }));
  };

  const handleIntensityChange = (e) => {
    const val = parseFloat(e.target.value);
    setEnsoState((prev) => ({
      ...prev,
      intensity: val
    }));
  };

  const handleTogglePlay = () => {
    setEnsoState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const handleReset = () => {
    setEnsoState({
      phase: 'normal',
      intensity: 0.5,
      isPlaying: true
    });
  };

  const displayAnomaly = currentPhase === 'elnino'
    ? `+${(currentIntensity * 2.5).toFixed(1)}°C`
    : currentPhase === 'lanina'
    ? `-${(currentIntensity * 2.2).toFixed(1)}°C`
    : '+0.1°C';

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 select-none w-[94%] max-w-xl">
      <div className={`glass-panel rounded-2xl border transition-all duration-300 shadow-2xl backdrop-blur-xl ${
        currentPhase === 'elnino'
          ? 'border-orange-500/50 bg-[#0f091c]/92 shadow-glow-orange'
          : currentPhase === 'lanina'
          ? 'border-blue-500/50 bg-[#07132e]/92 shadow-glow-cyan'
          : 'border-cyan-500/35 bg-[#051128]/92'
      }`}>
        {/* Dock Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              currentPhase === 'elnino' 
                ? 'bg-orange-500/20 text-orange-400' 
                : currentPhase === 'lanina'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              <ThermometerSun className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-white">
                  {t('enso.dockTitle', 'ENSO Simulation')}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${metrics.badgeBg}`}>
                  {currentPhase === 'elnino' ? t('enso.elnino', 'El Niño') : currentPhase === 'lanina' ? t('enso.lanina', 'La Niña') : t('enso.normal', 'Normal')} ({displayAnomaly})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Pacific Jump Button */}
            {!isPacificBasin && onFocusPacific && (
              <button
                onClick={onFocusPacific}
                title="Focus 3D View to Equatorial Pacific (Niño 3.4)"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-[11px] font-bold text-cyan-300 border border-cyan-400/40 transition-all cursor-pointer shadow-glow-cyan"
              >
                <span>🌊</span>
                <span>{t('enso.pacificBtn', 'PACIFIC')}</span>
              </button>
            )}

            {/* Info toggle */}
            <button
              onClick={() => setShowInfoModal(!showInfoModal)}
              title="Explain ENSO Physics & Teleconnections"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Collapse/Expand */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dock Body (Collapsible) */}
        {!isCollapsed && (
          <div className="p-3.5 space-y-3">
            {/* 1. Phase Selection matching wireframe: Normal ● El Niño ○ La Niña */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1.5 px-1">
                <span className="uppercase text-slate-400 font-bold">{t('enso.phaseState', 'Phase State')}:</span>
                <span className="text-cyan-300 font-semibold">{metrics.label}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: t('enso.normal', 'Normal') },
                  { id: 'elnino', label: t('enso.elnino', 'El Niño') },
                  { id: 'lanina', label: t('enso.lanina', 'La Niña') }
                ].map((phaseItem) => {
                  const isSelected = currentPhase === phaseItem.id;
                  return (
                    <button
                      key={phaseItem.id}
                      onClick={() => handlePhaseSelect(phaseItem.id)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? phaseItem.id === 'elnino'
                            ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-400 shadow-glow-orange scale-[1.02]'
                            : phaseItem.id === 'lanina'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-glow-cyan scale-[1.02]'
                            : 'bg-[#09224d] text-cyan-200 border-cyan-400 shadow-glow-cyan scale-[1.02]'
                          : 'bg-[#040e24]/70 hover:bg-[#08183d] text-slate-300 border-white/10'
                      }`}
                    >
                      <span className={`text-base leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {isSelected ? '●' : '○'}
                      </span>
                      <span>{phaseItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Intensity Slider matching wireframe: Intensity ─────●──── */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1 px-1">
                <span className="uppercase text-slate-400 font-bold">{t('enso.intensityLabel', 'Intensity')}:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {currentIntensity <= 0.3 ? t('enso.weak', 'Weak') : currentIntensity <= 0.65 ? t('enso.moderate', 'Moderate') : currentIntensity <= 0.85 ? t('enso.strong', 'Strong') : t('enso.super', 'Very Strong (Super)')}
                  </span>
                  <span className="text-cyan-300 font-bold">({(currentIntensity * 100).toFixed(0)}%)</span>
                </div>
              </div>

              <div className="relative flex items-center px-1">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={currentIntensity}
                  onChange={handleIntensityChange}
                  className="w-full h-2 bg-[#05112e] rounded-lg appearance-none cursor-pointer accent-orange-500 border border-white/15"
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-slate-400 px-1 mt-1">
                <span>{t('enso.weak', 'Weak')} (0.2)</span>
                <span>{t('enso.moderate', 'Moderate')} (0.5)</span>
                <span>{t('enso.strong', 'Strong')} (0.75)</span>
                <span>{t('enso.super', 'Super')} (1.0)</span>
              </div>
            </div>

            {/* 3. Physical State & Telemetry Indicator Banner */}
            <div className="bg-[#040b1e]/90 rounded-xl p-2.5 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate mr-2">
                <Wind className={`w-4 h-4 shrink-0 ${currentPhase === 'elnino' ? 'text-amber-400' : 'text-cyan-400'}`} />
                <div className="truncate leading-tight">
                  <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <span>{metrics.tradeWinds}</span>
                    <span className={`font-mono font-black ${currentPhase === 'elnino' ? 'text-orange-400 animate-pulse' : 'text-cyan-300'}`}>
                      {metrics.arrowSymbol}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentPhase === 'elnino' 
                      ? '🟠🟠🟠 → 🔴 Warm pool surging eastward to South America' 
                      : currentPhase === 'lanina'
                      ? '🔵🔵🔵 Cold upwelling tongue spreading across central basin'
                      : 'Equilibrium Walker Circulation & western warm pool'}
                  </div>
                </div>
              </div>

              {/* 4. Controls: PLAY / PAUSE & RESET matching wireframe */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTogglePlay}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isPlaying
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 shadow-glow-emerald'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? t('enso.pause', 'PAUSE') : t('enso.play', 'PLAY')}</span>
                </button>

                <button
                  onClick={handleReset}
                  title="Reset to Normal baseline"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('enso.reset', 'RESET')}</span>
                </button>
              </div>
            </div>

            {/* Optional Physics Explanation Details (Toggled via Info icon) */}
            {showInfoModal && (
              <div className="bg-[#030816] rounded-xl p-3 border border-cyan-500/30 text-[11px] text-slate-300 space-y-1.5 animate-in fade-in duration-200">
                <div className="font-bold text-cyan-300 flex items-center justify-between">
                  <span>How Ocean Vision 3D Simulates ENSO:</span>
                  <button onClick={() => setShowInfoModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>
                <p>
                  • <strong className="text-white">Surface Shader:</strong> Computes equatorial heat content and thermal advection. In El Niño, positive SST anomaly propagates east (<span className="text-orange-400 font-mono">→ → →</span>).
                </p>
                <p>
                  • <strong className="text-white">Thermocline Cutaway:</strong> Dynamically depresses the thermocline depth layer down to ~150-180m on the eastern cutaway wall during El Niño, suppressing cold water upwelling.
                </p>
                <p>
                  • <strong className="text-white">Particle Streamlines:</strong> 3D velocity vectors reverse direction to mirror westerly wind bursts and Kelvin wave propagation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
