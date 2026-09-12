import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown, 
  Compass, 
  Thermometer, 
  Droplets, 
  Wind, 
  Waves, 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  Radio, 
  FileText, 
  ArrowRight, 
  Activity, 
  Layers, 
  Zap, 
  Gauge, 
  Maximize2,
  CheckCircle2,
  Send
} from 'lucide-react';
import { REGIONS, PARAMETERS, DEPTH_LEVELS, VALIDATION_METRICS, IN_SITU_SUMMARY, calculateParameterAtDepth } from '../../data/oceanData';
import { executeNeridaReasoning } from '../../lib/ai/offlineEngine';

export default function ScrollOceanExperience({
  activeRegion,
  setActiveRegion,
  selectedParam,
  setSelectedParam,
  depth,
  setDepth,
  viewMode,
  setViewMode,
  timeHour,
  selectedDate,
  isStormLayerActive,
  setIsStormLayerActive,
  onOpenControls,
  onOpenCopilot,
  onOpenLocationModal,
  onOpenStormNews,
  onOpenFleetModal,
  onOpenAlerts,
  onOpenAnalyticReport,
  onOpenDepthPressure,
  onSwitchToWorkstation
}) {
  const { t, i18n } = useTranslation();
  const [activeStorySection, setActiveStorySection] = useState('hero');

  // AI Card inline response state
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCustomInput, setAiCustomInput] = useState('');

  // Track scroll sections using IntersectionObserver
  useEffect(() => {
    const sectionIds = ['section-hero', 'section-explore', 'section-parameters', 'section-ai', 'section-insights'];
    const elements = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          const id = entry.target.id.replace('section-', '');
          setActiveStorySection(id);
        }
      });
    }, {
      threshold: [0.3, 0.6]
    });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Quick initial AI summary for current region
  useEffect(() => {
    const currentState = {
      basin: activeRegion?.name,
      basinId: activeRegion?.id,
      depth: depth,
      parameter: selectedParam,
      language: i18n.language || 'en'
    };
    try {
      const initQuery = `Summary of current ocean conditions in ${activeRegion?.name || 'this basin'}`;
      const res = executeNeridaReasoning(initQuery, currentState, []);
      if (res && res.message) {
        setAiResponse(res.message);
      }
    } catch (e) {
      console.warn('Initial AI preview skipped:', e);
    }
  }, [activeRegion?.name, i18n.language]);

  const handleAskAiInline = (promptText) => {
    if (!promptText || !promptText.trim()) return;
    setAiLoading(true);
    setAiCustomInput('');

    setTimeout(() => {
      try {
        const currentState = {
          basin: activeRegion?.name,
          basinId: activeRegion?.id,
          depth: depth,
          parameter: selectedParam,
          language: i18n.language || 'en'
        };
        const res = executeNeridaReasoning(promptText, currentState, []);
        if (res && res.message) {
          setAiResponse(res.message);
        }
      } catch (err) {
        setAiResponse(`Failed to process analysis: ${err.message}`);
      } finally {
        setAiLoading(false);
      }
    }, 150);
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Human explanations for parameters
  const paramStories = [
    {
      id: 'sst',
      title: t('parameters.sst', 'Sea Surface Temperature'),
      badge: `${activeRegion?.sst ?? 29.5} °C`,
      depthTarget: 0,
      icon: Thermometer,
      gradient: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
      textColor: 'text-amber-300',
      summary: 'Sea Surface Temperature governs tropical atmospheric squalls, monsoon rainfall dynamics, and thermal expansion.',
      details: 'Upper-layer warmth fuels low-pressure disturbances and cyclone genesis. Below the mixed layer, temperature decays through the thermocline down to 4°C in the deep abyss.'
    },
    {
      id: 'salinity',
      title: t('parameters.salinity', 'Salinity'),
      badge: `${calculateParameterAtDepth('salinity', 50, activeRegion?.salinity ?? 33.2)} PSU`,
      depthTarget: 50,
      icon: Droplets,
      gradient: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/30',
      textColor: 'text-cyan-300',
      summary: 'Salinity governs seawater density alongside temperature, modulating vertical mixing and circulation.',
      details: 'Colossal river discharge in northern basins creates a buoyant freshwater lens, forming a persistent barrier layer that traps solar heat and limits nutrient upwelling.'
    },
    {
      id: 'currents',
      title: t('parameters.currents', 'Ocean Currents'),
      badge: `${activeRegion?.currentSpeed ?? 0.48} m/s`,
      depthTarget: 20,
      icon: Wind,
      gradient: 'from-sky-500/20 to-teal-500/10',
      border: 'border-sky-500/30',
      textColor: 'text-sky-300',
      summary: 'Wind-stress curl and Coriolis forcing propel geostrophic boundary currents and Ekman transport.',
      details: 'Major circulation features redistribute heat, dissolved gases, and biological nutrients across global ocean basins, dictating regional marine ecosystems and fisheries.'
    },
    {
      id: 'depth',
      title: t('controls.verticalDepth', 'Depth & Stratification'),
      badge: `${depth}m Layer`,
      depthTarget: 500,
      icon: Waves,
      gradient: 'from-indigo-500/20 to-purple-500/10',
      border: 'border-indigo-500/30',
      textColor: 'text-indigo-300',
      summary: 'The water column transitions from the sunlit photic zone into the dark bathypelagic abyss.',
      details: 'Pycnocline stratification defines distinct ecological realms: the Epipelagic zone (0–200m), Twilight Mesopelagic zone (200–1000m), and the cold, high-pressure Bathypelagic realm (>1000m).'
    }
  ];

  return (
    <div className="relative w-full text-slate-100 select-none overflow-x-hidden">
      {/* Floating Section Progress Dots (Desktop) */}
      <nav 
        aria-label="Story sections"
        className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 bg-[#06112c]/70 backdrop-blur-md p-2 rounded-full border border-sky-500/20 shadow-lg"
      >
        {[
          { id: 'section-hero', label: 'Overview', active: activeStorySection === 'hero' },
          { id: 'section-explore', label: 'Explore', active: activeStorySection === 'explore' },
          { id: 'section-parameters', label: 'Parameters', active: activeStorySection === 'parameters' },
          { id: 'section-ai', label: 'AI Analysis', active: activeStorySection === 'ai' },
          { id: 'section-insights', label: 'Insights', active: activeStorySection === 'insights' }
        ].map((dot) => (
          <button
            key={dot.id}
            onClick={() => scrollToSection(dot.id)}
            title={dot.label}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              dot.active 
                ? 'w-3 h-3 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] scale-125' 
                : 'bg-slate-500/50 hover:bg-slate-300'
            }`}
          />
        ))}
      </nav>

      {/* ============================================================ */}
      {/* SECTION 1: HERO / INTRODUCTION                               */}
      {/* ============================================================ */}
      <section 
        id="section-hero"
        className="relative min-h-[90vh] flex flex-col justify-between items-center text-center px-4 sm:px-6 py-12 pointer-events-none"
      >
        <div className="w-full max-w-4xl mx-auto pt-16 sm:pt-24 space-y-6 pointer-events-auto">
          {/* Version badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-glow-cyan animate-in fade-in zoom-in duration-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('brand.name', 'Ocean Vision 3D')} • {t('brand.version', 'v2.4 Live')}</span>
            <span className="text-cyan-500">|</span>
            <span className="text-slate-300">{t('navbar.satelliteActive', 'Satellite Telemetry Active')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-sky-400 drop-shadow-2xl">
            OCEAN VISION 3D
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
            {t('story.heroSubtitle', 'Explore, visualize and understand our oceans through interactive 3D data.')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => scrollToSection('section-explore')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>{t('story.exploreNow', 'Explore Now')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onSwitchToWorkstation}
              className="px-5 py-3 rounded-2xl bg-[#091b40]/80 hover:bg-[#12285a] border border-sky-500/30 hover:border-cyan-400/60 text-sky-200 text-sm font-semibold backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
              title="Switch to Full Multi-Panel Engineering Cockpit"
            >
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span>{t('story.workstationMode', 'Launch Workstation')}</span>
            </button>

            <button
              onClick={onOpenControls}
              className="px-4 py-3 rounded-2xl bg-[#06122d]/70 hover:bg-[#0c204c] border border-sky-500/20 text-slate-300 hover:text-white text-sm font-semibold backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>⚙ {t('story.controls', 'Controls')}</span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          onClick={() => scrollToSection('section-explore')}
          className="cursor-pointer group flex flex-col items-center gap-1.5 pt-8 text-sky-300/80 hover:text-cyan-300 transition-colors pointer-events-auto"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-cyan-300">
            {t('story.scrollToExplore', '↓ SCROLL TO EXPLORE')}
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-cyan-400" />
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: EXPLORE THE OCEAN                                 */}
      {/* ============================================================ */}
      <section 
        id="section-explore"
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-12 py-16 pointer-events-none"
      >
        <div className="w-full max-w-5xl mx-auto space-y-6 pointer-events-auto">
          {/* Section Header */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/30 bg-[#06112c]/85 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                  <Compass className="w-4 h-4" />
                  <span>STEP 1 • DISCOVERY</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  Explore the Ocean
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
                  Select a regional basin or enter custom coordinates. The 3D digital-twin in the background responds in real-time.
                </p>
              </div>

              {/* Coordinates Badge */}
              <button
                onClick={onOpenLocationModal}
                className="px-4 py-2.5 rounded-2xl bg-[#0b1d47] hover:bg-[#112d6e] border border-cyan-400/40 text-left transition-all cursor-pointer group shrink-0"
              >
                <div className="text-[10px] text-cyan-300/70 uppercase font-bold">Current Basin</div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-200 flex items-center gap-1.5">
                  <span>{activeRegion?.name || 'Bay of Bengal'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-[10px] font-mono text-sky-300/60 mt-0.5">
                  {activeRegion?.coords || '15.297° N, 87.860° E'}
                </div>
              </button>
            </div>

            {/* Quick Basin Selector Chips */}
            <div className="pt-2 border-t border-sky-500/20">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Regional Basins:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'bay_of_bengal', name: 'Bay of Bengal', region: REGIONS.bay_of_bengal },
                  { id: 'arabian_sea', name: 'Arabian Sea', region: REGIONS.arabian_sea },
                  { id: 'equatorial_pacific', name: 'Equatorial Pacific', region: REGIONS.equatorial_pacific },
                  { id: 'north_atlantic', name: 'North Atlantic', region: REGIONS.north_atlantic },
                  { id: 'south_china_sea', name: 'South China Sea', region: REGIONS.south_china_sea }
                ].map((b) => {
                  const isCurrent = activeRegion?.id === b.id || activeRegion?.name?.toLowerCase().includes(b.id.replace('_', ' '));
                  return (
                    <button
                      key={b.id}
                      onClick={() => b.region && setActiveRegion(b.region)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white border-cyan-300 shadow-glow-cyan font-bold'
                          : 'bg-[#0a183d]/70 text-slate-300 hover:text-white hover:bg-[#102761] border-sky-500/20'
                      }`}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Meteorological & Ocean State Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-2xl bg-[#081538]/70 border border-sky-500/20">
                <span className="text-[10px] text-slate-400 font-medium">Sea Surface Temp</span>
                <div className="text-base font-bold text-amber-300">{activeRegion?.sst ?? 29.5} °C</div>
                <span className="text-[9px] text-slate-400">Live Satellite Ingestion</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#081538]/70 border border-sky-500/20">
                <span className="text-[10px] text-slate-400 font-medium">Significant Wave Swell</span>
                <div className="text-base font-bold text-sky-300">{activeRegion?.waveHeight ?? 1.65} m</div>
                <span className="text-[9px] text-slate-400">Monsoonal Swell</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#081538]/70 border border-sky-500/20">
                <span className="text-[10px] text-slate-400 font-medium">Surface Wind Speed</span>
                <div className="text-base font-bold text-cyan-300">{activeRegion?.windSpeedKmH ?? 24} km/h</div>
                <span className="text-[9px] text-slate-400">Atmospheric Forcing</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#081538]/70 border border-sky-500/20 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Storm Threat Layer</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isStormLayerActive ? 'bg-red-400 animate-ping' : 'bg-slate-500'}`} />
                  <span className="text-xs font-bold text-white">{isStormLayerActive ? 'Active' : 'Standby'}</span>
                </div>
                <button
                  onClick={() => setIsStormLayerActive(!isStormLayerActive)}
                  className="text-[10px] text-cyan-400 hover:underline text-left cursor-pointer"
                >
                  {isStormLayerActive ? 'Turn Off' : 'Toggle 3D Storm'}
                </button>
              </div>
            </div>

            {/* Orbit & Zoom Hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>💡 <strong>Tip:</strong> Drag the background 3D ocean to rotate • Scroll to zoom • Right-click to pan</span>
              <button
                onClick={onOpenControls}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                More Controls ⚙
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: OCEAN PARAMETERS (DISCOVER)                       */}
      {/* ============================================================ */}
      <section 
        id="section-parameters"
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-12 py-16 pointer-events-none"
      >
        <div className="w-full max-w-5xl mx-auto space-y-6 pointer-events-auto">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              <span>STEP 2 • OCEAN DATA</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Discover Ocean Parameters
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Select any parameter below. The 3D digital-twin will dynamically transition its volumetric field, depth cutaway, and color gradients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paramStories.map((param) => {
              const isSelected = selectedParam === param.id || (param.id === 'depth' && depth > 100);
              const IconComp = param.icon;
              return (
                <div
                  key={param.id}
                  onClick={() => {
                    if (param.id === 'depth') {
                      setDepth(param.depthTarget);
                    } else {
                      setSelectedParam(param.id);
                      setDepth(param.depthTarget);
                    }
                  }}
                  className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer backdrop-blur-xl flex flex-col justify-between ${
                    isSelected
                      ? `bg-[#061538]/90 ${param.border} shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]`
                      : 'bg-[#040e26]/80 border-sky-500/20 hover:bg-[#071844]/80 hover:border-sky-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${param.gradient} border ${param.border}`}>
                          <IconComp className={`w-5 h-5 ${param.textColor}`} />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-wide">
                          {param.title}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-[#08183d] border ${param.border} ${param.textColor}`}>
                        {param.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {param.summary}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {param.details}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-sky-500/15">
                    <span className="text-[10px] text-sky-400/80 font-mono">
                      Target Depth: {param.depthTarget}m
                    </span>
                    <button
                      className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-cyan-500 text-white shadow-glow-cyan' 
                          : 'bg-white/5 hover:bg-white/10 text-cyan-300'
                      }`}
                    >
                      <span>{isSelected ? 'Active in 3D' : 'Inspect in 3D'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: AI OCEAN ANALYSIS (UNDERSTAND)                    */}
      {/* ============================================================ */}
      <section 
        id="section-ai"
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-12 py-16 pointer-events-none"
      >
        <div className="w-full max-w-4xl mx-auto space-y-6 pointer-events-auto">
          {/* Glass Card Container */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/40 bg-gradient-to-b from-[#061b36]/90 via-[#05142e]/90 to-[#020b1e]/95 backdrop-blur-xl shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.5)]">
                  <span className="text-2xl">🧜‍♀️</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                      {t('story.aiAnalysisSub', 'AI Ocean Analysis')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Nerida Copilot
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {t('story.aiAnalysisTitle', 'What is happening in this region?')}
                  </h2>
                </div>
              </div>

              {/* Full Copilot Drawer Trigger */}
              <button
                onClick={onOpenCopilot}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-cyan transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <span>Open Full Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Ask Nerida Instantly:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Explain temperature and salinity balance',
                  'What marine life is found in this basin?',
                  'Check for marine heatwaves & anomalies',
                  'Why does upwelling occur here?'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    disabled={aiLoading}
                    onClick={() => handleAskAiInline(prompt)}
                    className="px-3 py-1.5 rounded-xl bg-[#082042]/70 hover:bg-[#0c2f60] border border-teal-500/30 text-xs text-teal-200 hover:text-white transition-all cursor-pointer font-medium disabled:opacity-50"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Box */}
            <div className="p-4 rounded-2xl bg-[#030d22]/80 border border-sky-500/20 min-h-[120px] flex flex-col justify-between">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold py-6">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Nerida is thinking... synthesizing oceanographic telemetry</span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiResponse || 'Ask Nerida about regional marine life, current velocity, or physical stratification.'}
                </div>
              )}

              {/* In-situ Provenance Stamp */}
              <div className="pt-3 mt-3 border-t border-sky-500/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>Provenance: TEOS-10 Thermodynamic Formulae • PIRATA / INCOIS In-Situ Buoys</span>
                <span className="text-cyan-400 font-mono">QC Passed (99.4%)</span>
              </div>
            </div>

            {/* Custom Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAiInline(aiCustomInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={aiCustomInput}
                onChange={(e) => setAiCustomInput(e.target.value)}
                placeholder="Ask any ocean question (e.g., 'What lives at 500m?', 'Show salinity profile')..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#030a1c] border border-sky-500/30 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!aiCustomInput.trim() || aiLoading}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-glow-cyan"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: OCEAN INSIGHTS (ANALYZE)                          */}
      {/* ============================================================ */}
      <section 
        id="section-insights"
        className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-12 py-16 pointer-events-none"
      >
        <div className="w-full max-w-5xl mx-auto space-y-6 pointer-events-auto">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              <span>STEP 4 • ANALYSIS & SYNTHESIS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              {t('story.insightsTitle', 'Ocean Insights')}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Empirical in-situ validation, storm threat bulletins, observing fleet telemetry, and thermodynamic calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CARD 1: Model vs Observed Validation */}
            <div className="p-5 rounded-3xl bg-[#061538]/80 border border-sky-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">Model vs Observed Telemetry</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                    99.4% QC Assimilation
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Continuous validation against moored buoys and autonomous Argo profilers. 
                  RMSE: <strong>{VALIDATION_METRICS.rmse}</strong> • Correlation: <strong>{VALIDATION_METRICS.correlation}</strong>.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-sky-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">INCOIS & NOAA Assimilation</span>
                <button
                  onClick={onOpenAnalyticReport}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Full Report</span>
                </button>
              </div>
            </div>

            {/* CARD 2: Active Severe Storm Threat */}
            <div className="p-5 rounded-3xl bg-[#1e0818]/80 border border-red-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400 animate-pulse" />
                    <h3 className="font-bold text-white text-sm">Active Storm & Rain Threat</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-300 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30">
                    {activeRegion?.activeStorm?.category || 'Maritime Warning'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Wind Speed: <strong>{activeRegion?.activeStorm?.windSpeed || '55 km/h'}</strong> • 
                  Rain Probability: <strong>{activeRegion?.rainProbability ?? 40}%</strong> • 
                  Pressure: <strong>{activeRegion?.pressure || 1008} hPa</strong>.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-red-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">IMD & JTWC Bulletins</span>
                <button
                  onClick={onOpenStormNews}
                  className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Storm Tracks</span>
                </button>
              </div>
            </div>

            {/* CARD 3: Active Observing Fleet */}
            <div className="p-5 rounded-3xl bg-[#061b36]/80 border border-cyan-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Global Observing Fleet</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">
                    49 In-Situ Platforms
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  24 Moored Ocean Buoys • 18 Core & BGC Argo Floats • 7 Autonomous Slocum Gliders sampling the global ocean.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-cyan-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Real-Time Instrument Health</span>
                <button
                  onClick={onOpenFleetModal}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Inspect Fleet</span>
                </button>
              </div>
            </div>

            {/* CARD 4: Hydrostatic Pressure & TEOS-10 Physics */}
            <div className="p-5 rounded-3xl bg-[#0d163d]/80 border border-indigo-500/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-white text-sm">Hydrostatic Pressure Engine</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                    TEOS-10 Standard
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Computes depth-dependent pressure, in-situ density, and acoustic speed of sound based on international seawater physics.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-indigo-500/20 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Atmospheric & Hydrostatic Gradients</span>
                <button
                  onClick={onOpenDepthPressure}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Calculate Pressure</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Callout: Switch to Full Workstation */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a1f4a]/90 via-[#061536]/90 to-[#020b1e]/90 border border-cyan-500/30 text-center space-y-3">
            <h3 className="text-lg font-bold text-white">
              Ready for Deep Engineering & Modeling?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Open the full multi-panel engineering cockpit with simultaneous control panels, telemetry validation curves, and depth sliders.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                onClick={onSwitchToWorkstation}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-cyan transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Switch to Full Workstation</span>
              </button>
              <button
                onClick={onOpenControls}
                className="px-4 py-2.5 rounded-xl bg-[#0b1d47] hover:bg-[#122c6b] border border-sky-500/30 text-cyan-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Open Advanced Controls ⚙
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
