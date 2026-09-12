import React, { useState, useEffect } from 'react';
import Header from './components/ui/Header';
import LeftControlPanel from './components/ui/LeftControlPanel';
import ViewportToolbar from './components/ui/ViewportToolbar';
import RightAnalyticsPanel from './components/ui/RightAnalyticsPanel';
import BottomParameterStrip from './components/ui/BottomParameterStrip';
import BuoyDetailModal from './components/ui/BuoyDetailModal';
import AnomalyModal from './components/ui/AnomalyModal';
import FleetModal from './components/ui/FleetModal';
import LocationModal from './components/ui/LocationModal';
import DatePickerModal from './components/ui/DatePickerModal';
import StormNewsModal from './components/ui/StormNewsModal';
import WorldMapView from './components/ui/WorldMapView';
import OceanCanvas from './components/canvas/OceanCanvas';
import AnalyticReportModal from './components/ui/AnalyticReportModal';
import DepthPressureModal from './components/ui/DepthPressureModal';
import DashboardView from './components/ui/DashboardView';
import DataExplorerView from './components/ui/DataExplorerView';
import AboutView from './components/ui/AboutView';
import EnsoSimulationDock from './components/ui/EnsoSimulationDock';
import EnsoSimulationView from './components/ui/EnsoSimulationView';
import ColorbarSettingsModal from './components/ui/ColorbarSettingsModal';
import NetcdfIngestionModal from './components/ui/NetcdfIngestionModal';
import OceanCopilot from './components/ai/OceanCopilot';
import { REGIONS, createLocationData } from './data/oceanData';
import { getFormattedCurrentDate, getCurrentUtcTimeHour } from './utils/dateUtils';
import { getAccurateMeteorology } from './utils/weatherService';

export default function App() {
  const [activeTab, setActiveTab] = useState('3D View');
  const [selectedParam, setSelectedParam] = useState('sst');
  const [depth, setDepth] = useState(50);
  const [viewMode, setViewMode] = useState('depth_slice');
  const [timeHour, setTimeHour] = useState(() => getCurrentUtcTimeHour());
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [selectedBuoy, setSelectedBuoy] = useState(null);
  const [copilotExternalPrompt, setCopilotExternalPrompt] = useState(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Dynamic Colorbar, Palette, Layer Opacity & 3D Vertical Exaggeration State
  const [palette, setPalette] = useState('turbo');
  const [layerOpacity, setLayerOpacity] = useState(0.95);
  const [verticalExaggeration, setVerticalExaggeration] = useState(1.0);
  const [isLogScale, setIsLogScale] = useState(false);
  const [customRanges, setCustomRanges] = useState({});

  // Dynamic ENSO (El Niño / La Niña / Normal) Simulation State
  const [ensoState, setEnsoState] = useState({
    phase: 'elnino', // 'normal' | 'elnino' | 'lanina'
    intensity: 0.75, // 0.1 to 1.0
    isPlaying: true
  });

  // Dynamic Location & Meteorological Threat State (Initializes to actual current date)
  const [selectedDate, setSelectedDate] = useState(() => getFormattedCurrentDate());
  const [activeRegion, setActiveRegion] = useState(() => ({
    ...REGIONS.bay_of_bengal,
    date: getFormattedCurrentDate()
  }));
  const [isStormLayerActive, setIsStormLayerActive] = useState(false);

  // Modals
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [isStormNewsModalOpen, setIsStormNewsModalOpen] = useState(false);
  const [isAnalyticReportOpen, setIsAnalyticReportOpen] = useState(false);
  const [isDepthPressureOpen, setIsDepthPressureOpen] = useState(false);
  const [isColorbarSettingsOpen, setIsColorbarSettingsOpen] = useState(false);
  const [isNetcdfIngestionOpen, setIsNetcdfIngestionOpen] = useState(false);

  // Real-time animation timeline ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeHour((prev) => {
        const next = prev + 0.05 * simSpeed;
        return next >= 24 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Asynchronous Live Satellite & Marine Observation Synchronizer
  useEffect(() => {
    if (!activeRegion?.lat || !activeRegion?.lon) return;

    let isMounted = true;
    const targetLat = activeRegion.lat;
    const targetLon = activeRegion.lon;

    getAccurateMeteorology(targetLat, targetLon, new Date(), activeRegion.sst).then((liveMet) => {
      if (!isMounted || !liveMet) return;

      setActiveRegion((prev) => {
        if (!prev || Math.abs(prev.lat - targetLat) > 0.001 || Math.abs(prev.lon - targetLon) > 0.001) {
          return prev;
        }

        return {
          ...prev,
          isLive: liveMet.isLive,
          sst: liveMet.sst ?? prev.sst,
          currentSpeed: liveMet.currentSpeed ?? prev.currentSpeed,
          waveHeight: liveMet.waveHeight ?? prev.waveHeight,
          pressure: liveMet.pressure ?? prev.pressure,
          windSpeedKmH: liveMet.windSpeedKmH ?? prev.windSpeedKmH,
          rainProbability: liveMet.rainProbability,
          rainRate: liveMet.rainRate,
          stormProbability: liveMet.stormProbability,
          activeStorm: {
            ...prev.activeStorm,
            name: liveMet.isLive ? `${liveMet.weatherLabel} (${liveMet.stormCategory})` : prev.activeStorm?.name,
            category: liveMet.stormCategory,
            windSpeed: `${liveMet.windSpeedKmH} km/h`,
            pressure: `${liveMet.pressure} hPa`,
            rainfallForecast: `Precipitation chance: ${liveMet.rainProbability}% | Rain rate: ${liveMet.rainRate} mm/h (${liveMet.weatherLabel})`
          }
        };
      });
    });

    return () => {
      isMounted = false;
    };
  }, [activeRegion?.lat, activeRegion?.lon]);

  const formatCurrentTime = (h) => {
    const hh = String(Math.floor(h)).padStart(2, '0');
    const mm = String(Math.floor((h % 1) * 60)).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleCustomCoords = (arg1, arg2) => {
    if (typeof arg1 === 'object' && arg1 !== null) {
      setActiveRegion(arg1);
    } else {
      const lat = typeof arg1 === 'number' ? arg1 : parseFloat(arg1);
      const lon = typeof arg2 === 'number' ? arg2 : parseFloat(arg2);
      if (!isNaN(lat) && !isNaN(lon)) {
        const newRegion = createLocationData(lat, lon, null, selectedDate);
        setActiveRegion(newRegion);
      }
    }
  };

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    if (activeRegion) {
      const updated = createLocationData(activeRegion.lat, activeRegion.lon, activeRegion.name, dateStr);
      setActiveRegion(updated);
    }
  };

  const handleFocusPacific = () => {
    if (REGIONS.equatorial_pacific) {
      setActiveRegion(REGIONS.equatorial_pacific);
      setActiveTab('3D View');
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* 1. Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTime={formatCurrentTime(timeHour)}
        selectedDate={selectedDate}
        onOpenDatePicker={() => setIsDatePickerModalOpen(true)}
        activeRegion={activeRegion}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenStormNews={() => setIsStormNewsModalOpen(true)}
        onOpenAlerts={() => setIsAnomalyModalOpen(true)}
        onOpenAnalyticReport={() => setIsAnalyticReportOpen(true)}
        onOpenDepthPressure={() => setIsDepthPressureOpen(true)}
        onOpenNetcdfIngestion={() => setIsNetcdfIngestionOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* 2. Main Central Workstation or Tabbed Views */}
      {activeTab === 'Dashboard' ? (
        <DashboardView
          onSelectRegion={(reg) => {
            setActiveRegion(reg);
          }}
          activeRegion={activeRegion}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenAnalyticReport={() => setIsAnalyticReportOpen(true)}
          onOpenFleetModal={() => setIsFleetModalOpen(true)}
          onOpenStormNews={() => setIsStormNewsModalOpen(true)}
          onOpenAlerts={() => setIsAnomalyModalOpen(true)}
        />
      ) : activeTab === 'Map View' ? (
        <div className="relative flex-1 overflow-hidden">
          <WorldMapView
            activeRegion={activeRegion}
            onSelectRegion={(reg) => {
              setActiveRegion(reg);
              setActiveTab('3D View');
            }}
            onCustomCoords={(coordsObj) => {
              handleCustomCoords(coordsObj);
              setActiveTab('3D View');
            }}
            onBackTo3D={() => setActiveTab('3D View')}
          />
        </div>
      ) : activeTab === 'Data Explorer' ? (
        <DataExplorerView
          onSelectRegion={(reg) => {
            setActiveRegion(reg);
            setActiveTab('3D View');
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenNetcdfIngestion={() => setIsNetcdfIngestionOpen(true)}
        />
      ) : activeTab === 'About' ? (
        <AboutView
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenAnalyticReport={() => setIsAnalyticReportOpen(true)}
        />
      ) : activeTab === 'El Niño Simulation' ? (
        <EnsoSimulationView
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      ) : (
        <div className="relative flex-1 flex overflow-hidden">
          {/* Left Parameter, Location, Depth & Time Control Cockpit */}
          <LeftControlPanel
            selectedParam={selectedParam}
            setSelectedParam={setSelectedParam}
            depth={depth}
            setDepth={setDepth}
            timeHour={timeHour}
            setTimeHour={setTimeHour}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            simSpeed={simSpeed}
            setSimSpeed={setSimSpeed}
            activeRegion={activeRegion}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onCustomCoords={handleCustomCoords}
            selectedDate={selectedDate}
            onOpenDatePicker={() => setIsDatePickerModalOpen(true)}
            onOpenStormNews={() => setIsStormNewsModalOpen(true)}
            isStormLayerActive={isStormLayerActive}
            setIsStormLayerActive={setIsStormLayerActive}
            onOpenDepthPressure={() => setIsDepthPressureOpen(true)}
            onAskCopilot={(prompt) => setCopilotExternalPrompt(prompt)}
          />

          {/* Center 3D Ocean Digital Twin Viewport */}
          <main className="relative flex-1 h-full overflow-hidden bg-[#030712] rounded-3xl my-1 border border-sky-500/20 shadow-inner">
            <OceanCanvas
              selectedParam={selectedParam}
              depth={depth}
              viewMode={viewMode}
              activeRegion={activeRegion}
              isStormLayerActive={isStormLayerActive}
              onSelectBuoy={(buoy) => setSelectedBuoy(buoy)}
              selectedBuoy={selectedBuoy}
              isPlaying={isPlaying}
              simSpeed={simSpeed}
              ensoState={ensoState}
              palette={palette}
              layerOpacity={layerOpacity}
              verticalExaggeration={verticalExaggeration}
              isLogScale={isLogScale}
            />

            {/* Floating Viewport HUD Overlays */}
            <ViewportToolbar
              selectedParam={selectedParam}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onResetCamera={() => {}}
              onToggleGlobe={() => setActiveTab('Map View')}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              onOpenWorldMap={() => setActiveTab('Map View')}
              isStormLayerActive={isStormLayerActive}
              setIsStormLayerActive={setIsStormLayerActive}
              onOpenColorbarSettings={() => setIsColorbarSettingsOpen(true)}
              palette={palette}
              isLogScale={isLogScale}
              customRanges={customRanges}
              regionName={activeRegion?.name}
              regionCoords={activeRegion?.coords}
            />
          </main>

          {/* Right In-Situ & Model Validation, Storm & AI Anomaly Analytics */}
          <RightAnalyticsPanel
            onOpenAnomalyModal={() => setIsAnomalyModalOpen(true)}
            onOpenFleetModal={() => setIsFleetModalOpen(true)}
            activeRegion={activeRegion}
            onOpenStormNews={() => setIsStormNewsModalOpen(true)}
            onOpenAnalyticReport={() => setIsAnalyticReportOpen(true)}
            onOpenDepthPressure={() => setIsDepthPressureOpen(true)}
            depth={depth}
            ensoState={ensoState}
            onFocusPacific={() => setActiveTab('El Niño Simulation')}
            onAskCopilot={(prompt) => setCopilotExternalPrompt(prompt)}
          />
        </div>
      )}

      {/* 3. Bottom 6-Parameter Strip (rendered on 3D View and Map View matching reference screenshot) */}
      {(activeTab === '3D View' || activeTab === 'Map View') && (
        <BottomParameterStrip
          selectedParam={selectedParam}
          setSelectedParam={setSelectedParam}
          activeRegion={activeRegion}
          depth={depth}
          onNavigateToMap={() => setActiveTab('Map View')}
        />
      )}

      {/* 4. Interactive Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        activeRegion={activeRegion}
        onSelectRegion={(reg) => setActiveRegion(reg)}
        onCustomCoords={handleCustomCoords}
      />

      <DatePickerModal
        isOpen={isDatePickerModalOpen}
        onClose={() => setIsDatePickerModalOpen(false)}
        currentDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      <StormNewsModal
        isOpen={isStormNewsModalOpen}
        onClose={() => setIsStormNewsModalOpen(false)}
        activeRegion={activeRegion}
        isStormLayerActive={isStormLayerActive}
        setIsStormLayerActive={setIsStormLayerActive}
      />

      <BuoyDetailModal
        buoy={selectedBuoy}
        onClose={() => setSelectedBuoy(null)}
      />

      <AnomalyModal
        isOpen={isAnomalyModalOpen}
        onClose={() => setIsAnomalyModalOpen(false)}
      />

      <FleetModal
        isOpen={isFleetModalOpen}
        onClose={() => setIsFleetModalOpen(false)}
        onSelectBuoy={(buoy) => setSelectedBuoy(buoy)}
      />

      <AnalyticReportModal
        isOpen={isAnalyticReportOpen}
        onClose={() => setIsAnalyticReportOpen(false)}
        activeRegion={activeRegion}
        selectedDate={selectedDate}
        currentTime={formatCurrentTime(timeHour)}
      />

      <DepthPressureModal
        isOpen={isDepthPressureOpen}
        onClose={() => setIsDepthPressureOpen(false)}
        currentLat={activeRegion?.lat || 15.297}
        currentLon={activeRegion?.lon || 87.860}
        initialDepth={depth}
        onApplyDepth={(newDepth) => setDepth(newDepth)}
      />

      <ColorbarSettingsModal
        isOpen={isColorbarSettingsOpen}
        onClose={() => setIsColorbarSettingsOpen(false)}
        selectedParam={selectedParam}
        setSelectedParam={setSelectedParam}
        palette={palette}
        setPalette={setPalette}
        layerOpacity={layerOpacity}
        setLayerOpacity={setLayerOpacity}
        verticalExaggeration={verticalExaggeration}
        setVerticalExaggeration={setVerticalExaggeration}
        isLogScale={isLogScale}
        setIsLogScale={setIsLogScale}
        customRanges={customRanges}
        setCustomRanges={setCustomRanges}
      />

      <NetcdfIngestionModal
        isOpen={isNetcdfIngestionOpen}
        onClose={() => setIsNetcdfIngestionOpen(false)}
        onApplyIngestedDataset={(dataset) => {
          setActiveRegion((prev) => ({
            ...prev,
            name: `${prev.name.split(' (')[0]} (${dataset.format})`
          }));
        }}
      />

      {/* 5. AI Ocean Copilot Floating Intelligence Dock & Drawer */}
      <OceanCopilot
        activeRegion={activeRegion}
        selectedParam={selectedParam}
        setSelectedParam={setSelectedParam}
        depth={depth}
        setDepth={setDepth}
        viewMode={viewMode}
        setViewMode={setViewMode}
        timeHour={timeHour}
        selectedDate={selectedDate}
        isStormLayerActive={isStormLayerActive}
        setIsStormLayerActive={setIsStormLayerActive}
        ensoState={ensoState}
        setActiveRegion={setActiveRegion}
        setActiveTab={setActiveTab}
        onCustomCoords={handleCustomCoords}
        setIsAnomalyModalOpen={setIsAnomalyModalOpen}
        setIsFleetModalOpen={setIsFleetModalOpen}
        setIsLocationModalOpen={setIsLocationModalOpen}
        setIsDatePickerModalOpen={setIsDatePickerModalOpen}
        setIsStormNewsModalOpen={setIsStormNewsModalOpen}
        setIsAnalyticReportOpen={setIsAnalyticReportOpen}
        setIsDepthPressureOpen={setIsDepthPressureOpen}
        setIsColorbarSettingsOpen={setIsColorbarSettingsOpen}
        setIsNetcdfIngestionOpen={setIsNetcdfIngestionOpen}
        externalPrompt={copilotExternalPrompt}
        onClearExternalPrompt={() => setCopilotExternalPrompt(null)}
        isOpen={isCopilotOpen}
        setIsOpen={setIsCopilotOpen}
      />
    </div>
  );
}
