import React from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, ShieldAlert, Layers, Scale, Activity, Fish, Sparkles } from 'lucide-react';
import { getLocalizedQuickActions, getCopilotLexicon } from '../../lib/ai/copilotTranslations.js';

export default function CopilotQuickActions({ onSelectPrompt, disabled = false }) {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language || 'en';
  const L = getCopilotLexicon(currentLang);
  const localizedActions = getLocalizedQuickActions(currentLang);

  const iconMap = {
    conditions: Compass,
    storm_risk: ShieldAlert,
    profile: Layers,
    compare: Scale,
    vectors: Activity,
    marineLife: Fish
  };

  return (
    <div className="px-3 py-2 flex flex-col gap-1.5 select-none">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7FA1AA] px-1">
        <Sparkles className="w-3 h-3 text-[#00E5FF]" />
        <span>{L.ui?.quickQueries || 'Quick Oceanographic Queries'}</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {localizedActions.map((act) => {
          const Icon = iconMap[act.id] || Compass;
          return (
            <button
              key={act.id}
              disabled={disabled}
              onClick={() => onSelectPrompt(act.prompt)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#091A26] hover:bg-[#0E283A] border border-[#00E5FF]/20 hover:border-[#00E5FF]/50 text-[#8FA8B2] hover:text-[#D4DEE2] text-[10px] font-medium transition-all hover:shadow-[0_0_10px_rgba(0,229,255,0.18)] whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50 active:scale-95"
            >
              <Icon className="w-3 h-3 text-[#00E5FF] shrink-0" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
