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
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#00E5FF]/15 bg-[#07131B]/95 select-none">
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 via-[#1687FF]/25 to-[#8B5CF6]/20 text-white border border-[#00E5FF]/45 shadow-[0_0_12px_rgba(0,229,255,0.25)] p-0.5 transition-all">
          <span className="text-lg drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]">🧜‍♀️</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5FF] border border-[#07131B] shadow-[0_0_6px_#00E5FF]"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-[#00E5FF] via-[#38BDF8] to-[#8B5CF6] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,229,255,0.35)]">
                Nerida
              </span>
              <span className="text-[10px] text-[#7FA1AA] font-normal">• AI Ocean Copilot</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#091E2C] text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_8px_rgba(0,229,255,0.1)] truncate max-w-[110px]">
              {activeBasinName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#8FA8B2]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
            <span className="text-[#A4C2CB]">{engineSource === 'cloud' ? 'Cloud Gemini Live' : 'Domain Engine Active'}</span>
            <span className="text-[#193544]">•</span>
            <span className="text-[#00E5FF]/90 font-mono">TEOS-10</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[#8FA8B2]">
        <button
          onClick={onClearHistory}
          title="Clear Conversation"
          className="p-1.5 rounded-lg hover:bg-[#0E2638] hover:text-[#00E5FF] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse View" : "Expand View"}
          className="p-1.5 rounded-lg hover:bg-[#0E2638] hover:text-[#00E5FF] transition-colors cursor-pointer"
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
