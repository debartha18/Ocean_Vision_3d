import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Brain, ShieldAlert, Sparkles } from 'lucide-react';
import { AI_ANOMALY } from '../../data/oceanData';

export default function AnomalyModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="glass-panel glow-border-red rounded-3xl p-6 border border-red-500/60 shadow-glow-red max-w-xl w-full relative animate-in fade-in zoom-in duration-200 bg-gradient-to-b from-[#180814] to-[#08122b]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-300 hover:text-white hover:bg-red-500/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/40 shadow-glow-red flex items-center justify-center text-red-400 animate-pulse">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-red-400 tracking-wide">
              {t('anomalyModal.title', 'AI Diagnostics: Subsurface Thermal Anomaly')}
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Anomaly ID: #BOC-2026-08A • {t('anomalyModal.confidence', 'Confidence')} {AI_ANOMALY.confidence}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-[#1b0a1a] p-3 rounded-2xl border border-red-500/30 text-center">
            <div className="text-[10px] text-slate-400 uppercase">{t('anomalyModal.deviation', 'Deviation')}</div>
            <div className="text-base font-mono font-bold text-red-400">+2.45 °C</div>
            <div className="text-[9px] text-red-300/70 mt-0.5">{t('anomalyModal.vsBaseline', 'vs HYCOM baseline')}</div>
          </div>
          <div className="bg-[#1b0a1a] p-3 rounded-2xl border border-red-500/30 text-center">
            <div className="text-[10px] text-slate-400 uppercase">{t('anomalyModal.depthLayer', 'Depth Layer')}</div>
            <div className="text-base font-mono font-bold text-amber-300">50m – 110m</div>
            <div className="text-[9px] text-amber-300/70 mt-0.5">{t('anomalyModal.thermoclineCore', 'Thermocline Core')}</div>
          </div>
          <div className="bg-[#1b0a1a] p-3 rounded-2xl border border-red-500/30 text-center">
            <div className="text-[10px] text-slate-400 uppercase">{t('anomalyModal.cycloneGenesis', 'Cyclone Genesis')}</div>
            <div className="text-base font-mono font-bold text-orange-400">{t('anomalyModal.highRisk', 'High Risk')}</div>
            <div className="text-[9px] text-orange-300/70 mt-0.5">TCHP &gt; 110 kJ/cm²</div>
          </div>
        </div>

        <div className="bg-[#0b1633] p-4 rounded-2xl border border-sky-500/20 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{t('anomalyModal.aiAnalysis', 'Ocean Digital Twin AI Root Cause Analysis')}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {AI_ANOMALY.details}
          </p>
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{t('anomalyModal.validatedBy', 'Validated by RAMA Moored Buoy BD08 and INCOIS Argo Float #2902184')}</span>
          </div>
          <span className="font-bold font-mono">{t('anomalyModal.qcPassed', 'QC: PASSED')}</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-slate-300 transition-colors"
          >
            {t('anomalyModal.dismiss', 'Dismiss')}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-xs font-bold text-white shadow-glow-red transition-all"
          >
            {t('anomalyModal.generateReport', 'Generate Ocean Alert Report')}
          </button>
        </div>
      </div>
    </div>
  );
}
