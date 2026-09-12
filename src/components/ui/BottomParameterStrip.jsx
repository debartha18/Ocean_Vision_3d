import React from 'react';
import { useTranslation } from 'react-i18next';
import { PARAMETERS, calculateParameterAtDepth } from '../../data/oceanData';

export default function BottomParameterStrip({ 
  selectedParam, 
  setSelectedParam, 
  activeRegion,
  depth = 50,
  onNavigateToMap 
}) {
  const { t } = useTranslation();

  const parameterConfigs = [
    {
      id: 'sst',
      title: `${t('parameters.sst', 'Sea Surface Temperature')} (°C)`,
      min: '0',
      max: '32',
      gradient: 'linear-gradient(to right, #001f3f, #0074D9, #00d2be, #2ECC40, #FFDC00, #FF851B, #FF4136)'
    },
    {
      id: 'salinity',
      title: `${t('parameters.salinity', 'Salinity')} (PSU)`,
      min: '30',
      max: '40',
      gradient: 'linear-gradient(to right, #051e3e, #0f4c81, #1b98e0, #56cbf9, #00ffc8)'
    },
    {
      id: 'currents',
      title: `${t('parameters.currents', 'Ocean Currents')} (m/s)`,
      min: '0',
      max: '2.0',
      isArrows: true
    },
    {
      id: 'wave',
      title: `${t('parameters.wave', 'Wave Height')} (m)`,
      min: '0',
      max: '6',
      gradient: 'linear-gradient(to right, #1e1b4b, #4338ca, #8b5cf6, #ec4899, #f43f5e)'
    },
    {
      id: 'chlorophyll',
      title: `${t('parameters.chlorophyll', 'Chlorophyll-a')} (mg/m³)`,
      min: '0.01',
      max: '10',
      gradient: 'linear-gradient(to right, #022c22, #065f46, #059669, #10b981, #a3e635, #fef08a)'
    },
    {
      id: 'oxygen',
      title: `${t('parameters.oxygen', 'Dissolved Oxygen')} (mg/L)`,
      min: '0',
      max: '10',
      gradient: 'linear-gradient(to right, #4a044e, #701a75, #0284c7, #06b6d4, #67e8f9)'
    }
  ];

  return (
    <footer className="h-16 px-3.5 py-1.5 flex items-center justify-between gap-2 z-30 select-none bg-[#0A1720]/95 border-t border-[#193544] backdrop-blur-md">
      {/* 1. 6-Parameter Quick Preview Cards */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto py-0.5 custom-scrollbar">
        {parameterConfigs.map((param) => {
          const isSelected = selectedParam === param.id;

          return (
            <button
              key={param.id}
              onClick={() => setSelectedParam(param.id)}
              className={`relative flex-1 min-w-[130px] max-w-[190px] h-[52px] rounded-lg px-2.5 py-1.5 text-left transition-colors overflow-hidden flex flex-col justify-between cursor-pointer border ${
                isSelected
                  ? 'bg-[#0C969C]/12 border-[#0C969C]/60 text-[#CCD0CF]'
                  : 'bg-[#0D202B] hover:bg-[#142D3A] border-[#193544] text-[#8FA8B2]'
              }`}
            >
              {/* Header Title & Live Value */}
              <div className="relative z-10 flex items-center justify-between gap-1">
                <span className={`text-[9.5px] font-medium truncate leading-tight ${isSelected ? 'text-[#CCD0CF]' : 'text-[#8FA8B2]'}`}>
                  {param.title}
                </span>
                <span className="text-[9.5px] font-mono font-bold text-[#CCD0CF] bg-[#142D3A] px-1 py-0.2 rounded border border-[#214555] shrink-0">
                  {calculateParameterAtDepth(param.id, depth, activeRegion)}
                </span>
              </div>

              {/* Visualization / Gradient Bar */}
              <div className="relative z-10 w-full my-0.5">
                {param.isArrows ? (
                  <div className="flex items-center justify-center gap-1.5 text-[#0C969C] text-[11px] font-mono tracking-wider">
                    <span>—→</span>
                    <span>-››</span>
                    <span>-›››</span>
                    <span className="text-[#6BA3BE]">»»»</span>
                  </div>
                ) : (
                  <div
                    className="h-1.5 w-full rounded border border-[#193544]"
                    style={{ background: param.gradient }}
                  />
                )}
              </div>

              {/* Min - Max Scale Labels */}
              <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-[#637C87]">
                <span>{param.min}</span>
                <span>{param.max}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Interactive Global Mini-Map */}
      <div 
        onClick={onNavigateToMap}
        title="Click to switch to World Satellite Map"
        className="relative w-36 h-[52px] rounded-lg border border-[#193544] hover:border-[#214555] overflow-hidden flex flex-col items-center justify-between p-1 bg-[#0D202B] cursor-pointer transition-colors group shrink-0"
      >
        <div className="w-full flex items-center justify-between text-[8px] font-mono text-[#8FA8B2] px-1">
          <span className="font-semibold text-[#CCD0CF]">Mini Map</span>
          <span className="text-[#0C969C]">Global</span>
        </div>

        {/* Satellite Map thumbnail */}
        <div className="relative w-full flex-1 rounded overflow-hidden border border-[#193544] bg-[#06141B]">
          <img 
            src="/world_map_satellite.jpg" 
            alt="Mini Map" 
            className="w-full h-full object-cover opacity-70 pointer-events-none group-hover:scale-105 transition-transform duration-200"
          />
          {/* Active Viewport Bounding Box */}
          <div className="absolute left-[24%] top-[18%] w-[52%] h-[64%] border border-[#0C969C] border-dashed rounded bg-[#0C969C]/15 pointer-events-none" />
        </div>
      </div>
    </footer>
  );
}
