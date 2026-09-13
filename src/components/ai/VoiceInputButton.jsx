import React from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { AudioState } from '../../lib/ai/voice/speechProvider.js';
import { getVoiceConfigForLanguage } from '../../lib/ai/voiceLanguages.js';

export default function VoiceInputButton({
  audioState = AudioState.IDLE,
  audioLevel = 0,
  language = 'en',
  disabled = false,
  onStartListening,
  onStopListening,
  onCancelListening
}) {
  const isListening = audioState === AudioState.LISTENING || audioState === AudioState.REQUESTING_PERMISSION;
  const isTranscribing = audioState === AudioState.TRANSCRIBING;
  const isError = audioState === AudioState.ERROR;

  const voiceConfig = getVoiceConfigForLanguage(language);
  const langLabel = voiceConfig.displayName || language.toUpperCase();

  const handleClick = () => {
    if (disabled) return;
    if (isListening) {
      onStopListening();
    } else if (isError) {
      onCancelListening();
      onStartListening();
    } else {
      onStartListening();
    }
  };

  // Dynamic bar height based on normalized audioLevel
  const bar1Height = Math.max(4, Math.round(14 * (0.3 + audioLevel * 0.7)));
  const bar2Height = Math.max(6, Math.round(20 * (0.4 + audioLevel * 0.6)));
  const bar3Height = Math.max(5, Math.round(16 * (0.2 + audioLevel * 0.8)));
  const bar4Height = Math.max(3, Math.round(12 * (0.5 + audioLevel * 0.5)));

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={
          isListening
            ? `Listening in ${langLabel}... (Click to complete)`
            : isTranscribing
            ? 'Transcribing speech...'
            : isError
            ? 'Voice input error (Click to retry)'
            : `Voice input in ${langLabel}`
        }
        className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 mb-0.5 relative ${
          isListening
            ? 'bg-gradient-to-r from-[#00E5FF]/30 to-[#8B5CF6]/30 border border-[#00E5FF] text-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.45)] ring-1 ring-[#00E5FF]/60'
            : isTranscribing
            ? 'bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] animate-pulse'
            : isError
            ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
            : 'bg-[#061822] hover:bg-[#0A2230] border border-[#00E5FF]/30 hover:border-[#00E5FF]/60 text-[#7FA1AA] hover:text-[#00E5FF] shadow-sm'
        } disabled:opacity-35 disabled:cursor-not-allowed`}
      >
        {isListening ? (
          // Animated Audio Waveform Bars
          <div className="flex items-center gap-0.5 h-4 px-0.5">
            <span
              className="w-1 bg-[#00E5FF] rounded-full transition-all duration-75"
              style={{ height: `${bar1Height}px` }}
            />
            <span
              className="w-1 bg-[#38BDF8] rounded-full transition-all duration-75"
              style={{ height: `${bar2Height}px` }}
            />
            <span
              className="w-1 bg-[#8B5CF6] rounded-full transition-all duration-75"
              style={{ height: `${bar3Height}px` }}
            />
            <span
              className="w-1 bg-[#00E5FF] rounded-full transition-all duration-75"
              style={{ height: `${bar4Height}px` }}
            />
          </div>
        ) : isTranscribing ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-rose-400" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating active pulse ring during listening */}
      {isListening && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]"></span>
        </span>
      )}
    </div>
  );
}
