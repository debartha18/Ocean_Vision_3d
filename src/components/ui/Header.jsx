import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Moon, 
  Bell, 
  Compass, 
  Globe2, 
  FileText, 
  Gauge, 
  Database,
  Sliders,
  Maximize2,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  CloudRain,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Radio
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { getFormattedCurrentDate } from '../../utils/dateUtils';
import { AI_ANOMALY, MARINE_NEWS_BULLETINS } from '../../data/oceanData';

export default function Header({
  activeTab,
  setActiveTab,
  currentTime,
  selectedDate = getFormattedCurrentDate(),
  onOpenDatePicker,
  activeRegion,
  onOpenLocationModal,
  onOpenStormNews,
  onOpenAlerts,
  onOpenAnalyticReport,
  onOpenDepthPressure,
  onOpenNetcdfIngestion,
  onOpenCopilot,
  onOpenControls
}) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsRef = useRef(null);
  const viewsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target)) {
        setAlertsOpen(false);
      }
      if (viewsRef.current && !viewsRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (alertsOpen || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [alertsOpen, mobileMenuOpen]);

  const tabs = [
    { id: 'Story View', label: t('story.storyMode', 'Story Experience') },
    { id: '3D View', label: t('story.workstationMode', 'Workstation') },
    { id: 'Dashboard', label: t('navbar.dashboard', 'Dashboard') },
    { id: 'Map View', label: t('navbar.mapView', 'Map View') },
    { id: 'El Niño Simulation', label: t('navbar.ensoSimulation', 'El Niño') },
    { id: 'Data Explorer', label: t('navbar.dataExplorer', 'Data Explorer') },
    { id: 'About', label: t('navbar.about', 'About') }
  ];

  const handleScrollTo = (sectionId) => {
    if (activeTab !== 'Story View') {
      setActiveTab('Story View');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="h-16 px-3 sm:px-5 border-b border-[#193544] bg-[#0A1720]/95 backdrop-blur-md flex items-center justify-between z-30 select-none">
      {/* 1. Brand & Logo */}
      <div 
        onClick={() => setActiveTab('Story View')}
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        title="Ocean Vision 3D | Explore • Analyze • Preserve"
      >
        <div className="relative">
          <img
            src="/oceanova-logo.jpg"
            alt="Ocean Vision 3D Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#214555] group-hover:border-[#0C969C] transition-all"
          />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#0C969C] border-2 border-[#0A1720]" title={t('navbar.satelliteActive', 'Satellite Telemetry Active')} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider text-[#CCD0CF] group-hover:text-white transition-all">
              Ocean Vision 3D
            </h1>
            <span className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider bg-[#0C969C]/15 text-[#6BA3BE] border border-[#193544] rounded">
              v2.4 Live
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] font-medium text-[#8FA8B2] tracking-wider uppercase hidden sm:flex items-center gap-1.5">
            {t('brand.motto', 'Explore • Analyze • Preserve')}
          </p>
        </div>
      </div>

      {/* 2. Story Storytelling Nav Links (When in Story View) */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#0D202B] p-1 rounded-xl border border-[#193544]">
        <button
          onClick={() => handleScrollTo('section-hero')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
        >
          {t('story.overview', 'Overview')}
        </button>
        <button
          onClick={() => handleScrollTo('section-explore')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
        >
          {t('story.explore', 'Explore')}
        </button>
        <button
          onClick={() => handleScrollTo('section-parameters')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
        >
          {t('story.oceanData', 'Ocean Data')}
        </button>
        <button
          onClick={() => handleScrollTo('section-ai')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
        >
          {t('story.aiAnalysis', 'AI Analysis')}
        </button>
        <button
          onClick={() => handleScrollTo('section-insights')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#142D3A] transition-colors cursor-pointer"
        >
          {t('story.insights', 'Insights')}
        </button>

        <span className="text-[#193544] px-1">|</span>

        {/* Mode Toggle: Story View ↔ Workstation */}
        <button
          onClick={() => setActiveTab(activeTab === 'Story View' ? '3D View' : 'Story View')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            activeTab === '3D View'
              ? 'bg-[#0C969C]/20 border-[#0C969C]/60 text-[#CCD0CF]'
              : 'bg-[#142D3A] border-[#214555] text-[#8FA8B2] hover:text-[#CCD0CF] hover:bg-[#183746]'
          }`}
          title="Toggle between Clean Storytelling Mode and Full Multi-Panel Workstation"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#0C969C]" />
          <span>{activeTab === '3D View' ? t('story.workstationActive', 'Workstation Mode') : t('story.workstation', 'Workstation')}</span>
        </button>
      </nav>

      {/* 3. Right Action Strip */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Advanced Controls Button (⚙ Controls) */}
        {onOpenControls && (
          <button
            onClick={onOpenControls}
            title={t('story.controls', 'Controls')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] hover:border-[#0C969C] text-xs text-[#CCD0CF] transition-all cursor-pointer shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-[#0C969C]" />
            <span className="font-medium text-[11px] hidden sm:inline">{t('story.controls', 'Controls')}</span>
          </button>
        )}

        {/* Multilingual Selector Dropdown */}
        <LanguageSelector />

        {/* Active Location & Coordinates Selector Badge */}
        <button
          onClick={onOpenLocationModal}
          title={t('locationModal.title', 'Change Location or Enter Custom Lat/Lon Coordinates')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] hover:border-[#214555] text-xs text-[#CCD0CF] transition-all cursor-pointer shrink-0"
        >
          <Compass className="w-3.5 h-3.5 text-[#0C969C]" />
          <div className="text-left leading-none">
            <div className="font-semibold text-[#CCD0CF] text-[11px] truncate max-w-[100px] xl:max-w-[120px]">
              {activeRegion?.name ? t(`regions.${activeRegion.id}`, activeRegion.name) : 'Bay of Bengal'}
            </div>
            <div className="text-[9px] font-mono text-[#6BA3BE] mt-0.5 hidden 2xl:block">
              {activeRegion?.coords || '15.297° N, 87.860° E'}
            </div>
          </div>
        </button>

        {/* Real-Time Oceanographic Threat & Storm Alerts Section */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => {
              setAlertsOpen(!alertsOpen);
              setMobileMenuOpen(false);
            }}
            title={t('navbar.alertsTitle', 'Oceanographic Threat & Marine Alerts')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer shrink-0 ${
              alertsOpen
                ? 'bg-[#183746] border-[#D6A84F] text-amber-300 shadow-glow-amber'
                : 'bg-[#142D3A] hover:bg-[#183746] border-[#214555] hover:border-[#D6A84F]/60 text-[#CCD0CF]'
            }`}
          >
            <div className="relative flex items-center">
              <Bell className="w-3.5 h-3.5 text-[#D6A84F]" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            </div>
            <span className="font-semibold text-[11px]">{t('navbar.alerts', 'Alerts')}</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold">
              {activeRegion?.stormProbability ? `${activeRegion.stormProbability}%` : 'LIVE'}
            </span>
          </button>

          {/* Alerts Dropdown Drawer */}
          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0A1720]/95 border border-[#193544] shadow-2xl backdrop-blur-2xl z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#193544]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#CCD0CF] text-xs flex items-center gap-1.5">
                      <span>{t('navbar.oceanAlerts', 'Oceanographic Threat Alerts')}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 font-mono font-bold">
                        {t('navbar.liveActive', '2 ACTIVE')}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#637C87] font-mono">
                      {activeRegion?.name} • {activeRegion?.coords || '15.297° N, 87.860° E'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setAlertsOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#142D3A] text-[#8FA8B2] hover:text-[#CCD0CF] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Alert Card 1: Active Storm & Convective Threat */}
              <div className="bg-[#0D202B] rounded-xl p-2.5 border border-[#193544] hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-xs text-amber-300">
                      {activeRegion?.activeStorm?.category || 'Tropical Weather System'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {activeRegion?.stormProbability ?? 35}% {t('controls.stormRisk', 'Risk')}
                  </span>
                </div>
                <p className="text-[11px] text-[#8FA8B2] leading-tight mb-2">
                  {activeRegion?.activeStorm?.name || 'Monsoon Convective Squall Line'}: {activeRegion?.activeStorm?.rainfallForecast || 'Squally showers with elevated sea state.'}
                </p>
                <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-lg bg-[#06141B] border border-[#142D3A] text-[10px] font-mono mb-2">
                  <div>
                    <span className="text-[#637C87] block text-[9px]">WIND</span>
                    <span className="text-[#CCD0CF] font-bold">{activeRegion?.activeStorm?.windSpeed || `${activeRegion?.windSpeedKmH || 26} km/h`}</span>
                  </div>
                  <div>
                    <span className="text-[#637C87] block text-[9px]">SWELL</span>
                    <span className="text-[#CCD0CF] font-bold">{activeRegion?.waveHeight ?? 1.65}m</span>
                  </div>
                  <div>
                    <span className="text-[#637C87] block text-[9px]">RAIN CHANCE</span>
                    <span className="text-cyan-400 font-bold">{activeRegion?.rainProbability ?? 42}%</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAlertsOpen(false);
                    onOpenStormNews?.();
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>{t('stormModal.openRadar', 'Open Coastal Beach & Storm Radar')}</span>
                </button>
              </div>

              {/* Alert Card 2: Subsurface Thermal Anomaly & Marine Heatwave */}
              <div className="bg-[#0D202B] rounded-xl p-2.5 border border-[#193544] hover:border-red-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-bold text-xs text-rose-300">
                      {AI_ANOMALY.anomalyType}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold">
                    +2.45 °C
                  </span>
                </div>
                <p className="text-[11px] text-[#8FA8B2] leading-tight mb-2">
                  {AI_ANOMALY.headline}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#637C87] mb-2 px-1">
                  <span>Layer: <strong className="text-[#CCD0CF]">{AI_ANOMALY.depthRange}</strong></span>
                  <span>QC: <strong className="text-emerald-400">{AI_ANOMALY.confidence} Validated</strong></span>
                </div>
                <button
                  onClick={() => {
                    setAlertsOpen(false);
                    onOpenAlerts?.();
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-rose-300 font-semibold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>{t('anomalyModal.openDiagnostics', 'View AI Anomaly Diagnostics')}</span>
                </button>
              </div>

              {/* Card 3: In-Situ Marine Sensor Bulletin */}
              {MARINE_NEWS_BULLETINS?.[0] && (
                <div className="p-2 rounded-xl bg-[#06141B] border border-[#142D3A] flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                  <div className="text-[10px] leading-tight">
                    <div className="font-semibold text-[#CCD0CF]">{MARINE_NEWS_BULLETINS[0].title}</div>
                    <div className="text-[#637C87] mt-0.5">{MARINE_NEWS_BULLETINS[0].source} • {MARINE_NEWS_BULLETINS[0].time}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick App Views Menu (Dashboard, Map, El Niño, About) */}
        <div className="relative" ref={viewsRef}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title={t('navbar.views', 'Views')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] text-xs text-[#CCD0CF] transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4 text-[#8FA8B2]" />
            <span className="hidden xl:inline text-[11px] font-medium">{t('navbar.views', 'Views')}</span>
          </button>

          {/* Views Dropdown */}
          {mobileMenuOpen && (
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0A1720] border border-[#193544] shadow-2xl backdrop-blur-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 text-xs"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-[#637C87] uppercase tracking-wider">
                {t('navbar.workspacesViews', 'Workspaces & Views')}
              </div>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#0C969C]/15 text-[#CCD0CF] font-semibold border border-[#0C969C]/30'
                      : 'text-[#8FA8B2] hover:bg-[#142D3A] hover:text-[#CCD0CF]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0C969C]" />}
                </button>
              ))}

              <div className="pt-1.5 mt-1 border-t border-[#193544] space-y-0.5">
                <button
                  onClick={onOpenAnalyticReport}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#8FA8B2] hover:bg-[#142D3A] hover:text-[#CCD0CF] flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0C969C]" />
                  <span>{t('analytics.reportModalTitle', 'Validation Report')}</span>
                </button>
                <button
                  onClick={onOpenStormNews}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#8FA8B2] hover:bg-[#142D3A] hover:text-[#CCD0CF] flex items-center gap-2"
                >
                  <Bell className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>{t('navbar.stormRadar', 'Storm Radar')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
