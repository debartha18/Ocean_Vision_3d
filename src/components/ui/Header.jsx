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

        {/* AI Ocean Copilot (Nerida) Trigger */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title={t('mascot.openCopilot', 'Open AI Ocean Copilot (Nerida)')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#142D3A] hover:bg-[#183746] border border-[#214555] hover:border-[#0C969C] text-xs text-[#CCD0CF] transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0C969C]" />
            <span className="font-semibold hidden sm:inline text-[11px]">{t('copilot.title', 'AI Copilot')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C969C]" />
          </button>
        )}

        {/* Quick App Views Menu (Dashboard, Map, El Niño, About) */}
        <div className="relative">
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
