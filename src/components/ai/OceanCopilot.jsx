import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CopilotHeader from './CopilotHeader';
import CopilotContextCard from './CopilotContextCard';
import CopilotQuickActions from './CopilotQuickActions';
import CopilotChat from './CopilotChat';
import MermaidMascot from './MermaidMascot';
import VoiceInputButton from './VoiceInputButton';
import VoiceLiveBanner from './VoiceLiveBanner';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { stopSpeaking } from '../../lib/ai/voice/ttsProvider';
import { buildOceanContext } from '../../lib/ai/oceanContext';
import { executeCopilotActions, executeToolCalls } from '../../lib/ai/toolRegistry';
import { sendCopilotMessage } from '../../lib/ai/copilotClient';
import { getCopilotLexicon } from '../../lib/ai/copilotTranslations';

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
  onClearExternalPrompt,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen
}) {
  const { i18n } = useTranslation();
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen;
  const setIsOpen = propSetIsOpen || setLocalIsOpen;
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [engineSource, setEngineSource] = useState('offline');
  const inputRef = useRef(null);

  // Group UI state handlers for safe allowlisted action execution via ref to avoid churn
  const handlersRef = useRef({});
  handlersRef.current = {
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

  const currentLang = i18n?.language || 'en';
  const L = getCopilotLexicon(currentLang);
  const isRtl = ['ur', 'sd', 'ks'].includes(currentLang);

  const handleSendMessage = useCallback(async (textToSend, options = {}) => {
    const query = typeof textToSend === 'string' ? textToSend : inputText;
    if (!query || !query.trim() || isLoading) return;

    // Barge-in: Halt any TTS speech when a message is sent
    stopSpeaking();

    const trimmedQuery = query.trim();
    const requestId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID().slice(0, 8) 
      : Math.random().toString(36).substring(2, 10);

    const inputMode = options.inputMode || 'text';
    const voiceConfidence = options.confidence ?? null;

    const userMsg = {
      id: `user-${requestId}`,
      role: 'user',
      content: trimmedQuery,
      inputMode,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await sendCopilotMessage({
        message: trimmedQuery,
        prompt: trimmedQuery,
        conversationHistory: messages,
        oceanContext,
        oceanState: {
          basin: activeRegion?.name,
          basinId: activeRegion?.id,
          depth: depth,
          parameter: selectedParam,
          viewMode: viewMode,
          latitude: activeRegion?.latitude,
          longitude: activeRegion?.longitude,
          rawRegion: activeRegion,
          language: currentLang
        },
        language: currentLang,
        inputMode,
        voiceConfidence,
        requestId
      });

      setEngineSource(result.source || 'offline');

      // Execute allowlisted application actions
      let toolExecutionResults = [];
      if (result.actions && result.actions.length > 0) {
        toolExecutionResults = executeCopilotActions(result.actions, handlersRef.current);
      } else if (result.toolCalls && result.toolCalls.length > 0) {
        toolExecutionResults = executeToolCalls(result.toolCalls, handlersRef.current);
      }

      const assistantMsg = {
        id: `asst-${requestId}`,
        role: 'assistant',
        content: result.message || result.response,
        actions: result.actions || [],
        data: result.data || null,
        suggestions: result.suggestions || [],
        toolResults: toolExecutionResults.length > 0 ? toolExecutionResults : (result.toolResults || []),
        provenance: result.provenance || [{ type: 'AI-DERIVED', label: 'Nerida Dynamic Model' }],
        dataPointsUsed: result.dataPointsUsed || [],
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${requestId}`,
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
  }, [inputText, isLoading, messages, oceanContext, activeRegion, depth, selectedParam, viewMode, currentLang]);



  // Voice input hook coordinating 23-language speech recognition
  const voice = useVoiceInput({
    language: currentLang,
    onTranscriptReady: (transcript, options) => {
      handleSendMessage(transcript, options);
    }
  });

  // Handle external prompts (e.g. from "Explain this" buttons on other panels)
  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, handleSendMessage, onClearExternalPrompt, setIsOpen]);

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
  }, [setIsOpen]);

  // Enter sends, Shift+Enter creates a new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 1. Floating Animated Mermaid Marine Character Mascot */}
      <MermaidMascot
        isOpen={isOpen}
        onClick={() => setIsOpen(true)}
        activeRegionName={activeRegion?.name}
        activeSst={activeRegion?.sst ? (Number(activeRegion.sst) || 29.8).toFixed(1) : '29.8'}
      />

      {/* 2. Slide-Over / Docked Intelligence Panel */}
      {isOpen && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`fixed bottom-24 right-4 z-40 flex flex-col rounded-2xl border border-[#00E5FF]/25 hover:border-[#00E5FF]/40 bg-[#07131B]/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out select-none ${
            isExpanded
              ? 'w-[660px] max-w-[96vw] h-[740px] max-h-[88vh]'
              : 'w-[440px] max-w-[95vw] h-[600px] max-h-[82vh]'
          }`}
          style={{
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 25px rgba(0, 229, 255, 0.08), inset 0 1px 0 rgba(0, 229, 255, 0.15)'
          }}
        >
          {/* Header */}
          <CopilotHeader
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onClose={() => {
              setIsOpen(false);
              voice.cancelListening();
              stopSpeaking();
            }}
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

          {/* Bottom Chat Input Form with Shift+Enter and Voice Input Support */}
          <div className="p-3 border-t border-[#00E5FF]/15 bg-[#091824]/95">
            {/* Live Interim Voice Banner */}
            <VoiceLiveBanner
              audioState={voice.audioState}
              interimTranscript={voice.interimTranscript}
              finalTranscript={voice.finalTranscript}
              language={currentLang}
              audioLevel={voice.audioLevel}
              errorMessage={voice.errorMessage}
              onSend={(text) => voice.confirmSend(text)}
              onEdit={(text) => {
                setInputText(text);
                voice.cancelListening();
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              onCancel={() => voice.cancelListening()}
            />

            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    // auto-resize height up to 80px
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={L.ui?.placeholder || "Ask Nerida (e.g. 'Show SST at 100m in Arabian Sea')..."}
                  disabled={isLoading}
                  className="w-full bg-[#051118] text-[#E0E6E8] placeholder-[#5A7582] text-xs px-3.5 py-2.5 rounded-xl border border-[#00E5FF]/25 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 focus:shadow-[0_0_12px_rgba(0,229,255,0.2)] transition-all font-sans resize-none max-h-20"
                  style={{ minHeight: '38px' }}
                />
              </div>

              {/* Multilingual Voice Input Microphone Button */}
              <VoiceInputButton
                audioState={voice.audioState}
                audioLevel={voice.audioLevel}
                language={currentLang}
                disabled={isLoading}
                onStartListening={() => voice.startListening()}
                onStopListening={() => voice.stopListening()}
                onCancelListening={() => voice.cancelListening()}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#1687FF] hover:from-[#33EAFF] hover:to-[#2B95FF] hover:shadow-[0_0_14px_rgba(0,229,255,0.4)] disabled:opacity-35 disabled:cursor-not-allowed text-[#041017] font-bold shadow-md transition-all cursor-pointer shrink-0 mb-0.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-1.5 px-1 text-[9px] text-[#5A7582] font-mono">
              <span className="flex items-center gap-1 text-[#7FA1AA]">
                <Sparkles className="w-2.5 h-2.5 text-[#00E5FF]" />
                Zero-Hallucination Ocean Intelligence
              </span>
              <span>Enter ↵ · Shift+Enter ↵ for newline</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
