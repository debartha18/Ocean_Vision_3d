import React from 'react';
import { Compass, ShieldAlert, Brain, Scale, Globe, FileText, Sparkles } from 'lucide-react';

export default function CopilotQuickActions({ onSelectPrompt, disabled = false }) {
  const actions = [
    {
      id: 'conditions',
      icon: Compass,
      label: 'Explain Current Conditions',
      prompt: 'Explain current oceanographic and meteorological conditions for this basin in detail.'
    },
    {
      id: 'storm_risk',
      icon: ShieldAlert,
      label: 'Assess Storm & Swell Risk',
      prompt: 'Assess maritime storm threat, wave surge, and vessel navigation safety.'
    },
    {
      id: 'anomaly',
      icon: Brain,
      label: 'Analyze Subsurface Anomaly',
      prompt: 'Analyze subsurface thermal stratification, MLD, and oxygen minimum zones.'
    },
    {
      id: 'compare',
      icon: Scale,
      label: 'Compare BoB vs Arabian Sea',
      prompt: 'Compare Bay of Bengal versus Arabian Sea in salinity, stratification, and cyclogenesis.'
    },
    {
      id: 'enso',
      icon: Globe,
      label: 'ENSO Teleconnections',
      prompt: 'Explain the active ENSO phase and its teleconnection impacts on regional monsoons.'
    },
    {
      id: 'brief',
      icon: FileText,
      label: 'Generate Ocean Brief',
      prompt: 'Generate an executive oceanographic briefing and launch the technical dossier.'
    }
  ];

  return (
    <div className="px-3 py-2 flex flex-col gap-1.5 select-none">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#637C87] px-1">
        <Sparkles className="w-3 h-3 text-[#0C969C]" />
        <span>Quick Oceanographic Queries</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              disabled={disabled}
              onClick={() => onSelectPrompt(act.prompt)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0D202B] hover:bg-[#142D3A] border border-[#193544] hover:border-[#214555] text-[#8FA8B2] hover:text-[#CCD0CF] text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-[#0C969C] shrink-0" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
