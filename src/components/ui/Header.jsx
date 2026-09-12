import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Moon, Bell, Compass, Globe2, FileText, Gauge, Database } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { getFormattedCurrentDate } from '../../utils/dateUtils';

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
  onOpenCopilot
}) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'Dashboard', label: t('navbar.dashboard', 'Dashboard') },
    { id: '3D View', label: t('navbar.threeDView', '3D View') },
    { id: 'El Niño Simulation', label: t('navbar.ensoSimulation', 'El Niño Simulation') },
    { id: 'Map View', label: t('navbar.mapView', 'Map View') },
    { id: 'Analytics', label: t('navbar.analytics', 'Analytics') },
    { id: 'Alerts', label: t('navbar.alerts', 'Alerts') },
    { id: 'Data Explorer', label: t('navbar.dataExplorer', 'Data Explorer') },
    { id: 'About', label: t('navbar.about', 'About') }
  ];

  return (
    <header className="h-16 px-4 sm:px-5 border-b border-sky-500/20 bg-[#060f26]/90 backdrop-blur-md flex items-center justify-between z-30 select-none">
      {/* Brand & Logo */}
      <div 
        onClick={() => setActiveTab('3D View')}
        className="flex items-center gap-3 cursor-pointer group shrink-0"
        title="Ocean Vision 3D | Explore • Analyze • Preserve"
      >
        <div className="relative">
          <img
            src="/oceanova-logo.jpg"
            alt="Ocean Vision 3D Logo"
            className="w-10 h-10 rounded-xl object-cover border border-cyan-400/50 shadow-glow-cyan group-hover:scale-105 transition-all"
          />
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060f26]" title={t('navbar.satelliteActive', 'Satellite Telemetry Active')} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white group-hover:from-white group-hover:to-cyan-200 transition-all">
              Ocean Vision 3D
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              v2.4 Live
            </span>
          </div>
          <p className="text-[10px] font-semibold text-sky-300/80 tracking-wider uppercase flex items-center gap-1.5">
            {t('brand.motto', 'Explore • Analyze • Preserve')}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden xl:flex items-center gap-1 bg-[#0a1638]/70 p-1 rounded-xl border border-sky-500/15">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'Alerts' && onOpenAlerts) onOpenAlerts();
                else if (tab.id === 'Analytics' && onOpenAnalyticReport) onOpenAnalyticReport();
                else setActiveTab(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-glow-cyan'
                  : 'text-slate-300 hover:text-white hover:bg-sky-500/10'
              }`}
            >
              {tab.id === 'Alerts' && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping mr-0.5" />
              )}
              {tab.id === 'Map View' && (
                <Globe2 className="w-3.5 h-3.5" />
              )}
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Live Date, Location & Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Multilingual Selector Dropdown - High priority, always visible */}
        <LanguageSelector />

        {/* Active Location & Coordinates Selector Badge */}
        <button
          onClick={onOpenLocationModal}
          title="Change Location or Enter Custom Lat/Lon Coordinates"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b1b42]/80 hover:bg-[#12285a] border border-sky-500/30 hover:border-cyan-400 text-xs text-sky-200 transition-all cursor-pointer shrink-0"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <div className="text-left leading-none">
            <div className="font-bold text-white text-[11px] truncate max-w-[100px] xl:max-w-[120px]">
              {activeRegion?.name || 'Bay of Bengal'}
            </div>
            <div className="text-[9px] font-mono text-cyan-300 mt-0.5 hidden 2xl:block">
              {activeRegion?.coords || '15.297° N, 87.860° E'}
            </div>
          </div>
        </button>

        {/* Live Date Engine Box */}
        <button
          onClick={onOpenDatePicker}
          title="Click to Open Observation Date & Temporal Engine"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b1b42]/80 hover:bg-[#12285a] border border-sky-500/30 hover:border-cyan-400 text-xs text-sky-200 font-mono transition-all group cursor-pointer shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">{selectedDate}</span>
          <span className="text-sky-500">•</span>
          <span className="text-cyan-300 font-bold">{currentTime || '12:00'} UTC</span>
        </button>

        {/* AI Ocean Copilot (Nerida) Trigger */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title="Open AI Ocean Copilot (Nerida)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600/90 via-cyan-600/90 to-sky-500/90 hover:from-teal-500 hover:to-cyan-400 border border-cyan-300/60 text-xs text-white shadow-glow-cyan transition-all cursor-pointer shrink-0"
          >
            <span className="text-sm">🧜‍♀️</span>
            <span className="font-bold hidden sm:inline text-[11px]">AI Copilot</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </button>
        )}

        {/* Analytic Report Quick Trigger */}
        <button
          onClick={onOpenAnalyticReport}
          title="Print & View Official Oceanographic Analytical Report"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600/80 to-cyan-500/80 hover:from-sky-500 hover:to-cyan-400 border border-cyan-400/40 text-xs text-white shadow-glow-cyan transition-all cursor-pointer shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-white" />
          <span className="font-bold hidden sm:inline text-[11px]">{t('navbar.reportBtn', 'Report')}</span>
        </button>

        {/* Storm Radar & News Bulletin Button */}
        <button
          onClick={onOpenStormNews}
          title="Live Marine Weather News, Rain & Storm Probability"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-xs text-red-300 shadow-glow-red transition-all cursor-pointer shrink-0"
        >
          <Bell className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="font-bold hidden sm:inline text-[11px]">{t('navbar.stormBtn', 'Storm')}</span>
          <span className="px-1.5 py-0.5 rounded bg-red-500/30 text-[9px] font-mono font-bold text-white">
            {activeRegion?.stormProbability ?? 30}%
          </span>
        </button>

        {/* Depth Pressure Quick Trigger (Visible on wider screens; accessible in 3D HUD) */}
        <button
          onClick={onOpenDepthPressure}
          title="Hydrostatic Pressure Profiler across Depths"
          className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1b42]/80 hover:bg-[#12285a] border border-sky-500/30 hover:border-cyan-400 text-xs text-sky-200 transition-all cursor-pointer shrink-0"
        >
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-[11px]">{t('navbar.pressureCalc', 'Pressure Calc')}</span>
        </button>

        {/* NetCDF CF-1.8 Data Ingestion Trigger (Visible on wider screens; accessible via Data Explorer tab) */}
        <button
          onClick={onOpenNetcdfIngestion}
          title="Ingest NetCDF CF-1.8 / Delimited Oceanographic Datasets"
          className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1b42]/80 hover:bg-[#12285a] border border-cyan-500/30 hover:border-cyan-400 text-xs text-cyan-200 transition-all cursor-pointer shrink-0"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-[11px]">{t('navbar.netcdfIngest', 'Ingest NetCDF')}</span>
        </button>

        {/* Night / Theme toggle */}
        <button 
          title="Toggle Day/Night Mode"
          className="p-2 rounded-xl bg-[#0b1b42]/80 border border-sky-500/20 text-sky-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors shrink-0"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
