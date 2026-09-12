import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X } from 'lucide-react';

export default function MermaidMascot({
  onClick,
  isOpen,
  activeRegionName = 'Bay of Bengal',
  activeSst = '29.85'
}) {
  const { t } = useTranslation();
  const [showBubble, setShowBubble] = useState(true);
  const [isWaving, setIsWaving] = useState(false);

  // Periodic waving greeting animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end select-none pointer-events-auto">
      {/* 1. Speech Callout Bubble (Floating Above Mermaid) */}
      {showBubble && (
        <div className="relative mb-2 mr-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div 
            onClick={onClick}
            className="group max-w-[210px] p-2.5 rounded-2xl bg-gradient-to-br from-[#061838]/95 via-[#0a2754]/95 to-[#05132d]/95 border border-cyan-400/50 shadow-glow-cyan text-white cursor-pointer hover:border-cyan-300 hover:scale-105 transition-all backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                <span>🧜‍♀️ Nerida</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-mono">
                  {t('mascot.aiCopilot', 'AI Copilot')}
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title={t('mascot.dismissTip', 'Dismiss tip')}
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] leading-tight text-slate-200 font-medium">
              {t('mascot.explorePrompt', 'Click me to explore {{region}} or ask anything! 🌊', { region: activeRegionName })}
            </p>

            <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-cyan-400/90 pt-1 border-t border-cyan-500/20">
              <span>SST: {activeSst}°C</span>
              <span className="text-sky-300 underline font-bold group-hover:text-white">{t('mascot.askAi', 'Ask AI ↵')}</span>
            </div>
          </div>

          {/* Speech bubble tail pointer */}
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-[#0a2754] border-r border-b border-cyan-400/50 transform rotate-45"></div>
        </div>
      )}

      {/* 2. Floating Animated Mermaid Mascot Avatar Widget */}
      <div 
        onClick={onClick}
        className="relative group cursor-pointer"
        title={t('mascot.openCopilot', 'Open AI Ocean Copilot (Ctrl+K)')}
      >
        {/* Bioluminescent Ocean Ripple Glow Rings */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl group-hover:bg-cyan-400/35 animate-pulse transition-all"></div>
        <div className="absolute -inset-1 rounded-full border border-cyan-400/40 animate-ping opacity-30"></div>

        {/* Floating Bubble particles */}
        <span className="absolute -top-3 left-1 w-2 h-2 rounded-full bg-cyan-300/60 animate-bounce delay-100 pointer-events-none"></span>
        <span className="absolute -top-5 right-2 w-1.5 h-1.5 rounded-full bg-sky-200/70 animate-bounce delay-300 pointer-events-none"></span>

        {/* Mascot Frame */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 shadow-2xl border-2 border-cyan-300/80 group-hover:scale-110 group-hover:shadow-glow-cyan transition-all duration-300 flex items-center justify-center overflow-hidden">
          {/* Animated SVG Mermaid Character */}
          <svg 
            viewBox="0 0 100 100" 
            className={`w-full h-full transform transition-transform duration-500 ${isWaving ? 'rotate-6 scale-105' : 'group-hover:scale-105'}`}
          >
            <defs>
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
            </defs>

            {/* Aquatic Aura Background */}
            <circle cx="50" cy="50" r="48" fill="#04122e" />
            <circle cx="50" cy="50" r="44" fill="#071b3e" />

            {/* Flowing Mermaid Hair Back */}
            <path 
              d="M 28 35 C 15 50, 18 78, 36 82 C 30 70, 32 55, 36 45 Z" 
              fill="url(#hairGrad)" 
              opacity="0.9"
            />
            <path 
              d="M 72 35 C 85 50, 82 78, 64 82 C 70 70, 68 55, 64 45 Z" 
              fill="url(#hairGrad)" 
              opacity="0.9"
            />

            {/* Mermaid Tail with Iridescent Fins */}
            <g className="animate-pulse">
              {/* Lower Body & Tail */}
              <path 
                d="M 42 66 C 40 76, 52 82, 50 92 C 45 88, 38 88, 34 94 C 40 84, 46 80, 44 66 Z" 
                fill="url(#tailGrad)" 
              />
              {/* Tail Fin Left */}
              <path 
                d="M 50 92 C 42 93, 35 98, 32 99 C 38 94, 44 91, 50 92 Z" 
                fill="#22d3ee" 
              />
              {/* Tail Fin Right */}
              <path 
                d="M 50 92 C 58 93, 65 98, 68 99 C 62 94, 56 91, 50 92 Z" 
                fill="#38bdf8" 
              />
            </g>

            {/* Torso & Arms */}
            <ellipse cx="50" cy="58" rx="8" ry="10" fill="#fde68a" />
            
            {/* Sea Pearl Top */}
            <circle cx="46" cy="56" r="3.5" fill="#38bdf8" />
            <circle cx="54" cy="56" r="3.5" fill="#38bdf8" />

            {/* Head */}
            <circle cx="50" cy="38" r="14" fill="#fef08a" />

            {/* Expressive Anime Eyes */}
            <ellipse cx="45" cy="37" rx="2.5" ry="3.5" fill="#0f172a" />
            <ellipse cx="55" cy="37" rx="2.5" ry="3.5" fill="#0f172a" />
            <circle cx="44" cy="36" r="1" fill="#ffffff" />
            <circle cx="54" cy="36" r="1" fill="#ffffff" />

            {/* Friendly Smile */}
            <path d="M 47 43 Q 50 46 53 43" stroke="#f43f5e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            
            {/* Cute Cheeks */}
            <ellipse cx="42" cy="41" rx="2" ry="1" fill="#f43f5e" opacity="0.4" />
            <ellipse cx="58" cy="41" rx="2" ry="1" fill="#f43f5e" opacity="0.4" />

            {/* Flowing Front Hair & Bangs */}
            <path 
              d="M 36 32 C 42 22, 58 22, 64 32 C 60 28, 48 26, 36 32 Z" 
              fill="url(#hairGrad)" 
            />
            <path 
              d="M 36 32 C 38 40, 42 44, 43 45 C 42 38, 40 34, 36 32 Z" 
              fill="url(#hairGrad)" 
            />
            <path 
              d="M 64 32 C 62 40, 58 44, 57 45 C 58 38, 60 34, 64 32 Z" 
              fill="url(#hairGrad)" 
            />

            {/* Coral Crown / Sea Star Hair Accessory */}
            <polygon 
              points="50,22 52,26 56,26 53,29 54,33 50,30 46,33 47,29 44,26 48,26" 
              fill="#fb7185" 
              stroke="#ffe4e6" 
              strokeWidth="0.5" 
            />
            <circle cx="50" cy="27" r="1" fill="#ffffff" />

            {/* Waving Hand with Sparkling Wand / Trident */}
            <g transform={isWaving ? "translate(0, -3)" : ""}>
              <path d="M 58 58 Q 66 52 68 46" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="68" cy="45" r="2.5" fill="#fef08a" />
              {/* Magic Sparkle */}
              <polygon points="68,39 69,42 72,42 70,44 71,47 68,45 65,47 66,44 64,42 67,42" fill="#00f0ff" />
            </g>
          </svg>

          {/* Online Indicator Green Dot */}
          <span className="absolute bottom-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#060f26]"></span>
          </span>
        </div>

        {/* Mascot Name Badge under Avatar */}
        <div className="mt-1 flex items-center justify-center">
          <span className="px-2 py-0.5 rounded-full bg-[#03091e]/90 text-[10px] font-bold text-cyan-300 border border-cyan-400/40 shadow-glow-cyan flex items-center gap-1 group-hover:border-cyan-300">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>AI Copilot</span>
          </span>
        </div>
      </div>
    </div>
  );
}
