import React, { useState } from 'react';
import { Compass, Thermometer, Waves, Zap, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export default function CopilotContextCard({ oceanContext }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const basin = oceanContext?.activeBasin?.name || 'Bay of Bengal';
  const coords = oceanContext?.activeBasin?.coordinates || '15.297° N, 87.860° E';
  const depth = oceanContext?.activeLayer?.depthMeters ?? 50;
  const param = oceanContext?.activeLayer?.name || 'Sea Surface Temperature';
  const sst = oceanContext?.oceanographicProfile?.surfaceSST || '29.85 °C';
  const wave = oceanContext?.meteorologyAndHazards?.waveHeightMeters ?? 1.65;
  const storm = oceanContext?.meteorologyAndHazards?.stormCategory || 'Normal Flow';

  return (
    <div className="mx-3 mt-2 rounded-xl border border-[#00E5FF]/20 bg-[#07131B] overflow-hidden select-none transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between px-3 py-2 bg-[#051118] cursor-pointer hover:bg-[#091A26] transition-colors"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Active Digital Twin Telemetry</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#8FA8B2]">
          <span>{isCollapsed ? 'Show telemetry' : 'Hide'}</span>
          {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-[#00E5FF]/15">
          <div className="flex items-center gap-1.5 text-[#D4DEE2]">
            <Compass className="w-3 h-3 text-[#00E5FF] shrink-0" />
            <div className="truncate">
              <span className="text-[#637C87]">Basin: </span>
              <span className="font-bold text-[#D4DEE2]">{basin}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#D4DEE2]">
            <Thermometer className="w-3 h-3 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[#637C87]">SST: </span>
              <span className="font-bold text-amber-400">{sst}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#D4DEE2]">
            <Waves className="w-3 h-3 text-[#38BDF8] shrink-0" />
            <div className="truncate">
              <span className="text-[#637C87]">Depth / Wave: </span>
              <span className="font-bold text-[#38BDF8]">{depth}m / {wave}m</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#D4DEE2]">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[#637C87]">Threat: </span>
              <span className="font-bold text-amber-300 truncate">{storm}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
