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
      gradient: 'from-[#0D202B] to-[#0A1720]',
      border: 'border-[#193544]',
      textColor: 'text-amber-400',
      summary: 'Sea Surface Temperature governs tropical atmospheric squalls, monsoon rainfall dynamics, and thermal expansion.',
      details: 'Upper-layer warmth fuels low-pressure disturbances and cyclone genesis. Below the mixed layer, temperature decays through the thermocline down to 4°C in the deep abyss.'
    },
    {
      id: 'salinity',
      title: t('parameters.salinity', 'Salinity'),
      badge: `${calculateParameterAtDepth('salinity', 50, activeRegion)} PSU`,
      depthTarget: 50,
      icon: Droplets,
      gradient: 'from-[#0D202B] to-[#0A1720]',
      border: 'border-[#193544]',
      textColor: 'text-[#0C969C]',
      summary: 'Salinity governs seawater density alongside temperature, modulating vertical mixing and circulation.',
      details: 'Colossal river discharge in northern basins creates a buoyant freshwater lens, forming a persistent barrier layer that traps solar heat and limits nutrient upwelling.'
    },
    {
      id: 'currents',
      title: t('parameters.currents', 'Ocean Currents'),
      badge: `${activeRegion?.currentSpeed ?? 0.48} m/s`,
      depthTarget: 20,
      icon: Wind,
      gradient: 'from-[#0D202B] to-[#0A1720]',
      border: 'border-[#193544]',
      textColor: 'text-[#6BA3BE]',
      summary: 'Wind-stress curl and Coriolis forcing propel geostrophic boundary currents and Ekman transport.',
      details: 'Major circulation features redistribute heat, dissolved gases, and biological nutrients across global ocean basins, dictating regional marine ecosystems and fisheries.'
    },
    {
      id: 'depth',
      title: t('controls.verticalDepth', 'Depth & Stratification'),
      badge: `${depth}m Layer`,
      depthTarget: 500,
      icon: Waves,
      gradient: 'from-[#0D202B] to-[#0A1720]',
      border: 'border-[#193544]',
      textColor: 'text-[#8FA8B2]',
      summary: 'The water column transitions from the sunlit photic zone into the dark bathypelagic abyss.',
      details: 'Pycnocline stratification defines distinct ecological realms: the Epipelagic zone (0–200m), Twilight Mesopelagic zone (200–1000m), and the cold, high-pressure Bathypelagic realm (>1000m).'
    }
  ];

  return (
    <div className="relative w-full text-[#CCD0CF] select-none overflow-x-hidden">
      {/* Floating Section Progress Dots (Desktop) */}
      <nav 
        aria-label="Story sections"
        className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 bg-[#0A1720]/90 backdrop-blur-md p-2 rounded-full border border-[#193544] shadow-lg"
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
                ? 'w-3 h-3 bg-[#0C969C] shadow-[0_0_8px_rgba(12,150,156,0.5)] scale-125' 
                : 'bg-[#193544] hover:bg-[#8FA8B2]'
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D202B] border border-[#193544] text-[#8FA8B2] text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0C969C] animate-pulse" />
            <span className="text-[#CCD0CF]">{t('brand.name', 'Ocean Vision 3D')} • {t('brand.version', 'v2.4 Live')}</span>
            <span className="text-[#214555]">|</span>
            <span className="text-[#8FA8B2]">{t('navbar.satelliteActive', 'Satellite Telemetry Active')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#CCD0CF] via-[#8FA8B2] to-[#637C87] drop-shadow-lg">
            OCEAN VISION 3D
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-[#8FA8B2] max-w-2xl mx-auto font-medium leading-relaxed">
            {t('story.heroSubtitle', 'Explore, visualize and understand our oceans through interactive 3D data.')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => scrollToSection('section-explore')}
              className="px-6 py-3 rounded-2xl bg-[#0C969C] hover:bg-[#168FA0] text-[#06141B] font-bold text-sm shadow-[0_4px_20px_rgba(12,150,156,0.3)] transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>{t('story.exploreNow', 'Explore Now')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onSwitchToWorkstation}
              className="px-5 py-3 rounded-2xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] hover:border-[#214555] text-[#CCD0CF] text-sm font-semibold backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
              title="Switch to Full Multi-Panel Engineering Cockpit"
            >
              <Maximize2 className="w-4 h-4 text-[#0C969C]" />
              <span>{t('story.workstationMode', 'Launch Workstation')}</span>
            </button>

            <button
              onClick={onOpenControls}
              className="px-4 py-3 rounded-2xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] hover:border-[#214555] text-[#8FA8B2] hover:text-[#CCD0CF] text-sm font-semibold backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>⚙ {t('story.controls', 'Controls')}</span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          onClick={() => scrollToSection('section-explore')}
          className="cursor-pointer group flex flex-col items-center gap-1.5 pt-8 text-[#8FA8B2] hover:text-[#CCD0CF] transition-colors pointer-events-auto"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#637C87] group-hover:text-[#CCD0CF]">
            {t('story.scrollToExplore', '↓ SCROLL TO EXPLORE')}
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#0C969C]" />
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
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#193544] bg-[#0A1720]/90 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#0C969C] uppercase tracking-widest mb-1">
                  <Compass className="w-4 h-4" />
                  <span>STEP 1 • DISCOVERY</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-[#CCD0CF]">
                  Explore the Ocean
                </h2>
                <p className="text-sm sm:text-base text-[#8FA8B2] mt-1 max-w-2xl">
                  Select a regional basin or enter custom coordinates. The 3D digital-twin in the background responds in real-time.
                </p>
              </div>

              {/* Coordinates Badge */}
              <button
                onClick={onOpenLocationModal}
                className="px-4 py-2.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] hover:border-[#214555] text-left transition-all cursor-pointer group shrink-0"
              >
                <div className="text-[10px] text-[#637C87] uppercase font-bold">Current Basin</div>
                <div className="text-sm font-bold text-[#CCD0CF] group-hover:text-white flex items-center gap-1.5">
                  <span>{activeRegion?.name || 'Bay of Bengal'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0C969C]" />
                </div>
                <div className="text-[10px] font-mono text-[#8FA8B2] mt-0.5">
                  {activeRegion?.coords || '15.297° N, 87.860° E'}
                </div>
              </button>
            </div>

            {/* Quick Basin Selector Chips */}
            <div className="pt-2 border-t border-[#193544]">
              <span className="text-[11px] font-bold text-[#637C87] uppercase tracking-wider block mb-2">
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
                          ? 'bg-[#0C969C] text-[#06141B] border-[#0C969C] font-bold shadow-sm'
                          : 'bg-[#0D202B] text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] border-[#193544]'
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
              <div className="p-3 rounded-xl bg-[#0D202B] border border-[#193544]">
                <span className="text-[10px] text-[#637C87] font-medium">Sea Surface Temp</span>
                <div className="text-base font-bold text-amber-400">{activeRegion?.sst ?? 29.5} °C</div>
                <span className="text-[9px] text-[#8FA8B2]">Live Satellite Ingestion</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D202B] border border-[#193544]">
                <span className="text-[10px] text-[#637C87] font-medium">Significant Wave Swell</span>
                <div className="text-base font-bold text-[#6BA3BE]">{activeRegion?.waveHeight ?? 1.65} m</div>
                <span className="text-[9px] text-[#8FA8B2]">Monsoonal Swell</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D202B] border border-[#193544]">
                <span className="text-[10px] text-[#637C87] font-medium">Surface Wind Speed</span>
                <div className="text-base font-bold text-[#CCD0CF]">{activeRegion?.windSpeedKmH ?? 24} km/h</div>
                <span className="text-[9px] text-[#8FA8B2]">Atmospheric Forcing</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D202B] border border-[#193544] flex flex-col justify-between">
                <span className="text-[10px] text-[#637C87] font-medium">Storm Threat Layer</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isStormLayerActive ? 'bg-amber-400 animate-ping' : 'bg-[#637C87]'}`} />
                  <span className="text-xs font-bold text-[#CCD0CF]">{isStormLayerActive ? 'Active' : 'Standby'}</span>
                </div>
                <button
                  onClick={() => setIsStormLayerActive(!isStormLayerActive)}
                  className="text-[10px] text-[#0C969C] hover:underline text-left cursor-pointer"
                >
                  {isStormLayerActive ? 'Turn Off' : 'Toggle 3D Storm'}
                </button>
              </div>
            </div>

            {/* Orbit & Zoom Hint */}
            <div className="flex items-center justify-between text-[11px] text-[#8FA8B2] pt-1">
              <span>💡 <strong>Tip:</strong> Drag the background 3D ocean to rotate • Scroll to zoom • Right-click to pan</span>
              <button
                onClick={onOpenControls}
                className="text-[#0C969C] hover:text-[#168FA0] font-semibold cursor-pointer"
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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0C969C] uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              <span>STEP 2 • OCEAN DATA</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#CCD0CF]">
              Discover Ocean Parameters
            </h2>
            <p className="text-sm sm:text-base text-[#8FA8B2] max-w-2xl mx-auto">
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
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-xl flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#102633] border-[#0C969C]/60 shadow-[0_8px_25px_rgba(0,0,0,0.3)] scale-[1.01]'
                      : 'bg-[#0D202B] border-[#193544] hover:bg-[#142D3A] hover:border-[#214555]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0A1720] border border-[#193544]">
                          <IconComp className={`w-5 h-5 ${param.textColor}`} />
                        </div>
                        <h3 className="text-lg font-bold text-[#CCD0CF] tracking-wide">
                          {param.title}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-[#0A1720] border border-[#193544] ${param.textColor}`}>
                        {param.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#8FA8B2] font-medium leading-relaxed">
                      {param.summary}
                    </p>
                    <p className="text-[11px] text-[#637C87] mt-2 leading-relaxed">
                      {param.details}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#193544]">
                    <span className="text-[10px] text-[#6BA3BE] font-mono">
                      Target Depth: {param.depthTarget}m
                    </span>
                    <button
                      className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-[#0C969C] text-[#06141B]' 
                          : 'bg-[#142D3A] hover:bg-[#183746] border border-[#214555] text-[#8FA8B2] hover:text-[#CCD0CF]'
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
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#193544] bg-[#0A1720]/95 backdrop-blur-xl shadow-xl space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#193544]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0D202B] border border-[#193544] flex items-center justify-center">
                  <span className="text-2xl">🧜‍♀️</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0C969C] uppercase tracking-widest">
                      {t('story.aiAnalysisSub', 'AI Ocean Analysis')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#142D3A] text-[#0C969C] border border-[#214555]">
                      Nerida Copilot
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#CCD0CF]">
                    {t('story.aiAnalysisTitle', 'What is happening in this region?')}
                  </h2>
                </div>
              </div>

              {/* Full Copilot Drawer Trigger */}
              <button
                onClick={onOpenCopilot}
                className="px-4 py-2 rounded-xl bg-[#0C969C] hover:bg-[#168FA0] text-[#06141B] font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <span>Open Full Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[11px] font-bold text-[#637C87] uppercase tracking-wider block mb-2">
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
                    className="px-3 py-1.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] text-xs text-[#8FA8B2] hover:text-[#CCD0CF] transition-all cursor-pointer font-medium disabled:opacity-50"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Box */}
            <div className="p-4 rounded-xl bg-[#06141B] border border-[#193544] min-h-[120px] flex flex-col justify-between">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-[#0C969C] text-xs font-semibold py-6">
                  <span className="w-2 h-2 rounded-full bg-[#0C969C] animate-ping" />
                  <span>Nerida is thinking... synthesizing oceanographic telemetry</span>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-[#CCD0CF] leading-relaxed whitespace-pre-wrap font-sans">
                  {aiResponse || 'Ask Nerida about regional marine life, current velocity, or physical stratification.'}
                </div>
              )}

              {/* In-situ Provenance Stamp */}
              <div className="pt-3 mt-3 border-t border-[#193544] flex items-center justify-between text-[10px] text-[#637C87]">
                <span>Provenance: TEOS-10 Thermodynamic Formulae • PIRATA / INCOIS In-Situ Buoys</span>
                <span className="text-[#0C969C] font-mono">QC Passed (99.4%)</span>
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#06141B] border border-[#193544] text-xs text-[#CCD0CF] placeholder-[#637C87] focus:outline-none focus:border-[#0C969C]"
              />
              <button
                type="submit"
                disabled={!aiCustomInput.trim() || aiLoading}
                className="px-4 py-2.5 rounded-xl bg-[#0C969C] hover:bg-[#168FA0] disabled:opacity-40 text-[#06141B] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0C969C] uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              <span>STEP 4 • ANALYSIS & SYNTHESIS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#CCD0CF]">
              {t('story.insightsTitle', 'Ocean Insights')}
            </h2>
            <p className="text-sm sm:text-base text-[#8FA8B2] max-w-2xl mx-auto">
              Empirical in-situ validation, storm threat bulletins, observing fleet telemetry, and thermodynamic calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CARD 1: Model vs Observed Validation */}
            <div className="p-5 rounded-2xl bg-[#0D202B] border border-[#193544] backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-[#CCD0CF] text-sm">Model vs Observed Telemetry</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                    99.4% QC Assimilation
                  </span>
                </div>
                <p className="text-xs text-[#8FA8B2] leading-relaxed">
                  Continuous validation against moored buoys and autonomous Argo profilers. 
                  RMSE: <strong className="text-[#CCD0CF]">{VALIDATION_METRICS.rmse}</strong> • Correlation: <strong className="text-[#CCD0CF]">{VALIDATION_METRICS.correlation}</strong>.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#193544] flex items-center justify-between">
                <span className="text-[10px] text-[#637C87]">INCOIS & NOAA Assimilation</span>
                <button
                  onClick={onOpenAnalyticReport}
                  className="px-3 py-1.5 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] text-[#CCD0CF] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0C969C]" />
                  <span>Full Report</span>
                </button>
              </div>
            </div>

            {/* CARD 2: Active Severe Storm Threat */}
            <div className="p-5 rounded-2xl bg-[#0D202B] border border-[#193544] backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-[#CCD0CF] text-sm">Active Storm & Rain Threat</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                    {activeRegion?.activeStorm?.category || 'Maritime Warning'}
                  </span>
                </div>
                <p className="text-xs text-[#8FA8B2] leading-relaxed">
                  Wind Speed: <strong className="text-[#CCD0CF]">{activeRegion?.activeStorm?.windSpeed || '55 km/h'}</strong> • 
                  Rain Probability: <strong className="text-[#CCD0CF]">{activeRegion?.rainProbability ?? 40}%</strong> • 
                  Pressure: <strong className="text-[#CCD0CF]">{activeRegion?.pressure || 1008} hPa</strong>.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#193544] flex items-center justify-between">
                <span className="text-[10px] text-[#637C87]">IMD & JTWC Bulletins</span>
                <button
                  onClick={onOpenStormNews}
                  className="px-3 py-1.5 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] text-[#CCD0CF] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Storm Tracks</span>
                </button>
              </div>
            </div>

            {/* CARD 3: Active Observing Fleet */}
            <div className="p-5 rounded-2xl bg-[#0D202B] border border-[#193544] backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#0C969C]" />
                    <h3 className="font-bold text-[#CCD0CF] text-sm">Global Observing Fleet</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0C969C] px-2 py-0.5 rounded bg-[#142D3A] border border-[#214555]">
                    49 In-Situ Platforms
                  </span>
                </div>
                <p className="text-xs text-[#8FA8B2] leading-relaxed">
                  24 Moored Ocean Buoys • 18 Core & BGC Argo Floats • 7 Autonomous Slocum Gliders sampling the global ocean.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#193544] flex items-center justify-between">
                <span className="text-[10px] text-[#637C87]">Real-Time Instrument Health</span>
                <button
                  onClick={onOpenFleetModal}
                  className="px-3 py-1.5 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] text-[#CCD0CF] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-[#0C969C]" />
                  <span>Inspect Fleet</span>
                </button>
              </div>
            </div>

            {/* CARD 4: Hydrostatic Pressure & TEOS-10 Physics */}
            <div className="p-5 rounded-2xl bg-[#0D202B] border border-[#193544] backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[#6BA3BE]" />
                    <h3 className="font-bold text-[#CCD0CF] text-sm">Hydrostatic Pressure Engine</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#6BA3BE] px-2 py-0.5 rounded bg-[#142D3A] border border-[#214555]">
                    TEOS-10 Standard
                  </span>
                </div>
                <p className="text-xs text-[#8FA8B2] leading-relaxed">
                  Computes depth-dependent pressure, in-situ density, and acoustic speed of sound based on international seawater physics.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#193544] flex items-center justify-between">
                <span className="text-[10px] text-[#637C87]">Atmospheric & Hydrostatic Gradients</span>
                <button
                  onClick={onOpenDepthPressure}
                  className="px-3 py-1.5 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] text-[#CCD0CF] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Gauge className="w-3.5 h-3.5 text-[#6BA3BE]" />
                  <span>Calculate Pressure</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Callout: Switch to Full Workstation */}
          <div className="p-6 rounded-2xl bg-[#0A1720] border border-[#193544] text-center space-y-3">
            <h3 className="text-lg font-bold text-[#CCD0CF]">
              Ready for Deep Engineering & Modeling?
            </h3>
            <p className="text-xs text-[#8FA8B2] max-w-xl mx-auto">
              Open the full multi-panel engineering cockpit with simultaneous control panels, telemetry validation curves, and depth sliders.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                onClick={onSwitchToWorkstation}
                className="px-5 py-2.5 rounded-xl bg-[#0C969C] hover:bg-[#168FA0] text-[#06141B] font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Switch to Full Workstation</span>
              </button>
              <button
                onClick={onOpenControls}
                className="px-4 py-2.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] hover:border-[#214555] text-[#CCD0CF] text-xs font-semibold transition-all cursor-pointer"
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
