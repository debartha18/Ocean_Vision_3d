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
    <div className="mx-3 mt-2 rounded-xl border border-sky-500/20 bg-[#07132a]/90 overflow-hidden select-none transition-all">
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between px-3 py-2 bg-sky-500/10 cursor-pointer hover:bg-sky-500/15 transition-colors"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Digital Twin Telemetry</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-sky-400">
          <span>{isCollapsed ? 'Show telemetry' : 'Hide'}</span>
          {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-sky-500/15">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Basin: </span>
              <span className="font-bold text-white">{basin}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Thermometer className="w-3 h-3 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">SST: </span>
              <span className="font-bold text-amber-300">{sst}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Waves className="w-3 h-3 text-sky-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Depth / Wave: </span>
              <span className="font-bold text-sky-300">{depth}m / {wave}m</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3 h-3 text-rose-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Threat: </span>
              <span className="font-bold text-rose-300 truncate">{storm}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
