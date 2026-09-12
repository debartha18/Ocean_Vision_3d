import React from 'react';
import { X, Minimize2, Maximize2, Trash2 } from 'lucide-react';

export default function CopilotHeader({
  isExpanded,
  onToggleExpand,
  onClose,
  onClearHistory,
  engineSource = 'offline',
  activeBasinName = 'Bay of Bengal'
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#193544] bg-[#0D202B]/95 select-none">
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#0A1720] text-white border border-[#193544] p-0.5">
          <span className="text-lg">🧜‍♀️</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0C969C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0C969C] border border-[#0D202B]"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CCD0CF] tracking-wide flex items-center gap-1">
              <span>Nerida</span>
              <span className="text-[10px] text-[#0C969C] font-normal">• AI Ocean Copilot</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#142D3A] text-[#0C969C] border border-[#214555] truncate max-w-[110px]">
              {activeBasinName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#8FA8B2]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{engineSource === 'cloud' ? 'Cloud Gemini Live' : 'Domain Engine Active'}</span>
            <span className="text-[#214555]">•</span>
            <span className="text-[#6BA3BE] font-mono">TEOS-10</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[#8FA8B2]">
        <button
          onClick={onClearHistory}
          title="Clear Conversation"
          className="p-1.5 rounded-lg hover:bg-[#142D3A] hover:text-[#CCD0CF] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse View" : "Expand View"}
          className="p-1.5 rounded-lg hover:bg-[#142D3A] hover:text-[#CCD0CF] transition-colors cursor-pointer"
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onClose}
          title="Close Copilot"
          className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
