import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Gauge, 
  Layers, 
  Compass, 
  ArrowDown, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  calculateHydrostaticPressure, 
  generatePressureDepthProfile,
  calculateGravity
} from '../../utils/pressureCalculator';

export default function DepthPressureModal({ 
  isOpen, 
  onClose, 
  currentLat = 15.297, 
  currentLon = 87.860,
  initialDepth = 100,
  onApplyDepth
}) {
  const { t } = useTranslation();
  const [lat, setLat] = useState(currentLat);
  const [lon, setLon] = useState(currentLon);
  const [depth, setDepth] = useState(initialDepth);
  const [sst, setSst] = useState(28.5);
  const [salinity, setSalinity] = useState(34.5);

  if (!isOpen) return null;

  const currentPressure = calculateHydrostaticPressure(depth, lat, sst, salinity);
  const depthProfile = generatePressureDepthProfile(lat, sst, salinity);
  const g = calculateGravity(lat);

  const handleApplyToSimulation = () => {
    if (onApplyDepth) {
      onApplyDepth(depth);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl p-6 border border-cyan-500/40 shadow-glow-cyan max-w-4xl w-full relative max-h-[92vh] flex flex-col bg-gradient-to-b from-[#081b3a] via-[#041026] to-[#020713]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-cyan-500/10 text-cyan-300 hover:text-white hover:bg-cyan-500/25 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 shadow-glow-cyan flex items-center justify-center text-cyan-400">
            <Gauge className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white tracking-wide">
                {t('depthPressure.title', 'Ocean Hydrostatic Pressure & Depth Profiler')}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                UNESCO / TEOS-10
              </span>
            </div>
            <p className="text-xs text-sky-300/80 font-mono">
              {t('depthPressure.subtitle', 'Dynamic physical calculation for any depth, latitude, and seawater density')}
            </p>
          </div>
        </div>

        {/* Top Control Bar: Coordinates & Seawater Constants */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 bg-[#051330]/90 p-3.5 rounded-2xl border border-sky-500/25">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>{t('controls.latitude', 'Latitude (°N/S)')}</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="-90"
              max="90"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1 rounded-xl bg-[#020917] border border-sky-500/30 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
              g(φ) = {g} m/s²
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>{t('controls.longitude', 'Longitude (°E/W)')}</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="-180"
              max="180"
              value={lon}
              onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1 rounded-xl bg-[#020917] border border-sky-500/30 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
              Global Hydrostatic Grid
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              {t('about.calcSst', 'Surface Temp SST (°C)')}
            </label>
            <input
              type="number"
              step="0.5"
              min="-2"
              max="35"
              value={sst}
              onChange={(e) => setSst(parseFloat(e.target.value) || 28)}
              className="w-full px-2.5 py-1 rounded-xl bg-[#020917] border border-sky-500/30 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
            />
            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
              Thermal expansion factor
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              {t('about.calcSal', 'Salinity (PSU / g·kg⁻¹)')}
            </label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="42"
              value={salinity}
              onChange={(e) => setSalinity(parseFloat(e.target.value) || 35)}
              className="w-full px-2.5 py-1 rounded-xl bg-[#020917] border border-sky-500/30 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
            />
            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
              Halocline density factor
            </span>
          </div>
        </div>

        {/* Main Depth Scrubber & Live Gauge Display */}
        <div className="bg-[#061638]/80 p-4 rounded-2xl border border-cyan-500/30 mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span>{t('depthPressure.depthZ', 'Selected Subsurface Depth')}:</span>
                <span className="text-base font-black font-mono text-white bg-cyan-500/20 px-3 py-0.5 rounded-lg border border-cyan-400/40">
                  {depth} m
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-200 border border-blue-400/30 text-[10px] font-mono">
                  {currentPressure.benchmarkKey ? t('zones.' + currentPressure.benchmarkKey, currentPressure.benchmark) : currentPressure.benchmark}
                </span>
                <span className="text-slate-400">
                  ρ = {currentPressure.density} kg/m³
                </span>
                <span className="text-cyan-400/80 hidden sm:inline">
                  • c = {currentPressure.soundSpeed} m/s
                </span>
              </div>
            </div>

            {/* Direct Number Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Exact Depth:</span>
              <input
                type="number"
                min="0"
                max="11000"
                step="10"
                value={depth}
                onChange={(e) => setDepth(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 px-2 py-1 rounded-xl bg-[#020817] border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 text-center focus:outline-none"
              />
              <span className="text-xs text-slate-400 font-mono">m</span>
            </div>
          </div>

          {/* Depth Slider */}
          <input
            type="range"
            min="0"
            max="5000"
            step="10"
            value={Math.min(5000, depth)}
            onChange={(e) => setDepth(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-sky-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-2"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>0m (Surface)</span>
            <span>200m (Shelf)</span>
            <span>1000m (Twilight)</span>
            <span>2000m (Midnight)</span>
            <span>3800m (Avg Ocean)</span>
            <span>5000m (Abyssal)</span>
          </div>
        </div>

        {/* 4 Multi-Unit Hydrostatic Pressure Measurement Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Decibars (Oceanographic Standard) */}
          <div className="bg-[#091b40] p-3.5 rounded-2xl border border-cyan-500/30 text-center shadow-cockpit">
            <div className="text-[10px] text-cyan-300/80 font-mono uppercase">Oceanographic Pressure</div>
            <div className="text-xl font-mono font-black text-cyan-300 mt-1">
              {currentPressure.dbar}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">dbar (decibars)</div>
            <div className="text-[9px] text-cyan-400/60 mt-1">~1 dbar per meter depth</div>
          </div>

          {/* Atmospheres */}
          <div className="bg-[#091b40] p-3.5 rounded-2xl border border-cyan-500/30 text-center shadow-cockpit">
            <div className="text-[10px] text-sky-300/80 font-mono uppercase">Atmospheric Ratio</div>
            <div className="text-xl font-mono font-black text-sky-300 mt-1">
              {currentPressure.atm}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">atm (atmospheres)</div>
            <div className="text-[9px] text-sky-400/60 mt-1">× Sea Level Surface Pressure</div>
          </div>

          {/* Megapascals / Bar */}
          <div className="bg-[#091b40] p-3.5 rounded-2xl border border-cyan-500/30 text-center shadow-cockpit">
            <div className="text-[10px] text-amber-300/80 font-mono uppercase">Engineering Units</div>
            <div className="text-xl font-mono font-black text-amber-300 mt-1">
              {currentPressure.mpa}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">MPa ({currentPressure.bar} bar)</div>
            <div className="text-[9px] text-amber-400/60 mt-1">{currentPressure.totalPa.toLocaleString()} Pascals</div>
          </div>

          {/* PSI & Column Mass */}
          <div className="bg-[#091b40] p-3.5 rounded-2xl border border-cyan-500/30 text-center shadow-cockpit">
            <div className="text-[10px] text-emerald-300/80 font-mono uppercase">Imperial & Water Mass</div>
            <div className="text-xl font-mono font-black text-emerald-300 mt-1">
              {currentPressure.psi}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">PSI (lb / in²)</div>
            <div className="text-[9px] text-emerald-400/60 mt-1">{(currentPressure.columnMassKgPerM2 / 1000).toFixed(1)} metric tons/m²</div>
          </div>
        </div>

        {/* Water Column Profile Depth Matrix Table */}
        <div className="flex-1 overflow-y-auto mb-4 bg-[#030c1f] rounded-2xl border border-sky-500/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('depthPressure.matrixTitle', 'Standard Water Column Depth Profile Matrix')} (Lat: {lat}°)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Click any row to select depth
            </span>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-sky-500/20 text-[10px] text-slate-400 uppercase">
                <th className="py-1.5 px-2">{t('report.depthZ', 'Depth (m)')}</th>
                <th className="py-1.5 px-2">{t('report.pressureDbar', 'Pressure (dbar)')}</th>
                <th className="py-1.5 px-2">{t('report.atmospheres', 'Atm (atm)')}</th>
                <th className="py-1.5 px-2">{t('report.mpa', 'Pressure (MPa)')}</th>
                <th className="py-1.5 px-2">{t('report.psi', 'Pressure (PSI)')}</th>
                <th className="py-1.5 px-2">{t('report.density', 'Density (kg/m³)')}</th>
                <th className="py-1.5 px-2">{t('report.oceanicZone', 'Ocean Zone')}</th>
              </tr>
            </thead>
            <tbody>
              {depthProfile.map((lvl) => {
                const isSelected = Math.abs(depth - lvl.depth) < 10;
                return (
                  <tr
                    key={lvl.depth}
                    onClick={() => setDepth(lvl.depth)}
                    className={`cursor-pointer transition-colors border-b border-white/5 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'hover:bg-sky-500/10 text-slate-300'
                    }`}
                  >
                    <td className="py-1.5 px-2 flex items-center gap-1.5">
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                      <span>{lvl.depth} m</span>
                    </td>
                    <td className="py-1.5 px-2 text-cyan-200">{lvl.dbar}</td>
                    <td className="py-1.5 px-2 text-sky-200">{lvl.atm}</td>
                    <td className="py-1.5 px-2 text-amber-200">{lvl.mpa}</td>
                    <td className="py-1.5 px-2 text-emerald-200">{lvl.psi}</td>
                    <td className="py-1.5 px-2 text-slate-400">{lvl.density}</td>
                    <td className="py-1.5 px-2 text-[10px] text-slate-400 truncate max-w-[150px]">
                      {lvl.benchmarkKey ? t('zones.' + lvl.benchmarkKey, lvl.benchmark) : lvl.benchmark}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-sky-500/20">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hydrostatic equation: P(z) = P_atm + ρ(z,S,T) · g(φ) · z</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-slate-300 transition-colors"
            >
              {t('common.close', 'Close')}
            </button>
            <button
              onClick={handleApplyToSimulation}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all flex items-center gap-1.5"
            >
              <span>{t('depthPressure.applyTo3D', 'Apply Depth Slice to 3D View')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
