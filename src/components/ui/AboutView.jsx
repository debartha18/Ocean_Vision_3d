import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Waves, 
  Globe2, 
  Cpu, 
  Code, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Activity,
  FileText,
  Database,
  LayoutDashboard,
  Calculator,
  Compass,
  ArrowRight
} from 'lucide-react';
import { calculateHydrostaticPressure } from '../../utils/pressureCalculator';

export default function AboutView({ onNavigateTab, onOpenAnalyticReport }) {
  const { t } = useTranslation();
  // Live Interactive UNESCO TEOS-10 Physics Sandbox State
  const [calcDepth, setCalcDepth] = useState(1500);
  const [calcLat, setCalcLat] = useState(15.0);
  const [calcSst, setCalcSst] = useState(28.0);
  const [calcSal, setCalcSal] = useState(34.5);

  const livePressure = calculateHydrostaticPressure(calcDepth, calcLat, calcSst, calcSal);

  return (
    <div className="relative flex-1 overflow-y-auto bg-[#030712] text-slate-100 p-4 md:p-8 select-none animate-in fade-in duration-200 custom-scrollbar">
      {/* 1. Header Hero */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5 p-5 rounded-3xl bg-gradient-to-r from-[#06183d]/90 via-[#0a2357]/80 to-[#041029]/90 border border-sky-500/30 shadow-cockpit">
          <img
            src="/oceanova-logo.jpg"
            alt="OCEANOVA Mission Emblem"
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-cyan-400/50 shadow-glow-cyan shrink-0 hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                OCEANOVA
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                v2.4 Live
              </span>
            </div>
            <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200 uppercase tracking-widest mb-1.5">
              {t('about.tagline', 'Explore • Analyze • Preserve')}
            </p>
            <p className="text-xs text-sky-300/80 font-medium leading-relaxed">
              {t('about.heroDesc', 'Autonomous Physical Oceanographic Digital Twin & Planetary Telemetry Platform synthesising satellite altimetry, Argo profilers, gliders, and mooring arrays.')}
            </p>
          </div>
        </div>

        {/* Quick Navigation Action Grid */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5">
          <button
            onClick={() => onNavigateTab?.('3D View')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all cursor-pointer"
          >
            <Waves className="w-4 h-4" />
            <span>{t('about.launchSim', 'Launch 3D Simulation')}</span>
          </button>
          <button
            onClick={() => onNavigateTab?.('Map View')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081b40] hover:bg-[#0c285e] text-xs font-semibold text-cyan-300 border border-sky-500/30 transition-all cursor-pointer"
          >
            <Globe2 className="w-4 h-4" />
            <span>{t('about.worldMap', 'World Satellite Map')}</span>
          </button>
          <button
            onClick={() => onNavigateTab?.('Dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081b40] hover:bg-[#0c285e] text-xs font-semibold text-cyan-300 border border-sky-500/30 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('navbar.dashboard', 'Dashboard')}</span>
          </button>
          <button
            onClick={() => onNavigateTab?.('Data Explorer')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081b40] hover:bg-[#0c285e] text-xs font-semibold text-cyan-300 border border-sky-500/30 transition-all cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>{t('navbar.dataExplorer', 'Data Explorer')}</span>
          </button>
          <button
            onClick={onOpenAnalyticReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081b40] hover:bg-[#0c285e] text-xs font-semibold text-slate-200 border border-sky-500/30 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{t('navbar.analytics', 'Analytic Report')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* 2. Interactive TEOS-10 / UNESCO Hydrostatic Pressure Sandbox */}
        <div className="glass-panel rounded-3xl p-5 md:p-6 border border-sky-500/30 bg-gradient-to-b from-[#061536]/80 to-[#030d24]/90 shadow-cockpit">
          <div className="flex items-center justify-between mb-3 border-b border-sky-500/20 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>{t('about.teosTitle', 'Interactive Hydrostatic Pressure & Seawater Density Calculator')}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {t('about.teosBadge', 'TEOS-10 Formulation')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">{t('about.depth', 'Depth')}: <b className="text-white">{calcDepth}m</b></label>
              <input
                type="range"
                min="0"
                max="6000"
                step="50"
                value={calcDepth}
                onChange={(e) => setCalcDepth(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">{t('about.latitude', 'Latitude')}: <b className="text-white">{calcLat}° N</b></label>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={calcLat}
                onChange={(e) => setCalcLat(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">{t('about.surfaceTemp', 'Surface Temp')}: <b className="text-white">{calcSst}°C</b></label>
              <input
                type="range"
                min="2"
                max="34"
                step="0.5"
                value={calcSst}
                onChange={(e) => setCalcSst(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">{t('about.salinity', 'Salinity')}: <b className="text-white">{calcSal} PSU</b></label>
              <input
                type="range"
                min="30"
                max="40"
                step="0.1"
                value={calcSal}
                onChange={(e) => setCalcSal(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Computed Results Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="bg-[#030919] p-2.5 rounded-xl border border-sky-500/20">
              <span className="text-[9px] text-slate-400 block uppercase">{t('about.hydrostaticPressure', 'Hydrostatic Pressure')}</span>
              <span className="text-sm font-bold text-amber-300">{livePressure.dbar} dbar</span>
              <span className="text-[9px] text-slate-500 block">({livePressure.atm} atm)</span>
            </div>
            <div className="bg-[#030919] p-2.5 rounded-xl border border-sky-500/20">
              <span className="text-[9px] text-slate-400 block uppercase">{t('about.seawaterDensity', 'Seawater Density')}</span>
              <span className="text-sm font-bold text-cyan-300">{livePressure.density} kg/m³</span>
              <span className="text-[9px] text-slate-500 block">With compressibility</span>
            </div>
            <div className="bg-[#030919] p-2.5 rounded-xl border border-sky-500/20">
              <span className="text-[9px] text-slate-400 block uppercase">{t('about.localGravity', 'Local Gravity g(φ)')}</span>
              <span className="text-sm font-bold text-emerald-300">{livePressure.gravity} m/s²</span>
              <span className="text-[9px] text-slate-500 block">Somigliana Equation</span>
            </div>
            <div className="bg-[#030919] p-2.5 rounded-xl border border-sky-500/20">
              <span className="text-[9px] text-slate-400 block uppercase">{t('about.depthRegime', 'Depth Regime')}</span>
              <span className="text-[11px] font-bold text-sky-200 truncate block">{livePressure.benchmark}</span>
              <span className="text-[9px] text-slate-500 block">Zonal Layer</span>
            </div>
          </div>
        </div>

        {/* 3. Scientific & Mathematical Foundations */}
        <div className="glass-panel rounded-3xl p-6 border border-sky-500/25 bg-[#051336]/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{t('about.scientificTitle', 'Scientific & Physical Formulations')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>{t('about.gerstnerTitle', 'Multi-Octave Gerstner Waves')}</span>
              </h3>
              <p className="leading-relaxed text-slate-300">
                {t('about.gerstnerDesc', 'Non-linear surface gravity waves modeled using multi-frequency Gerstner wave displacement equations. The vertex shader evaluates horizontal drift and steep cusping with dynamic trochoidal steepness and wave-crest foam decay.')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>UNESCO & TEOS-10 Hydrostatics</span>
              </h3>
              <p className="leading-relaxed text-slate-300">
                {t('about.teosDesc', 'Hydrostatic pressure computed continuously from sea surface to hadal depths using Somigliana latitude-dependent gravity g(φ) and Millero seawater density equations with depth compressibility corrections.')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>{t('about.buoyPhysicsTitle', 'In-Situ Buoy Physics & Bobbing')}</span>
              </h3>
              <p className="leading-relaxed text-slate-300">
                {t('about.buoyPhysicsDesc', 'Floating telemetry stations evaluate analytical wave surface equations at their exact coordinates, producing realistic Archimedean buoyant heave, pitch, and roll response aligned with wave gradients.')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-sky-400" />
                <span>{t('about.coastalRadarTitle', 'High-Precision Coastal Radar')}</span>
              </h3>
              <p className="leading-relaxed text-slate-300">
                {t('about.coastalRadarDesc', 'Dynamic Haversine distance engine linking deep ocean conditions to coastal beach destinations worldwide (Puri, Goa, Miami, Da Nang, etc.) with real-time precipitation accumulation, wave breakers, and safety flags.')}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Technology Stack & Architecture */}
        <div className="glass-panel rounded-3xl p-6 border border-sky-500/25 bg-[#051336]/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
            <Code className="w-4 h-4 text-cyan-400" />
            <span>{t('about.techStackTitle', 'Architecture & Modern Web Stack')}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <div className="text-[10px] text-slate-400 uppercase">Framework</div>
              <div className="font-bold text-white mt-1">React 19</div>
              <div className="text-[9px] text-cyan-400 mt-0.5">Component Model</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <div className="text-[10px] text-slate-400 uppercase">3D Engine</div>
              <div className="font-bold text-white mt-1">Three.js + WebGL 2</div>
              <div className="text-[9px] text-cyan-400 mt-0.5">Custom GLSL Shaders</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <div className="text-[10px] text-slate-400 uppercase">Build Tool</div>
              <div className="font-bold text-white mt-1">Vite 8</div>
              <div className="text-[9px] text-cyan-400 mt-0.5">Fast HMR Engine</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#030c22] border border-sky-500/15">
              <div className="text-[10px] text-slate-400 uppercase">Styling</div>
              <div className="font-bold text-white mt-1">Tailwind CSS</div>
              <div className="text-[9px] text-cyan-400 mt-0.5">Cockpit Glassmorphism</div>
            </div>
          </div>
        </div>

        {/* 5. Data Attribution & Ingested Services */}
        <div className="glass-panel rounded-3xl p-6 border border-sky-500/25 bg-[#051336]/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Data Attribution & Institutional Sources</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#030c22]">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-bold text-white block">NASA Earth Observatory / Visible Earth</span>
                <span className="text-[11px] text-slate-400">Blue Marble Next-Generation 2048x1024 equirectangular planetary basemap</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#030c22]">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-bold text-white block">NOAA / National Data Buoy Center (NDBC)</span>
                <span className="text-[11px] text-slate-400">Deep ocean mooring time series, surface barometric pressure & wave spectra</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#030c22]">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-bold text-white block">INCOIS (Ministry of Earth Sciences, India)</span>
                <span className="text-[11px] text-slate-400">RAMA & OMNI Indian Ocean moored array & high wave coastal alerts</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#030c22]">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Copernicus Marine Environment (CMEMS)</span>
                <span className="text-[11px] text-slate-400">Global sea surface salinity, temperature reanalysis & altimetry assimilation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
