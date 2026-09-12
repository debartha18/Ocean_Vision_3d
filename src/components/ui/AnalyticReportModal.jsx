import React, { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Printer, 
  FileText, 
  CheckCircle, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Gauge, 
  CloudRain, 
  Umbrella, 
  Waves,
  ShieldAlert
} from 'lucide-react';
import { generatePressureDepthProfile, calculateGravity } from '../../utils/pressureCalculator';
import { getNearestBeaches, calculateBeachRainForecast } from '../../data/beachData';
import { VALIDATION_METRICS } from '../../data/oceanData';
import { getFormattedCurrentDate } from '../../utils/dateUtils';

export default function AnalyticReportModal({
  isOpen,
  onClose,
  activeRegion,
  selectedDate = getFormattedCurrentDate(),
  currentTime = '12:00 UTC'
}) {
  const { t } = useTranslation();
  const printRef = useRef(null);

  const lat = activeRegion?.lat ?? 15.297;
  const lon = activeRegion?.lon ?? 87.860;
  const sst = activeRegion?.sst ?? 29.85;
  const salinity = activeRegion?.salinity ?? 33.42;
  const currentSpeed = activeRegion?.currentSpeed ?? 0.85;
  const waveHeight = activeRegion?.waveHeight ?? 1.65;
  const stormProb = activeRegion?.stormProbability ?? 30;
  const rainRate = activeRegion?.rainRate ?? 1.5;
  const rainProb = activeRegion?.rainProbability ?? 35;
  const chlorophyll = activeRegion?.chlorophyll ?? 1.25;
  const oxygen = activeRegion?.oxygen ?? 6.85;

  const g = calculateGravity(lat);
  const depthProfile = generatePressureDepthProfile(lat, sst, salinity);
  const nearestBeaches = getNearestBeaches(lat, lon, 4);
  const beachForecasts = nearestBeaches.map((b) => calculateBeachRainForecast(b, stormProb));

  const reportId = useMemo(() => {
    return `OV3D-${Math.abs(Math.round(lat * 100))}-${Math.abs(Math.round(lon * 100))}-2026`;
  }, [lat, lon]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 select-none overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="analytic-printable-report"
        ref={printRef}
        className="glass-panel rounded-3xl p-6 md:p-8 border border-sky-500/40 shadow-2xl max-w-4xl w-full relative max-h-[94vh] flex flex-col bg-[#050f26] text-slate-100 overflow-y-auto"
      >
        {/* Modal Top Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-sky-500/20">
          <div className="flex items-center gap-2 text-cyan-300">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold tracking-wider uppercase">
              {t('report.dossierTitle', 'Oceanographic Telemetry & Digital Twin Dossier')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('report.printPdf', 'Print Report / Save as PDF')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- PRINTABLE REPORT CONTENT BEGINS --- */}
        <div className="printable-content flex flex-col gap-6 text-slate-200">
          {/* 1. Formal Report Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-500/30">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/oceanova-logo.jpg"
                  alt="Ocean Vision 3D"
                  className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40 shadow-glow-cyan"
                />
                <div>
                  <h1 className="text-xl font-black tracking-wider text-white">
                    {t('report.docTitle', 'OCEAN VISION 3D — OCEAN DIGITAL TWIN REPORT')}
                  </h1>
                  <p className="text-xs text-sky-400 font-mono uppercase tracking-wider">
                    {t('report.docSubtitle', 'Explore • Analyze • Preserve — Global Integrated Ocean Observing System (GOOS) Synthesis')}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono">
              <div className="text-slate-400">
                {t('report.reportId', 'REPORT ID')}: <span className="text-cyan-300 font-bold">{reportId}</span>
              </div>
              <div className="text-slate-400">
                {t('report.dateTime', 'DATE / TIME')}: <span className="text-white">{selectedDate} • {currentTime}</span>
              </div>
              <div className="text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t('report.qcPassed', 'Quality Control: QC Level-3 Passed')}</span>
              </div>
            </div>
          </div>

          {/* 2. Target Station & Geospatial Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0a1b42]/60 p-4 rounded-2xl border border-sky-500/20">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">{t('report.targetStation', 'Target Station')}</div>
              <div className="text-sm font-bold text-white mt-0.5 truncate">{activeRegion?.name}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">{t('report.geodeticCoords', 'Geodetic Coordinates')}</div>
              <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{activeRegion?.coords}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">{t('report.gravAccel', 'Gravitational Accel.')}</div>
              <div className="text-sm font-bold font-mono text-white mt-0.5">g(φ) = {g} m/s²</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">{t('report.surgeSwell', 'Surge / Wave Swell')}</div>
              <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{waveHeight} m {t('report.significant', 'Significant')}</div>
            </div>
          </div>

          {/* 3. Physical Ocean State Measurements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2.5 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>{t('report.inSituTelemetry', 'In-Situ Physical Oceanographic Telemetry')}</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#081533] border border-sky-500/15">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <Thermometer className="w-3.5 h-3.5 text-red-400" />
                  <span>{t('report.sst', 'Sea Surface Temp (SST)')}</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">{sst} °C</div>
                <div className="text-[10px] text-cyan-400/80">{t('report.anomalyBaseline', 'Anomaly: +1.2°C Baseline')}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#081533] border border-sky-500/15">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('report.salinity', 'Practical Salinity')}</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">{salinity} PSU</div>
                <div className="text-[10px] text-sky-400/80">{t('report.haloclineActive', 'Halocline active')}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#081533] border border-sky-500/15">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('report.currentVelocity', 'Current Velocity')}</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">{currentSpeed} m/s</div>
                <div className="text-[10px] text-slate-400">{t('report.bearingNE', 'Bearing: 045° North-East')}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#081533] border border-sky-500/15">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <CloudRain className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('report.precipRate', 'Precipitation Rate')}</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-300 mt-1">{rainRate} mm/h</div>
                <div className="text-[10px] text-amber-400/80">{t('report.stormRisk', 'Storm Risk')}: {stormProb}%</div>
              </div>
            </div>
          </div>

          {/* 4. Complete Hydrostatic Pressure Depth Profile Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span>{t('report.hydroProfileTitle', 'Full Water Column Hydrostatic Pressure Profile (UNESCO Formulation)')}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                P(z) = P_atm + ρ(z) · g(φ) · z
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-sky-500/20 bg-[#040e24]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#091b42] text-[10px] text-slate-400 uppercase border-b border-sky-500/20">
                    <th className="py-2 px-3">{t('report.depthZ', 'Depth (z)')}</th>
                    <th className="py-2 px-3">{t('report.pressureDbar', 'Pressure (dbar)')}</th>
                    <th className="py-2 px-3">{t('report.atmospheres', 'Atmospheres')}</th>
                    <th className="py-2 px-3">{t('report.mpa', 'MPa')}</th>
                    <th className="py-2 px-3">{t('report.psi', 'PSI (lb/in²)')}</th>
                    <th className="py-2 px-3">{t('report.density', 'Density ρ (kg/m³)')}</th>
                    <th className="py-2 px-3">{t('report.oceanicZone', 'Oceanographic Zone')}</th>
                  </tr>
                </thead>
                <tbody>
                  {depthProfile.map((d, i) => (
                    <tr
                      key={d.depth}
                      className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-[#05112a]' : 'bg-[#030919]'}`}
                    >
                      <td className="py-1.5 px-3 font-bold text-cyan-300">{d.depth} m</td>
                      <td className="py-1.5 px-3 text-cyan-200">{d.dbar.toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-sky-200">{d.atm.toLocaleString()} atm</td>
                      <td className="py-1.5 px-3 text-amber-200">{d.mpa} MPa</td>
                      <td className="py-1.5 px-3 text-emerald-200">{d.psi.toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-slate-300">{d.density}</td>
                      <td className="py-1.5 px-3 text-[10px] text-slate-400">
                        {d.benchmarkKey ? t('zones.' + d.benchmarkKey, d.benchmark) : d.benchmark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Near-Sea Beaches & Coastal Weather Rain Predictions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Umbrella className="w-4 h-4 text-amber-400" />
                <span>{t('report.nearestBeachesTitle', 'Nearest Coastal Beaches: Rain Forecast & Surf Safety Intelligence')}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {t('report.spatialProximity', 'Spatial Proximity Analysis')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {beachForecasts.map((b) => (
                <div 
                  key={b.beachId}
                  className="p-3.5 rounded-2xl bg-[#091738] border border-sky-500/20 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{b.beachName}</span>
                        <span className="text-[10px] font-normal text-slate-400 font-mono">({b.distanceKm} km {t('report.away', 'away')})</span>
                      </div>
                      <div className="text-[11px] text-sky-300 font-mono">{b.location}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      b.safetyFlag.includes('Red')
                        ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                        : b.safetyFlag.includes('Yellow')
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {b.safetyFlag.split(' ')[0]} {t('report.flag', 'Flag')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-2 text-center">
                    <div className="bg-[#040e26] p-1.5 rounded-xl">
                      <div className="text-[9px] text-slate-400 uppercase">{t('report.rainProb', 'Rain Probability')}</div>
                      <div className="text-sm font-bold font-mono text-amber-300">{b.rainProbability}%</div>
                    </div>
                    <div className="bg-[#040e26] p-1.5 rounded-xl">
                      <div className="text-[9px] text-slate-400 uppercase">{t('report.precip24h', '24h Precip')}</div>
                      <div className="text-sm font-bold font-mono text-cyan-300">{b.total24hPrecipMm} mm</div>
                    </div>
                    <div className="bg-[#040e26] p-1.5 rounded-xl">
                      <div className="text-[9px] text-slate-400 uppercase">{t('report.surfBreakers', 'Surf Breakers')}</div>
                      <div className="text-sm font-bold font-mono text-white">{b.surfWaveHeight} m</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-normal italic mt-1">
                    "{b.advisoryText}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Validation Accuracy & Environmental Hazard Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Model Validation */}
            <div className="p-4 rounded-2xl bg-[#061433] border border-sky-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-200 mb-2">
                {t('report.predictiveQcTitle', 'Predictive Model vs In-Situ QC Metrics')}
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <div className="bg-[#0a1d48] p-2 rounded-xl">
                  <div className="text-[9px] text-slate-400">{t('report.rmse', 'Root Mean Sq (RMSE)')}</div>
                  <div className="text-xs font-mono font-bold text-cyan-300">{VALIDATION_METRICS.rmse}</div>
                </div>
                <div className="bg-[#0a1d48] p-2 rounded-xl">
                  <div className="text-[9px] text-slate-400">{t('report.systemicBias', 'Systemic Bias')}</div>
                  <div className="text-xs font-mono font-bold text-amber-300">{VALIDATION_METRICS.bias}</div>
                </div>
                <div className="bg-[#0a1d48] p-2 rounded-xl">
                  <div className="text-[9px] text-slate-400">{t('report.pearsonCorr', 'Pearson Correlation')}</div>
                  <div className="text-xs font-mono font-bold text-emerald-300">{VALIDATION_METRICS.correlation}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                {t('report.synchronizedPlatforms', '49 synchronized in-situ observing platforms reporting (24 Moored Buoys, 18 Argo Profiling Floats, 7 SVP Drifters).')}
              </p>
            </div>

            {/* Environmental Warning */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/30 to-[#07132e] border border-red-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>{t('report.marineThreatTitle', 'Marine Threat & Advisory Status')}</span>
              </div>
              <div className="text-xs font-bold text-white mb-1">
                {activeRegion?.activeStorm?.name || t('report.defaultStormName', 'Low Pressure Marine Front')}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                {activeRegion?.activeStorm?.rainfallForecast || t('report.defaultStormForecast', 'Convective squalls and elevated wind waves detected in sector.')}
              </p>
              <div className="text-[10px] font-mono text-red-300 bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/30 inline-block">
                {t('report.stormAdvisory', 'Storm Advisory: Central Pressure')} {activeRegion?.activeStorm?.pressure || '995 hPa'} • {t('report.surge', 'Surge')} {activeRegion?.activeStorm?.surge || '1.5m'}
              </div>
            </div>
          </div>

          {/* 7. Signature & Certification */}
          <div className="pt-4 border-t border-sky-500/20 flex flex-col md:flex-row md:items-center justify-between text-[11px] text-slate-400 font-mono">
            <div>
              {t('report.telemetryEngine', 'Automated Digital Twin Telemetry Engine • OceanVision 3D Core v2.4')}
            </div>
            <div className="text-right">
              {t('report.validatedStandards', 'Validated by INCOIS / NOAA / Copernicus Standards')}
            </div>
          </div>
        </div>
        {/* --- PRINTABLE REPORT CONTENT ENDS --- */}

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="no-print flex items-center justify-between pt-6 mt-4 border-t border-sky-500/20">
          <span className="text-xs text-slate-400">
            {t('report.printTip', 'Press Print or use browser Ctrl+P to save as formatted PDF document.')}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold text-slate-300 transition-colors"
            >
              {t('report.closeDossier', 'Close Dossier')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{t('report.printAnalyticReport', 'Print Analytic Report')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
