/**
 * Ocean Vision 3D - useVoiceInput Hook
 * Manages the 7-stage audio lifecycle state machine, real-time interim speech streaming,
 * audio level simulation/metering, and barge-in coordination.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { WebSpeechProvider } from '../lib/ai/voice/webSpeechProvider.js';
import { AudioState, SpeechErrorCode } from '../lib/ai/voice/speechProvider.js';
import { getVoiceConfigForLanguage, getPhraseHints } from '../lib/ai/voiceLanguages.js';
import { stopSpeaking } from '../lib/ai/voice/ttsProvider.js';

export function useVoiceInput({
  language = 'en',
  onTranscriptReady = null,
  autoSendDelayMs = 0 // 0 means manual stop or prompt review
} = {}) {
  const [audioState, setAudioState] = useState(AudioState.IDLE);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [confidence, setConfidence] = useState(0.95);
  const [errorMessage, setErrorMessage] = useState(null);

  const providerRef = useRef(null);
  const autoSendTimerRef = useRef(null);
  const hasSentRef = useRef(false);
  const currentLanguageRef = useRef(language);

  useEffect(() => {
    currentLanguageRef.current = language;
  }, [language]);

  const isSupported = typeof window !== 'undefined' && WebSpeechProvider.isSupported();
  const isListening = audioState === AudioState.LISTENING || audioState === AudioState.REQUESTING_PERMISSION;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.abort();
      }
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
    };
  }, []);

  const cancelListening = useCallback(() => {
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.abort();
      providerRef.current = null;
    }
    setAudioState(AudioState.IDLE);
    setInterimTranscript('');
    setFinalTranscript('');
    setAudioLevel(0);
    setErrorMessage(null);
    hasSentRef.current = false;
  }, []);

  const stopListening = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.stop();
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser.');
      setAudioState(AudioState.ERROR);
      return;
    }

    // Barge-in: Halt any active TTS synthesis instantly
    stopSpeaking();

    // Reset state
    cancelListening();
    hasSentRef.current = false;
    setErrorMessage(null);
    setInterimTranscript('');
    setFinalTranscript('');

    const voiceConfig = getVoiceConfigForLanguage(currentLanguageRef.current);
    const phraseHints = getPhraseHints(currentLanguageRef.current);

    const provider = new WebSpeechProvider();
    providerRef.current = provider;

    provider.start({
      language: voiceConfig.speechLocale,
      fallbacks: voiceConfig.fallbacks,
      phraseHints: phraseHints,
      onAudioLevel: (level) => {
        setAudioLevel(level);
      },
      onInterim: (text, conf) => {
        setInterimTranscript(text);
        if (conf) setConfidence(conf);
      },
      onFinal: (text, conf) => {
        setFinalTranscript(text);
        if (conf) setConfidence(conf);
        setAudioLevel(0);

        if (text && !hasSentRef.current && onTranscriptReady) {
          if (autoSendDelayMs > 0) {
            autoSendTimerRef.current = setTimeout(() => {
              hasSentRef.current = true;
              onTranscriptReady(text, {
                inputMode: 'voice',
                confidence: conf,
                language: currentLanguageRef.current
              });
              setAudioState(AudioState.IDLE);
            }, autoSendDelayMs);
          }
        }
      },
      onStateChange: (newState) => {
        setAudioState(newState);
        if (newState === AudioState.IDLE) {
          setAudioLevel(0);
        }
      },
      onError: (err) => {
        setAudioLevel(0);
        let userMsg = 'Unable to capture voice audio.';
        if (err.code === SpeechErrorCode.NOT_ALLOWED) {
          userMsg = 'Microphone permission was denied. Please allow microphone access.';
        } else if (err.code === SpeechErrorCode.NO_SPEECH) {
          userMsg = 'No speech detected. Please speak clearly into the microphone.';
        } else if (err.code === SpeechErrorCode.NETWORK) {
          userMsg = 'Network error occurred during speech recognition.';
        }
        setErrorMessage(userMsg);
        setAudioState(AudioState.ERROR);
      }
    });
  }, [isSupported, cancelListening, onTranscriptReady, autoSendDelayMs]);

  const confirmSend = useCallback((customText = null) => {
    const textToSend = (customText || finalTranscript || interimTranscript || '').trim();
    if (!textToSend || hasSentRef.current) return;

    hasSentRef.current = true;
    if (providerRef.current) {
      providerRef.current.abort();
      providerRef.current = null;
    }
    setAudioState(AudioState.IDLE);
    setAudioLevel(0);

    if (onTranscriptReady) {
      onTranscriptReady(textToSend, {
        inputMode: 'voice',
        confidence: confidence,
        language: currentLanguageRef.current
      });
    }

    setInterimTranscript('');
    setFinalTranscript('');
  }, [finalTranscript, interimTranscript, confidence, onTranscriptReady]);

  return {
    audioState,
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    audioLevel,
    confidence,
    errorMessage,
    startListening,
    stopListening,
    cancelListening,
    confirmSend
  };
}
