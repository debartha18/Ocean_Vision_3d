import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronRight, 
  Brain, 
  ChevronDown,
  Zap,
  Newspaper,
  FileText,
  Printer,
  Gauge,
  Thermometer,
  Wind,
  Globe,
  CloudRain,
  Radio,
  Bot,
  Sparkles
} from 'lucide-react';
import { 
  IN_SITU_SUMMARY, 
  VALIDATION_TIME_SERIES, 
  getDynamicValidationTimeSeries,
  VALIDATION_METRICS, 
  AI_ANOMALY,
  ENSO_METRICS
} from '../../data/oceanData';
import { calculateHydrostaticPressure } from '../../utils/pressureCalculator';
import { getRainRateCategory } from '../../utils/weatherService';

export default function RightAnalyticsPanel({ 
  onOpenAnomalyModal, 
  onOpenFleetModal, 
  activeRegion, 
  onOpenStormNews,
  onOpenAnalyticReport,
  onOpenDepthPressure,
  depth = 50,
  ensoState = { phase: 'elnino', intensity: 0.75 },
  onFocusPacific,
  onAskCopilot
}) {
  const { t } = useTranslation();
  const chartW = 240;
  const chartH = 85;
  const validationData = React.useMemo(() => {
    return getDynamicValidationTimeSeries(new Date(), activeRegion?.sst ?? 29.5);
  }, [activeRegion?.sst]);

  const temps = validationData.flatMap(d => [d.model, d.observed]);
  const minTemp = Math.min(...temps) - 0.8;
  const maxTemp = Math.max(...temps) + 0.8;

  const pointsModel = validationData.map((pt, i) => {
    const x = (i / (validationData.length - 1)) * (chartW - 20) + 10;
    const y = chartH - ((pt.model - minTemp) / (maxTemp - minTemp)) * (chartH - 20) - 10;
    return { x, y, ...pt };
  });

  const pointsObs = validationData.map((pt, i) => {
    const x = (i / (validationData.length - 1)) * (chartW - 20) + 10;
    const y = chartH - ((pt.observed - minTemp) / (maxTemp - minTemp)) * (chartH - 20) - 10;
    return { x, y, ...pt };
  });

  const pathModel = pointsModel.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const pathObs = pointsObs.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  const stormProb = activeRegion?.stormProbability ?? 35;
  const rainProb = activeRegion?.rainProbability ?? 40;
  const rainRate = parseFloat(activeRegion?.rainRate ?? 2.5);
  const waveHeight = activeRegion?.waveHeight ?? 1.65;
  const isLive = activeRegion?.isLive ?? false;
  const rainCat = getRainRateCategory(rainRate);

  return (
    <aside className="w-80 h-full flex flex-col gap-2.5 p-2.5 select-none overflow-y-auto z-20 custom-scrollbar text-[#CCD0CF]">
      {/* 0. Position-Specific Storm & Rain Intelligence Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            <Zap className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span>{t('controls.meteorologicalThreatLayer', 'Storm Threat')}</span>
          </div>
          <div className="flex items-center gap-1">
            {isLive && (
              <span className="text-[9px] font-mono text-[#0C969C] bg-[#142D3A] border border-[#214555] px-1.5 py-0.5 rounded flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-[#0C969C]" />
                Live Sync
              </span>
            )}
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#142D3A] text-[#CCD0CF] border border-[#214555] truncate max-w-[120px]">
              {activeRegion?.activeStorm?.category || 'Fair / Stable'}
            </span>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <div className="truncate mr-2">
            <div className="text-xs font-semibold text-[#CCD0CF] truncate">{activeRegion?.name || 'Ocean Basin'}</div>
            <div className="text-[10px] font-mono text-[#637C87]">{activeRegion?.coords || '15.297° N, 87.860° E'}</div>
          </div>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#142D3A] text-[#6BA3BE] border border-[#214555] shrink-0">
            {rainCat.text}
          </span>
        </div>

        {/* 4 Metric Gauges for this coordinate */}
        <div className="grid grid-cols-2 gap-1.5 mb-2 text-center font-mono">
          {/* 1. Rain Probability (%) */}
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[9px] text-[#637C87] uppercase flex items-center justify-center gap-1">
              <CloudRain className="w-3 h-3 text-[#6BA3BE]" />
              <span>{t('stormModal.rainChance', 'Rain Chance')}</span>
            </div>
            <div className="text-xs font-semibold text-[#CCD0CF] mt-0.5">
              {rainProb}%
            </div>
            <div className="text-[8px] text-[#637C87] mt-0.5">
              {rainProb >= 70 ? t('analytics.highChance', 'High Chance') : rainProb >= 35 ? t('analytics.scattered', 'Scattered') : t('analytics.unlikely', 'Unlikely')}
            </div>
          </div>

          {/* 2. Instantaneous Rain Rate (mm/h) */}
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[9px] text-[#637C87] uppercase">{t('stormModal.rainRate', 'Rain Rate')}</div>
            <div className="text-xs font-semibold text-[#CCD0CF] mt-0.5">
              {rainRate.toFixed(1)} <span className="text-[8px] text-[#637C87]">mm/h</span>
            </div>
            <div className="text-[8px] text-[#6BA3BE] mt-0.5 font-sans">
              {rainCat.text}
            </div>
          </div>

          {/* 3. Storm / Cyclone Genesis Risk (%) */}
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[9px] text-[#637C87] uppercase">{t('stormModal.stormRisk', 'Storm Risk')}</div>
            <div className="text-xs font-semibold text-[#D6A84F] mt-0.5">
              {stormProb}%
            </div>
            <div className="text-[8px] text-[#637C87] mt-0.5">
              {stormProb >= 70 ? t('analytics.severeAlert', 'Severe Alert') : stormProb >= 40 ? t('analytics.squallWatch', 'Squall Watch') : t('analytics.lowPotential', 'Low Potential')}
            </div>
          </div>

          {/* 4. Significant Wave Swell (m) */}
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[9px] text-[#637C87] uppercase">{t('stormModal.breakerSwell', 'Wave Swell')}</div>
            <div className="text-xs font-semibold text-[#6BA3BE] mt-0.5">
              {waveHeight} <span className="text-[8px] text-[#637C87]">m</span>
            </div>
            <div className="text-[8px] text-[#637C87] mt-0.5">
              {waveHeight >= 3.0 ? t('analytics.roughSea', 'Rough Sea') : waveHeight >= 1.8 ? t('analytics.moderateSea', 'Moderate Sea') : t('analytics.calmSwell', 'Calm Swell')}
            </div>
          </div>
        </div>

        {/* Dynamic Forecast Bulletin Bar */}
        <div className="bg-[#0A1720] rounded-lg p-2 border border-[#193544] mb-2 text-[10px] text-[#8FA8B2] leading-snug">
          <div className="text-[#637C87] font-mono text-[9px] uppercase tracking-wider mb-0.5">{t('stormModal.weatherOverview', 'Weather Overview:')}</div>
          <div className="truncate text-[#CCD0CF] font-medium">
            {activeRegion?.activeStorm?.rainfallForecast || `${t('stormModal.rainChance', 'Rain probability')}: ${rainProb}% | ${rainCat.text}`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenStormNews}
            className="py-1.5 px-2 rounded-lg bg-[#142D3A] hover:bg-[#183746] text-[11px] font-medium text-[#CCD0CF] border border-[#214555] hover:border-[#0C969C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer truncate"
          >
            <Newspaper className="w-3 h-3 text-[#D6A84F] shrink-0" />
            <span className="truncate">{t('analytics.stormNews', 'Storm News')}</span>
          </button>

          {onAskCopilot && (
            <button
              onClick={() => onAskCopilot(`Assess storm threat, maritime squall intensity, and wave safety for ${activeRegion?.name || 'this basin'}`)}
              className="py-1.5 px-2 rounded-lg bg-[#142D3A] hover:bg-[#183746] text-[11px] font-medium text-[#CCD0CF] border border-[#214555] hover:border-[#0C969C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer truncate"
              title="Ask AI Copilot to assess maritime storm threat"
            >
              <Bot className="w-3 h-3 text-[#0C969C] shrink-0" />
              <span className="truncate">Ask Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* 0.5. Official Analytical Report Action Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            <FileText className="w-3.5 h-3.5 text-[#0C969C]" />
            <span>{t('navbar.analytics', 'Analytical Report')}</span>
          </div>
          <span className="text-[10px] font-mono text-[#6BA3BE] bg-[#142D3A] px-2 py-0.5 rounded border border-[#214555]">
            PDF Dossier
          </span>
        </div>

        <p className="text-[11px] text-[#8FA8B2] mb-2 leading-tight">
          {t('analytics.dossierDesc', 'Formal oceanographic telemetry dossier with depth pressure matrix & validation curves.')}
        </p>

        <button
          onClick={onOpenAnalyticReport}
          className="w-full py-1.5 px-3 rounded-lg bg-[#142D3A] hover:bg-[#183746] border border-[#214555] hover:border-[#0C969C] text-xs font-medium text-[#CCD0CF] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Printer className="w-3.5 h-3.5 text-[#0C969C]" />
            <span>{t('common.printReport', 'Print Analytic Report')}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#637C87]" />
        </button>
      </div>

      {/* 0.6. Subsurface Hydrostatic Pressure Card */}
      {(() => {
        const pressure = calculateHydrostaticPressure(depth, activeRegion?.lat || 15.0, activeRegion?.sst || 28.0);
        return (
          <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
                <Gauge className="w-3.5 h-3.5 text-[#0C969C]" />
                <span>{t('analytics.depthPressure', 'Depth Pressure')} ({depth}m)</span>
              </div>
              <button
                onClick={onOpenDepthPressure}
                className="text-[10px] text-[#6BA3BE] hover:underline font-mono cursor-pointer"
              >
                {t('analytics.calculator', 'Calculator')} ↗
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center font-mono">
              <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
                <div className="text-[8px] text-[#637C87]">Dbar</div>
                <div className="text-xs font-semibold text-[#CCD0CF]">{pressure.dbar}</div>
              </div>
              <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
                <div className="text-[8px] text-[#637C87]">Atm</div>
                <div className="text-xs font-semibold text-[#CCD0CF]">{pressure.atm}</div>
              </div>
              <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
                <div className="text-[8px] text-[#637C87]">MPa</div>
                <div className="text-xs font-semibold text-[#6BA3BE]">{pressure.mpa}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 1. In-Situ Observations Summary Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            {t('analytics.inSituTelemetry', 'In-situ Observations')}
          </span>
          <span className="text-[10px] font-mono text-[#0C969C] bg-[#142D3A] px-1.5 py-0.5 rounded border border-[#214555] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0C969C]" />
            49 Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {Object.entries(IN_SITU_SUMMARY).map(([key, item]) => (
            <div
              key={key}
              className="bg-[#0A1720] border border-[#193544] p-2 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.bg}`} />
                <span className="text-[11px] text-[#8FA8B2]">{item.label}</span>
              </div>
              <span className="text-xs font-semibold font-mono text-[#CCD0CF]">{item.count}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenFleetModal}
          className="w-full py-1.5 px-2.5 rounded-lg bg-[#142D3A] hover:bg-[#183746] text-xs font-medium text-[#CCD0CF] flex items-center justify-between transition-colors border border-[#214555] hover:border-[#0C969C] cursor-pointer"
        >
          <span>{t('analytics.inspectFleet', 'View Fleet Telemetry')}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#637C87]" />
        </button>
      </div>

      {/* 2. Model vs Observations Validation Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8FA8B2]">
            {t('analytics.modelVsObserved', 'Model vs Observations')}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-[#6BA3BE] bg-[#142D3A] px-2 py-0.5 rounded border border-[#214555]">
            <span>SST</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-3 text-[10px] text-[#8FA8B2] mb-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#6BA3BE]" />
            <span>Model</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[#D6A84F]" />
            <span>Observed</span>
          </div>
        </div>

        {/* Validation Curve Chart */}
        <div className="bg-[#0A1720] p-2 rounded-lg border border-[#193544] mb-2">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-20 overflow-visible">
            <line x1="0" y1="20" x2={chartW} y2="20" stroke="#193544" strokeDasharray="2 2" />
            <line x1="0" y1="50" x2={chartW} y2="50" stroke="#193544" strokeDasharray="2 2" />
            <line x1="0" y1="75" x2={chartW} y2="75" stroke="#193544" strokeDasharray="2 2" />

            <path d={pathModel} fill="none" stroke="#6BA3BE" strokeWidth="1.5" strokeDasharray="3 2" />
            {pointsModel.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#142D3A" stroke="#6BA3BE" strokeWidth="1.5" />
            ))}

            <path d={pathObs} fill="none" stroke="#D6A84F" strokeWidth="1.5" />
            {pointsObs.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#0D202B" stroke="#D6A84F" strokeWidth="1.5" />
            ))}
          </svg>

          <div className="flex justify-between text-[8px] font-mono text-[#637C87] px-1 mt-0.5">
            {validationData.map((pt) => (
              <span key={pt.time}>{pt.time}</span>
            ))}
          </div>
        </div>

        {/* Statistical Metrics */}
        <div className="grid grid-cols-3 gap-1 text-center mb-2 font-mono">
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[8px] text-[#637C87] uppercase">RMSE</div>
            <div className="text-xs font-semibold text-[#CCD0CF]">{VALIDATION_METRICS.rmse}</div>
          </div>
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[8px] text-[#637C87] uppercase">Bias</div>
            <div className="text-xs font-semibold text-[#D6A84F]">{VALIDATION_METRICS.bias}</div>
          </div>
          <div className="bg-[#0A1720] p-1.5 rounded-lg border border-[#193544]">
            <div className="text-[8px] text-[#637C87] uppercase">Correlation</div>
            <div className="text-xs font-semibold text-[#0C969C]">{VALIDATION_METRICS.correlation}</div>
          </div>
        </div>

        <button 
          onClick={onOpenFleetModal}
          className="w-full text-center text-[10px] text-[#6BA3BE] hover:underline flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>{t('analytics.viewDetailedComparison', 'View Detailed Comparison')}</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. AI Anomaly Detection Card */}
      <div className="bg-[#0D202B] rounded-xl p-3 border border-[#193544] shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-[#D6A84F]" />
            <div className="text-xs font-semibold text-[#CCD0CF]">
              {t('analytics.aiDiagnostics', AI_ANOMALY.title)}
            </div>
          </div>
          <span className="text-[9px] bg-[#D6A84F]/15 text-[#D6A84F] border border-[#D6A84F]/30 px-1.5 py-0.2 rounded uppercase font-semibold">
            {t('analytics.critical', 'Notice')}
          </span>
        </div>

        <p className="text-[11px] text-[#8FA8B2] leading-snug mb-2 font-normal">
          {t('analytics.thermalAnomalyDetected', AI_ANOMALY.headline)}
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenAnomalyModal}
            className="py-1.5 px-2 rounded-lg bg-[#142D3A] hover:bg-[#183746] text-xs font-medium text-[#CCD0CF] border border-[#214555] hover:border-[#0C969C] flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
          >
            <span className="truncate">{t('analytics.inspectDetails', 'Diagnostics')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#637C87] shrink-0" />
          </button>

          {onAskCopilot && (
            <button
              onClick={() => onAskCopilot(`Diagnose subsurface thermal anomaly, thermocline gradient, and Oxygen Minimum Zone in ${activeRegion?.name || 'this basin'}`)}
              className="py-1.5 px-2 rounded-lg bg-[#142D3A] hover:bg-[#183746] text-xs font-medium text-[#CCD0CF] border border-[#214555] hover:border-[#0C969C] flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
              title="Ask AI Copilot to analyze this thermal anomaly"
            >
              <Bot className="w-3 h-3 text-[#0C969C] shrink-0" />
              <span className="truncate">Ask Copilot</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
