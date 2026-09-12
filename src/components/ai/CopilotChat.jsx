import React, { useRef, useEffect, useState } from 'react';
import { Bot, User, CheckCircle, Info, ChevronDown, ChevronUp, Cpu, ExternalLink } from 'lucide-react';

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
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 text-slate-200 text-xs">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center my-auto py-8 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-glow-cyan">
            <Bot className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Ocean Vision 3D AI Copilot</h4>
          <p className="text-slate-400 text-[11px] max-w-xs leading-relaxed mb-4">
            Context-aware scientific assistant for oceanographic modeling, hydrodynamics, and storm intelligence.
          </p>
          <div className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
            OBSERVE → UNDERSTAND → PREDICT → SIMULATE → ACT
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
            <span className="text-[10px] text-slate-400 font-mono ml-1">Analyzing ocean digital twin...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessageItem({ message, onSuggestionClick }) {
  const isUser = message.role === 'user';
  const [showWhy, setShowWhy] = useState(false);

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
  const { content, toolResults = [], provenance = [], dataPointsUsed = [] } = message;

  return (
    <div className="flex items-start gap-2 max-w-[92%] self-start flex-col">
      <div className="flex items-start gap-2 w-full">
        <div className="w-6 h-6 rounded-lg bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 p-3.5 rounded-2xl rounded-tl-none bg-[#07152e] border border-sky-500/30 text-slate-200 shadow-md">
          {/* Scientific Provenance Tags */}
          {provenance && provenance.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5 pb-2 border-b border-sky-500/15">
              {provenance.map((p, i) => {
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
                    {p.label && <span className="opacity-90 font-normal truncate max-w-[150px]">{p.label}</span>}
                  </span>
                );
              })}
            </div>
          )}

          {/* Formatted Message Body */}
          <div className="leading-relaxed space-y-2">
            <RenderMarkdown content={content} />
          </div>

          {/* Tool Execution Confirmation Badges */}
          {toolResults && toolResults.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-sky-500/20 flex flex-col gap-1.5">
              {toolResults.map((res, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border ${
                    res.success
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{res.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Collapsible "Why this answer?" context inspector */}
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
    </div>
  );
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
