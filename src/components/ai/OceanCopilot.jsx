import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import CopilotHeader from './CopilotHeader';
import CopilotContextCard from './CopilotContextCard';
import CopilotQuickActions from './CopilotQuickActions';
import CopilotChat from './CopilotChat';
import { buildOceanContext } from '../../lib/ai/oceanContext';
import { executeToolCalls } from '../../lib/ai/toolRegistry';
import { sendCopilotMessage } from '../../lib/ai/copilotClient';

export default function OceanCopilot({
  activeRegion,
  selectedParam,
  setSelectedParam,
  depth,
  setDepth,
  viewMode,
  setViewMode,
  timeHour,
  selectedDate,
  isStormLayerActive,
  setIsStormLayerActive,
  ensoState,
  setActiveRegion,
  setActiveTab,
  onCustomCoords,
  setIsAnomalyModalOpen,
  setIsFleetModalOpen,
  setIsLocationModalOpen,
  setIsDatePickerModalOpen,
  setIsStormNewsModalOpen,
  setIsAnalyticReportOpen,
  setIsDepthPressureOpen,
  setIsColorbarSettingsOpen,
  setIsNetcdfIngestionOpen,
  externalPrompt,
  onClearExternalPrompt
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [engineSource, setEngineSource] = useState('offline');
  const inputRef = useRef(null);

  // Group UI state handlers for safe tool execution
  const handlers = {
    setSelectedParam,
    setDepth,
    setViewMode,
    setIsStormLayerActive,
    setActiveRegion,
    setActiveTab,
    onCustomCoords,
    setIsAnomalyModalOpen,
    setIsFleetModalOpen,
    setIsLocationModalOpen,
    setIsDatePickerModalOpen,
    setIsStormNewsModalOpen,
    setIsAnalyticReportOpen,
    setIsDepthPressureOpen,
    setIsColorbarSettingsOpen,
    setIsNetcdfIngestionOpen
  };

  // Build current ocean context snapshot
  const oceanContext = buildOceanContext({
    activeRegion,
    selectedParam,
    depth,
    viewMode,
    timeHour,
    selectedDate,
    isStormLayerActive,
    ensoState
  });

  const handleSendMessage = useCallback(async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await sendCopilotMessage({
        prompt: query,
        conversationHistory: messages,
        oceanContext,
        language: 'en'
      });

      setEngineSource(result.source || 'offline');

      // Execute safe UI actions if requested by the AI engine
      let toolResults = [];
      if (result.toolCalls && result.toolCalls.length > 0) {
        toolResults = executeToolCalls(result.toolCalls, handlers);
      }

      const assistantMsg = {
        role: 'assistant',
        content: result.response,
        toolResults,
        provenance: result.provenance,
        dataPointsUsed: result.dataPointsUsed,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Encountered an error analyzing the ocean digital twin: ${err.message}`,
          provenance: [{ type: 'AI-DERIVED', label: 'Local System Error Handler' }],
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputText, isLoading, messages, oceanContext]);

  // Handle external prompts (e.g. from "Explain this" buttons on other panels)
  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, handleSendMessage, onClearExternalPrompt]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K to toggle Copilot
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 1. Floating Bottom-Right Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-24 right-5 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#071d49] via-[#09356b] to-[#0b548b] hover:from-[#092c73] hover:to-[#0e6ba8] text-white border border-cyan-400/40 shadow-glow-cyan hover:shadow-2xl hover:border-cyan-300 transition-all cursor-pointer select-none"
            title="Open AI Ocean Copilot (Ctrl+K)"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4 text-cyan-300" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide text-white flex items-center gap-1.5">
                AI Ocean Copilot
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </span>
              <span className="text-[9px] font-mono text-cyan-300/80">
                {activeRegion?.name || 'Ocean Telemetry'} • Ctrl+K
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. Slide-Over / Docked Intelligence Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 z-40 flex flex-col rounded-3xl border border-cyan-500/35 bg-[#030816]/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out select-none ${
            isExpanded
              ? 'w-[640px] max-w-[96vw] h-[720px] max-h-[86vh]'
              : 'w-[430px] max-w-[95vw] h-[580px] max-h-[80vh]'
          }`}
          style={{
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.15)'
          }}
        >
          {/* Header */}
          <CopilotHeader
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onClose={() => setIsOpen(false)}
            onClearHistory={() => setMessages([])}
            engineSource={engineSource}
            activeBasinName={activeRegion?.name}
          />

          {/* Collapsible Telemetry Context Capsule */}
          <CopilotContextCard oceanContext={oceanContext} />

          {/* Chat Stream & Action Cards */}
          <CopilotChat
            messages={messages}
            isLoading={isLoading}
            onSuggestionClick={(prompt) => handleSendMessage(prompt)}
          />

          {/* Quick Domain Actions */}
          <CopilotQuickActions
            disabled={isLoading}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          />

          {/* Bottom Chat Input Form */}
          <div className="p-3 border-t border-sky-500/20 bg-[#040e21]/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Copilot (e.g. 'Show SST at 100m in Arabian Sea')..."
                  disabled={isLoading}
                  className="w-full bg-[#071633] text-slate-100 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-sky-500/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-glow-cyan transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-1.5 px-1 text-[9px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                Zero-Hallucination Ocean Intelligence
              </span>
              <span>Enter ↵</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
