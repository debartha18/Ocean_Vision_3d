import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Waves, 
  Activity, 
  Thermometer, 
  ShieldAlert, 
  Radio, 
  Globe2, 
  CheckCircle2, 
  ArrowUpRight,
  Cpu,
  Compass,
  FileText,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { REGIONS, VALIDATION_METRICS, IN_SITU_SUMMARY, AI_ANOMALY } from '../../data/oceanData';

export default function DashboardView({
  onSelectRegion,
  activeRegion,
  onNavigateTab,
  onOpenAnalyticReport,
  onOpenFleetModal,
  onOpenStormNews,
  onOpenAlerts
}) {
  const { t } = useTranslation();

  const globalKpis = [
    {
      title: t('dashboard.activeFleet', 'Active Observing Fleet'),
      value: '49 Platforms',
      sub: '24 Moored • 18 Argo • 7 Drifters',
      icon: Radio,
      color: 'text-cyan-300',
      border: 'border-cyan-500/30',
      bg: 'bg-[#091b40]/80',
      action: onOpenFleetModal,
      actionLabel: t('common.viewFleet', 'View Fleet')
    },
    {
      title: t('dashboard.globalMeanSst', 'Global Mean SST'),
      value: '18.42 °C',
      sub: '+0.34 °C above 1991-2020 climatology',
      icon: Thermometer,
      color: 'text-amber-300',
      border: 'border-amber-500/30',
      bg: 'bg-[#181206]/80',
      action: () => onNavigateTab?.('Map View'),
      actionLabel: t('common.sstMap', 'SST Map')
    },
    {
      title: t('dashboard.waveSwell', 'Global Wave Swell Energy'),
      value: '2.15 m',
      sub: 'Mean significant swell height',
      icon: Activity,
      color: 'text-sky-300',
      border: 'border-sky-500/30',
      bg: 'bg-[#061530]/80',
      action: () => onNavigateTab?.('3D View'),
      actionLabel: t('common.simulateSwell', 'Simulate Swell')
    },
    {
      title: t('dashboard.activeStorms', 'Active Tropical Vortices'),
      value: '3 Systems',
      sub: 'REMAL (Cat 3) • YAGI (Cat 4) • BERYL',
      icon: ShieldAlert,
      color: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'bg-[#1e0818]/80',
      action: onOpenStormNews,
      actionLabel: t('common.stormTracks', 'Storm Tracks')
    },
    {
      title: t('dashboard.qcScore', 'QC Assimilation Score'),
      value: '99.4%',
      sub: `RMSE ${VALIDATION_METRICS.rmse} • Corr ${VALIDATION_METRICS.correlation}`,
      icon: CheckCircle2,
      color: 'text-emerald-300',
      border: 'border-emerald-500/30',
      bg: 'bg-[#061e16]/80',
      action: onOpenAnalyticReport,
      actionLabel: t('common.qcReport', 'QC Report')
    }
  ];

  return (
    <div className="relative flex-1 overflow-y-auto bg-[#030712] text-slate-100 p-4 md:p-6 select-none animate-in fade-in duration-200 custom-scrollbar">
      {/* 1. Header Banner with OCEANOVA Emblem */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-500/20">
        <div className="flex items-center gap-4">
          <img
            src="/oceanova-logo.jpg"
            alt="OCEANOVA"
            className="w-14 h-14 rounded-2xl object-cover border border-cyan-400/40 shadow-glow-cyan hidden sm:block shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white uppercase">
                {t('dashboard.twinDashboard', 'OCEANOVA • Digital Twin Dashboard')}
              </h1>
            </div>
            <p className="text-xs text-slate-300/80 mt-1">
              <strong className="text-cyan-400">{t('brand.motto', 'Explore • Analyze • Preserve')}</strong> — {t('dashboard.bannerSubtitle', 'Planetary ocean telemetry, satellite altimetry assimilation, and 3D simulation state')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab?.('3D View')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-cyan-300 border border-sky-500/30 transition-all cursor-pointer"
          >
            <Waves className="w-4 h-4" />
            <span>{t('dashboard.launch3D', 'Launch 3D View')}</span>
          </button>
          <button
            onClick={() => onNavigateTab?.('Map View')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-cyan-300 border border-sky-500/30 transition-all cursor-pointer"
          >
            <Globe2 className="w-4 h-4" />
            <span>{t('dashboard.openMap', 'Open World Map')}</span>
          </button>
          <button
            onClick={onOpenAnalyticReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{t('common.printReport', 'Print Analytic Report')}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Global KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        {globalKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className={`p-4 rounded-2xl border ${kpi.border} ${kpi.bg} backdrop-blur-md shadow-cockpit flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className={`text-xl font-black font-mono ${kpi.color} mb-1`}>{kpi.value}</div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[120px]">{kpi.sub}</span>
                <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
                  {kpi.actionLabel}
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Grid: Ocean Basins Matrix (Left) + Threat Stream & Validation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2 Cols: Planetary Ocean Basins Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>{t('dashboard.globalBasinsHubs', 'Global Ocean Basins & In-Situ Hubs')}</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-300">
              {t('dashboard.selectBasinPrompt', 'Select basin to launch 3D twin or view on map')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.values(REGIONS).map((reg) => {
              const isSelected = activeRegion?.id === reg.id;
              return (
                <div
                  key={reg.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0b2452]/90 to-[#05112e]/90 border-cyan-400 shadow-glow-cyan'
                      : 'bg-[#071536]/70 border-sky-500/20 hover:border-cyan-400/50 hover:bg-[#0a1e48]/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{reg.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 text-[9px] font-mono">{t('dashboard.activeTarget', 'Active Target')}</span>
                        )}
                      </h3>
                      <div className="text-[10px] font-mono text-cyan-300/80">{reg.coords}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      reg.stormProbability > 70
                        ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {reg.stormProbability > 70 ? t('analytics.severeAlert', 'Cyclone Alert') : t('dashboard.nominal', 'Nominal')}
                    </span>
                  </div>

                  {/* 4 Metric Pills */}
                  <div className="grid grid-cols-4 gap-1.5 my-2.5 text-center font-mono">
                    <div className="bg-[#030c22] p-1.5 rounded-xl border border-sky-500/10">
                      <div className="text-[8px] text-slate-400">SST</div>
                      <div className="text-xs font-bold text-white">{reg.sst}°C</div>
                    </div>
                    <div className="bg-[#030c22] p-1.5 rounded-xl border border-sky-500/10">
                      <div className="text-[8px] text-slate-400">{t('parameters.salinity', 'Salinity')}</div>
                      <div className="text-xs font-bold text-sky-300">{reg.salinity}</div>
                    </div>
                    <div className="bg-[#030c22] p-1.5 rounded-xl border border-sky-500/10">
                      <div className="text-[8px] text-slate-400">{t('parameters.currents', 'Current')}</div>
                      <div className="text-xs font-bold text-cyan-300">{reg.currentSpeed} m/s</div>
                    </div>
                    <div className="bg-[#030c22] p-1.5 rounded-xl border border-sky-500/10">
                      <div className="text-[8px] text-slate-400">{t('stormModal.breakerSwell', 'Swell')}</div>
                      <div className="text-xs font-bold text-amber-300">{reg.waveHeight}m</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sky-500/15 text-[10px] gap-2">
                    <span className="text-slate-400 truncate max-w-[160px]">
                      {t('stormModal.stormRisk', 'Threat')}: <b className="text-white">{reg.activeStorm?.name || t('dashboard.nominal', 'Nominal')}</b>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectRegion?.(reg);
                          onNavigateTab?.('Map View');
                        }}
                        className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{t('navbar.mapView', 'Map')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectRegion?.(reg);
                          onNavigateTab?.('3D View');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold flex items-center gap-1 shadow-glow-cyan cursor-pointer transition-all"
                      >
                        <Waves className="w-2.5 h-2.5" />
                        <span>{t('brand.twin', '3D Twin')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: AI Anomaly & Marine Threats Stream */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{t('dashboard.alertFeed', 'Real-Time Alert Feed')}</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('dashboard.liveStream', 'Live Stream')}
            </span>
          </div>

          {/* AI Marine Anomaly Card */}
          <div 
            onClick={onOpenAlerts}
            className="glass-panel p-4 rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#1c081e]/80 to-[#07132e]/90 shadow-glow-red cursor-pointer hover:border-red-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                <span>{t('analytics.aiDiagnostics', AI_ANOMALY.title)}</span>
              </div>
              <span className="text-[9px] font-mono text-red-300 group-hover:underline flex items-center gap-0.5">
                {t('dashboard.inspect', 'Inspect')} <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="text-xs font-bold text-white mb-1.5">{AI_ANOMALY.anomalyType}</div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              {AI_ANOMALY.details}
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-red-300 bg-red-500/20 p-2 rounded-xl border border-red-500/30">
              <span>{t('anomalyModal.confidence', 'Confidence')}: {AI_ANOMALY.confidence}</span>
              <span>{t('anomalyModal.deviation', 'Deviation')}: {AI_ANOMALY.deviation}</span>
            </div>
          </div>

          {/* In-Situ Fleet Breakdown */}
          <div 
            onClick={onOpenFleetModal}
            className="glass-panel p-4 rounded-2xl border border-sky-500/25 bg-[#071638]/70 cursor-pointer hover:border-cyan-400/50 transition-all group"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-200 mb-3 flex items-center justify-between">
              <span>{t('dashboard.platformsDistribution', 'Observing Platforms Distribution')}</span>
              <span className="text-[10px] font-mono text-cyan-300 group-hover:underline">49 Total Active →</span>
            </h3>

            <div className="flex flex-col gap-2">
              {Object.entries(IN_SITU_SUMMARY).map(([key, item]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-xl bg-[#030c22] border border-sky-500/15 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
                    <span className="text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Satellite Constellation Status */}
          <div className="glass-panel p-4 rounded-2xl border border-sky-500/25 bg-[#071638]/70 text-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2 flex items-center justify-between">
              <span>{t('dashboard.satelliteUplinks', 'Satellite Telemetry Uplinks')}</span>
              <span className="text-[9px] font-mono text-emerald-400">{t('dashboard.allNominal', 'All Nominal')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded-xl bg-[#030c22] border border-sky-500/10">
                <span className="text-slate-400 block">Sentinel-3 Altimetry</span>
                <span className="text-emerald-400 font-bold">Synchronized (0.8s)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#030c22] border border-sky-500/10">
                <span className="text-slate-400 block">Jason-3 Radiometer</span>
                <span className="text-emerald-400 font-bold">Passing QC-3</span>
              </div>
              <div className="p-2 rounded-xl bg-[#030c22] border border-sky-500/10">
                <span className="text-slate-400 block">SWOT SSH Radar</span>
                <span className="text-emerald-400 font-bold">Nominal (99.8%)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#030c22] border border-sky-500/10">
                <span className="text-slate-400 block">GOES-16 Visible</span>
                <span className="text-cyan-300 font-bold">Real-time Stream</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
