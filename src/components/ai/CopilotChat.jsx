import React, { useRef, useEffect, useState } from 'react';
import { 
  Bot, 
  User, 
  CheckCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles, 
  BarChart2, 
  ArrowRightLeft, 
  AlertTriangle, 
  Activity,
  Layers
} from 'lucide-react';

export default function CopilotChat({
  messages = [],
  isLoading = false,
  onSuggestionClick
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3.5 text-slate-200 text-xs">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center my-auto py-8 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-glow-cyan">
            <Bot className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Nerida · AI Ocean Copilot</h4>
          <p className="text-slate-400 text-[11px] max-w-xs leading-relaxed mb-4">
            Interactive digital-twin intelligence agent. Ask arbitrary questions, compare basins, inspect vertical profiles, or discover hydrographic anomalies.
          </p>
          <div className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
            OBSERVE → REASON → TOOL EXECUTION → DIGITAL TWIN MUTATION
          </div>
        </div>
      )}

      {messages.map((msg, idx) => (
        <ChatMessageItem key={idx} message={msg} onSuggestionClick={onSuggestionClick} />
      ))}

      {isLoading && (
        <div className="flex items-start gap-2 max-w-[85%] self-start animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="p-3 rounded-2xl rounded-tl-none bg-[#0a1835] border border-cyan-500/30 text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse delay-100"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-200"></span>
            <span className="text-[10px] text-slate-400 font-mono ml-1">Nerida ● Executing digital-twin reasoning...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessageItem({ message, onSuggestionClick }) {
  const isUser = message.role === 'user';
  const [showWhy, setShowWhy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isUser) {
    return (
      <div className="flex items-start gap-2 max-w-[85%] self-end flex-row-reverse">
        <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
        <div className="p-3 rounded-2xl rounded-tr-none bg-gradient-to-br from-[#0c244d] to-[#081a38] border border-sky-500/30 text-white shadow-md">
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant Message
  const { content, toolResults = [], provenance = [], dataPointsUsed = [], data, suggestions = [] } = message;

  return (
    <div className="flex items-start gap-2 max-w-[95%] self-start flex-col">
      <div className="flex items-start gap-2 w-full">
        <div className="w-6 h-6 rounded-lg bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 p-3.5 rounded-2xl rounded-tl-none bg-[#07152e] border border-sky-500/30 text-slate-200 shadow-md relative group">
          {/* Top Bar: Provenance Badges + Copy Button */}
          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-sky-500/15">
            <div className="flex items-center gap-1.5 flex-wrap">
              {provenance && provenance.length > 0 ? (
                provenance.map((p, i) => {
                  const colorMap = {
                    OBSERVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                    FORECAST: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    SIMULATED: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                    'AI-DERIVED': 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  };
                  const badgeStyle = colorMap[p.type] || 'bg-slate-700/50 text-slate-300 border-slate-600';

                  return (
                    <span
                      key={i}
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${badgeStyle} flex items-center gap-1`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current"></span>
                      <span>[{p.type}]</span>
                      {p.label && <span className="opacity-90 font-normal truncate max-w-[140px]">{p.label}</span>}
                    </span>
                  );
                })
              ) : (
                <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Nerida Scientific Copilot
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              title="Copy message"
              className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 text-slate-300 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Formatted Message Body */}
          <div className="leading-relaxed space-y-2">
            <RenderMarkdown content={content} />
          </div>

          {/* Structured Data Cards */}
          {data && (
            <div className="mt-3">
              <StructuredDataCard data={data} />
            </div>
          )}

          {/* Tool Execution Step Confirmation Badges */}
          {toolResults && toolResults.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-sky-500/20 flex flex-col gap-1.5">
              {toolResults.map((res, i) => {
                const isSuccess = res.success !== false && res.status !== 'error';
                const text = res.indicator || res.message || `Action executed: ${res.tool || res.type}`;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border ${
                      isSuccess
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-cyan-400">Nerida ✓</span>
                    <span className="truncate">{text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Collapsible Telemetry Context ("Why this answer?") */}
          {dataPointsUsed && dataPointsUsed.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-sky-500/10">
              <button
                onClick={() => setShowWhy(!showWhy)}
                className="flex items-center justify-between w-full text-[10px] text-sky-400 hover:text-sky-300 font-mono py-0.5 cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3 text-sky-400" />
                  Why this answer? (Telemetry Context)
                </span>
                {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showWhy && (
                <div className="mt-1.5 p-2 rounded-lg bg-black/40 border border-sky-500/20 text-[9px] font-mono text-slate-300 flex flex-col gap-1">
                  {dataPointsUsed.map((dp, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{dp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Contextual Suggestion Chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="ml-8 mt-1 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mr-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Suggested:
          </span>
          {suggestions.map((sug, sIdx) => (
            <button
              key={sIdx}
              onClick={() => onSuggestionClick && onSuggestionClick(sug)}
              className="text-[10px] font-mono bg-[#092244]/80 hover:bg-cyan-900/60 text-cyan-300 hover:text-cyan-100 border border-cyan-500/30 hover:border-cyan-400/60 rounded-full px-2.5 py-1 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders structured scientific data cards: Vertical Profile, Basin Comparison, or Anomaly Diagnostics
 */
function StructuredDataCard({ data }) {
  if (!data) return null;

  // Case 1: Basin Comparison Card
  if (data.basin1 && data.basin2) {
    return (
      <div className="rounded-xl bg-[#040f24] border border-cyan-500/30 p-3 flex flex-col gap-2 font-mono">
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Basin Comparison: {data.parameterName}</span>
          </div>
          <span className="text-[10px] text-slate-400">Depth: {data.depth}m</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* Basin 1 */}
          <div className={`p-2 rounded-lg border flex flex-col justify-between ${
            data.higherBasin === data.basin1.name 
              ? 'bg-cyan-950/40 border-cyan-500/50' 
              : 'bg-slate-900/40 border-slate-700/40'
          }`}>
            <span className="text-[10px] text-slate-300 font-semibold truncate">{data.basin1.name}</span>
            <div className="text-sm font-bold text-white mt-1">
              {data.basin1.value} <span className="text-[10px] font-normal text-slate-400">{data.unit}</span>
            </div>
            {data.higherBasin === data.basin1.name && (
              <span className="text-[9px] text-emerald-400 font-bold mt-1">▲ Higher Value</span>
            )}
          </div>

          {/* Basin 2 */}
          <div className={`p-2 rounded-lg border flex flex-col justify-between ${
            data.higherBasin === data.basin2.name 
              ? 'bg-cyan-950/40 border-cyan-500/50' 
              : 'bg-slate-900/40 border-slate-700/40'
          }`}>
            <span className="text-[10px] text-slate-300 font-semibold truncate">{data.basin2.name}</span>
            <div className="text-sm font-bold text-white mt-1">
              {data.basin2.value} <span className="text-[10px] font-normal text-slate-400">{data.unit}</span>
            </div>
            {data.higherBasin === data.basin2.name && (
              <span className="text-[9px] text-emerald-400 font-bold mt-1">▲ Higher Value</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] bg-sky-950/30 px-2 py-1.5 rounded border border-sky-500/20 mt-0.5">
          <span className="text-slate-400">Net Difference (Δ):</span>
          <span className="font-bold text-cyan-300">|{data.difference}| {data.unit}</span>
        </div>
      </div>
    );
  }

  // Case 2: Vertical Profile Card (Chart / Depth Slices)
  if (data.depths && data.values) {
    const minVal = Math.min(...data.values);
    const maxVal = Math.max(...data.values);
    const range = (maxVal - minVal) || 1;

    return (
      <div className="rounded-xl bg-[#040f24] border border-cyan-500/30 p-3 flex flex-col gap-2 font-mono">
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vertical Profile: {data.location}</span>
          </div>
          <span className="text-[10px] text-slate-400">{data.parameterName}</span>
        </div>

        <div className="flex flex-col gap-1 mt-1 max-h-[160px] overflow-y-auto pr-1">
          {data.depths.map((d, idx) => {
            const val = data.values[idx];
            const pct = Math.min(100, Math.max(10, ((val - minVal) / range) * 100));

            return (
              <div key={d} className="flex items-center gap-2 text-[10px]">
                <span className="w-12 text-slate-400 text-right shrink-0">{d}m</span>
                <div className="flex-1 bg-slate-800/60 rounded-full h-3 overflow-hidden p-0.5 flex items-center">
                  <div 
                    className="bg-gradient-to-r from-cyan-600 to-sky-400 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-14 font-bold text-white text-right shrink-0">
                  {val} <span className="text-[8px] text-slate-400">{data.unit}</span>
                </span>
              </div>
            );
          })}
        </div>

        {data.thermoclineDepth && (
          <div className="text-[9px] text-slate-400 flex items-center gap-1 border-t border-sky-500/15 pt-1.5">
            <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Pycnocline: {data.thermoclineDepth}</span>
          </div>
        )}
      </div>
    );
  }

  // Case 3: Ocean Anomaly Diagnostics Card
  if (data.anomaly !== undefined && data.severity) {
    const severityColors = {
      CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      MODERATE: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      LOW: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
    };

    return (
      <div className="rounded-xl bg-[#040f24] border border-cyan-500/30 p-3 flex flex-col gap-2 font-mono">
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Thermal & Haline Anomaly Diagnostic</span>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${severityColors[data.severity] || severityColors.LOW}`}>
            {data.severity}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mt-1">
          <div className="p-1.5 bg-slate-900/60 rounded border border-slate-700/40">
            <div className="text-[9px] text-slate-400">Observed</div>
            <div className="font-bold text-white text-xs mt-0.5">{data.currentValue} {data.unit}</div>
          </div>
          <div className="p-1.5 bg-slate-900/60 rounded border border-slate-700/40">
            <div className="text-[9px] text-slate-400">Baseline (30y)</div>
            <div className="font-bold text-slate-300 text-xs mt-0.5">{data.baseline} {data.unit}</div>
          </div>
          <div className="p-1.5 bg-cyan-950/40 rounded border border-cyan-500/40">
            <div className="text-[9px] text-cyan-400">Anomaly Δ</div>
            <div className="font-bold text-cyan-200 text-xs mt-0.5">{data.anomaly} {data.unit}</div>
          </div>
        </div>

        {data.confidence && (
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-sky-500/10">
            <span>Ensemble Confidence: <strong className="text-emerald-400">{data.confidence}</strong></span>
            <span>Target Depth: {data.depth}m</span>
          </div>
        )}
      </div>
    );
  }

  // Case 4: Single Point Metric Card
  if (data.value !== undefined && data.parameterName) {
    return (
      <div className="rounded-xl bg-[#040f24] border border-cyan-500/30 p-2.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">{data.location} · {data.depth}m</div>
            <div className="text-xs font-bold text-white">{data.parameterName}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-cyan-300">{data.value} <span className="text-[10px] text-slate-400">{data.unit}</span></div>
          <div className="text-[8px] text-slate-500">{data.coordinates}</div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Clean, lightweight renderer for Markdown elements (bold, italic, headers, tables, lists).
 */
function RenderMarkdown({ content = '' }) {
  const lines = content.split('\n');
  const rendered = [];
  let tableRows = [];
  let inTable = false;

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      rendered.push(
        <div key={`table-${key}`} className="overflow-x-auto my-2 rounded border border-sky-500/20">
          <table className="w-full text-left border-collapse text-[10px] font-mono">
            <tbody>
              {tableRows.map((tr, rIdx) => {
                const cols = tr.split('|').filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
                const isHeader = rIdx === 0;
                return (
                  <tr key={rIdx} className={isHeader ? 'bg-sky-500/20 font-bold text-white' : 'border-t border-sky-500/10'}>
                    {cols.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1.5">
                        {renderInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Table row detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) {
        // Divider row, skip
        return;
      }
      inTable = true;
      tableRows.push(trimmed);
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      rendered.push(
        <h4 key={idx} className="text-xs font-bold text-cyan-300 mt-2 mb-1 flex items-center gap-1.5">
          {renderInline(trimmed.replace('### ', ''))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      rendered.push(
        <h3 key={idx} className="text-sm font-bold text-white mt-2 mb-1">
          {renderInline(trimmed.replace('## ', ''))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      rendered.push(
        <div key={idx} className="flex items-start gap-1.5 ml-2 text-slate-300">
          <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
          <span className="flex-1">{renderInline(trimmed.substring(2))}</span>
        </div>
      );
    } else if (trimmed === '') {
      rendered.push(<div key={idx} className="h-1" />);
    } else {
      rendered.push(
        <p key={idx} className="text-slate-300 leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  if (inTable) {
    flushTable('end');
  }

  return <>{rendered}</>;
}

function renderInline(text) {
  // Replace **bold** with <strong>
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
