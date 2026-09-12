import React from 'react';
import { Bot, X, Minimize2, Maximize2, Trash2 } from 'lucide-react';

export default function CopilotHeader({
  isExpanded,
  onToggleExpand,
  onClose,
  onClearHistory,
  engineSource = 'offline',
  activeBasinName = 'Bay of Bengal'
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-sky-500/20 bg-[#061226]/80 select-none">
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 text-white shadow-glow-cyan border border-cyan-300/60 p-0.5">
          <span className="text-lg">🧜‍♀️</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-[#061226]"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1">
              <span>Nerida</span>
              <span className="text-[10px] text-cyan-300 font-normal">• AI Ocean Copilot</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 truncate max-w-[110px]">
              {activeBasinName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{engineSource === 'cloud' ? 'Cloud Gemini Live' : 'Domain Engine Active'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400 font-mono">TEOS-10</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-slate-400">
        <button
          onClick={onClearHistory}
          title="Clear Conversation"
          className="p-1.5 rounded-lg hover:bg-sky-500/20 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse View" : "Expand View"}
          className="p-1.5 rounded-lg hover:bg-sky-500/20 hover:text-slate-200 transition-colors cursor-pointer"
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
