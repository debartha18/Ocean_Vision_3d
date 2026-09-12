import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
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
  onOpenCopilot,
  onOpenControls
}) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="h-16 px-3 sm:px-5 border-b border-sky-500/20 bg-[#060f26]/90 backdrop-blur-md flex items-center justify-between z-30 select-none">
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
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-cyan-400/50 shadow-glow-cyan group-hover:scale-105 transition-all"
          />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#060f26]" title={t('navbar.satelliteActive', 'Satellite Telemetry Active')} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white group-hover:from-white group-hover:to-cyan-200 transition-all">
              Ocean Vision 3D
            </h1>
            <span className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              v2.4 Live
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] font-semibold text-sky-300/80 tracking-wider uppercase hidden sm:flex items-center gap-1.5">
            {t('brand.motto', 'Explore • Analyze • Preserve')}
          </p>
        </div>
      </div>

      {/* 2. Story Storytelling Nav Links (When in Story View) */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#0a1638]/70 p-1 rounded-xl border border-sky-500/15">
        <button
          onClick={() => handleScrollTo('section-hero')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-sky-500/10 transition-colors cursor-pointer"
        >
          {t('story.overview', 'Overview')}
        </button>
        <button
          onClick={() => handleScrollTo('section-explore')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-sky-500/10 transition-colors cursor-pointer"
        >
          {t('story.explore', 'Explore')}
        </button>
        <button
          onClick={() => handleScrollTo('section-parameters')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-sky-500/10 transition-colors cursor-pointer"
        >
          {t('story.oceanData', 'Ocean Data')}
        </button>
        <button
          onClick={() => handleScrollTo('section-ai')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-sky-500/10 transition-colors cursor-pointer"
        >
          {t('story.aiAnalysis', 'AI Analysis')}
        </button>
        <button
          onClick={() => handleScrollTo('section-insights')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-sky-500/10 transition-colors cursor-pointer"
        >
          {t('story.insights', 'Insights')}
        </button>

        <span className="text-sky-500/40 px-1">|</span>

        {/* Mode Toggle: Story View ↔ Workstation */}
        <button
          onClick={() => setActiveTab(activeTab === 'Story View' ? '3D View' : 'Story View')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === '3D View'
              ? 'bg-cyan-500 text-white shadow-glow-cyan'
              : 'text-cyan-300 hover:bg-cyan-500/20'
          }`}
          title="Toggle between Clean Storytelling Mode and Full Multi-Panel Workstation"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>{activeTab === '3D View' ? t('story.workstationActive', 'Workstation Mode') : t('story.workstation', 'Workstation')}</span>
        </button>
      </nav>

      {/* 3. Right Action Strip */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Advanced Controls Button (⚙ Controls) */}
        {onOpenControls && (
          <button
            onClick={onOpenControls}
            title="Open Advanced 3D & Data Controls Drawer"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#091b40]/90 hover:bg-[#12285a] border border-sky-500/30 hover:border-cyan-400 text-xs text-sky-200 transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-[11px] hidden sm:inline">⚙ {t('story.controls', 'Controls')}</span>
          </button>
        )}

        {/* Multilingual Selector Dropdown - High priority, always visible */}
        <LanguageSelector />

        {/* Active Location & Coordinates Selector Badge */}
        <button
          onClick={onOpenLocationModal}
          title="Change Location or Enter Custom Lat/Lon Coordinates"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b1b42]/80 hover:bg-[#12285a] border border-sky-500/30 hover:border-cyan-400 text-xs text-sky-200 transition-all cursor-pointer shrink-0"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <div className="text-left leading-none">
            <div className="font-bold text-white text-[11px] truncate max-w-[100px] xl:max-w-[120px]">
              {activeRegion?.name || 'Bay of Bengal'}
            </div>
            <div className="text-[9px] font-mono text-cyan-300 mt-0.5 hidden 2xl:block">
              {activeRegion?.coords || '15.297° N, 87.860° E'}
            </div>
          </div>
        </button>

        {/* AI Ocean Copilot (Nerida) Trigger */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title="Open AI Ocean Copilot (Nerida)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600/90 via-cyan-600/90 to-sky-500/90 hover:from-teal-500 hover:to-cyan-400 border border-cyan-300/60 text-xs text-white shadow-glow-cyan transition-all cursor-pointer shrink-0"
          >
            <span className="text-sm">🧜‍♀️</span>
            <span className="font-bold hidden sm:inline text-[11px]">AI Copilot</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </button>
        )}

        {/* Quick App Views Menu (Dashboard, Map, El Niño, About) */}
        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="More Views & Dashboards"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0a1638] hover:bg-[#122452] border border-sky-500/30 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span className="hidden xl:inline text-[11px] font-semibold">Views</span>
          </button>

          {/* Views Dropdown */}
          {mobileMenuOpen && (
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#06112c]/98 border border-cyan-500/40 shadow-2xl backdrop-blur-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-xs"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-sky-400/80 uppercase tracking-wider">
                Workspaces & Views
              </div>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-200 font-bold'
                      : 'text-slate-300 hover:bg-sky-500/10 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}

              <div className="pt-2 border-t border-sky-500/20 space-y-1">
                <button
                  onClick={onOpenAnalyticReport}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:bg-sky-500/10 hover:text-white flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Validation Report</span>
                </button>
                <button
                  onClick={onOpenStormNews}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:bg-sky-500/10 hover:text-white flex items-center gap-2"
                >
                  <Bell className="w-3.5 h-3.5 text-red-400" />
                  <span>Storm Radar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
