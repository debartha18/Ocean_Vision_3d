import React from 'react';
import { Mic, Send, Edit3, X, Radio, AlertCircle } from 'lucide-react';
import { AudioState } from '../../lib/ai/voice/speechProvider.js';
import { getVoiceConfigForLanguage } from '../../lib/ai/voiceLanguages.js';

export default function VoiceLiveBanner({
  audioState,
  interimTranscript,
  finalTranscript,
  language = 'en',
  audioLevel = 0,
  errorMessage = null,
  onSend,
  onEdit,
  onCancel
}) {
  const isListening = audioState === AudioState.LISTENING || audioState === AudioState.REQUESTING_PERMISSION;
  const isTranscribing = audioState === AudioState.TRANSCRIBING;
  const isError = audioState === AudioState.ERROR;

  const currentText = (finalTranscript || interimTranscript || '').trim();
  const voiceConfig = getVoiceConfigForLanguage(language);
  const langDisplay = voiceConfig.displayName || language.toUpperCase();

  if (audioState === AudioState.IDLE) {
    return null;
  }

  if (!isListening && !isTranscribing && !isError && !currentText) {
    return null;
  }

  return (
    <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-[#051622]/95 via-[#092233]/95 to-[#07131B]/95 border border-[#00E5FF]/30 shadow-[0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#00E5FF]/15">
        <div className="flex items-center gap-1.5">
          {isError ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 font-bold">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              Voice Input Error
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#00E5FF] font-semibold">
              <span className="relative flex h-2 w-2">
                {isListening && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]"></span>
              </span>
              <Radio className="w-3 h-3 text-[#00E5FF]" />
              <span>{isListening ? 'Listening...' : isTranscribing ? 'Transcribing...' : 'Voice Ready'}</span>
            </span>
          )}

          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
            {langDisplay} ({voiceConfig.speechLocale})
          </span>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-[#7FA1AA] hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
          title="Cancel voice input"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="py-2 px-1 min-h-[32px] flex items-center">
        {isError ? (
          <p className="text-xs text-rose-300 italic">{errorMessage || 'Unable to process voice audio.'}</p>
        ) : currentText ? (
          <p className="text-xs text-[#E0E6E8] font-sans leading-relaxed tracking-wide">
            "{currentText}"
            {isListening && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#00E5FF] animate-pulse align-middle" />
            )}
          </p>
        ) : (
          <p className="text-xs text-[#5A7582] italic font-sans flex items-center gap-1.5">
            <Mic className="w-3 h-3 text-[#00E5FF] animate-pulse" />
            Speak now in {langDisplay} (e.g. "Arabian Sea surface temperature kya hai?")...
          </p>
        )}
      </div>

      {currentText && !isError && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#00E5FF]/10 text-[10px]">
          <button
            type="button"
            onClick={() => onEdit(currentText)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#142D3A] hover:bg-[#1C3E50] text-[#7FA1AA] hover:text-[#CCD0CF] transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            Edit text
          </button>

          <button
            type="button"
            onClick={() => onSend(currentText)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#1687FF] hover:from-[#33EAFF] hover:to-[#2B95FF] text-[#041017] font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-3 h-3" />
            Send to Nerida
          </button>
        </div>
      )}
    </div>
  );
}
