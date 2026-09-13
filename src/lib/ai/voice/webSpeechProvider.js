/**
 * Ocean Vision 3D - Web Speech API Provider Adapter
 * Resilient, zero-dependency client-side Speech-to-Text provider
 * supporting all 23 official Indian languages with interim streaming and fallbacks.
 */

import { SpeechToTextProvider, AudioState, SpeechErrorCode } from './speechProvider.js';

export class WebSpeechProvider extends SpeechToTextProvider {
  constructor() {
    super();
    this.recognition = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.analyser = null;
    this.animFrameId = null;
    this.activeLocaleIndex = 0;
    this.localesToTry = [];
    this.hasFinalResult = false;
    this.finalTranscript = '';
    this.isStopping = false;
    this.options = null;
  }

  static isSupported() {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(options) {
    if (!WebSpeechProvider.isSupported()) {
      if (options.onError) {
        options.onError({
          code: SpeechErrorCode.NOT_SUPPORTED,
          message: 'SpeechRecognition API is not supported in this browser environment.'
        });
      }
      return;
    }

    this.options = options;
    this.hasFinalResult = false;
    this.finalTranscript = '';
    this.isStopping = false;
    this.activeLocaleIndex = 0;

    // Build fallback locale chain
    const primary = options.language || 'en-IN';
    const fallbacks = Array.isArray(options.fallbacks) ? options.fallbacks : [];
    this.localesToTry = [primary, ...fallbacks.filter((l) => l !== primary)];

    this._initAudioAnalysis();
    this._startRecognitionWithLocale(this.localesToTry[0]);
  }

  _startRecognitionWithLocale(locale) {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (_) {}
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.lang = locale;
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;

      // Optional Phrase Hint Grammar
      const SpeechGrammarListClass = window.SpeechGrammarList || window.webkitSpeechGrammarList;
      if (SpeechGrammarListClass && this.options.phraseHints && this.options.phraseHints.length > 0) {
        try {
          const grammarList = new SpeechGrammarListClass();
          const cleanHints = this.options.phraseHints.map((h) => h.replace(/[^a-zA-Z0-9\s]/g, '')).filter(Boolean);
          const grammarString = `#JSGF V1.0; grammar oceanTerms; public <ocean> = ${cleanHints.join(' | ')} ;`;
          grammarList.addFromString(grammarString, 1.0);
          this.recognition.grammars = grammarList;
        } catch (_) {
          // Non-critical: some browsers restrict custom grammar formats
        }
      }

      this.recognition.onstart = () => {
        if (this.options.onStateChange) {
          this.options.onStateChange(AudioState.LISTENING);
        }
      };

      this.recognition.onaudiostart = () => {
        if (this.options.onStateChange) {
          this.options.onStateChange(AudioState.LISTENING);
        }
      };

      this.recognition.onspeechstart = () => {
        if (this.options.onStateChange) {
          this.options.onStateChange(AudioState.LISTENING);
        }
      };

      this.recognition.onresult = (event) => {
        let interimStr = '';
        let latestConfidence = 0.9;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPiece = result[0]?.transcript || '';
          if (result[0]?.confidence) {
            latestConfidence = result[0].confidence;
          }

          if (result.isFinal) {
            this.finalTranscript = (this.finalTranscript + ' ' + transcriptPiece).trim();
            this.hasFinalResult = true;
          } else {
            interimStr += transcriptPiece;
          }
        }

        const combinedText = (this.finalTranscript + ' ' + interimStr).trim();

        if (this.options.onInterim) {
          this.options.onInterim(combinedText || interimStr, latestConfidence);
        }
      };

      this.recognition.onerror = (event) => {
        const errorType = event.error;

        // If recognizer was aborted or stopping, or if errorType is 'aborted', ignore completely!
        if (this.isAborted || this.isStopping || errorType === 'aborted') {
          if (this.options?.onStateChange) {
            this.options.onStateChange(AudioState.IDLE);
          }
          return;
        }

        // If we already captured valid speech, do NOT allow any trailing error to invalidate it
        if (this.finalTranscript && this.finalTranscript.trim()) {
          console.warn(`WebSpeechProvider: Ignoring trailing error '${errorType}' because valid speech was already captured.`);
          if (this.options?.onStateChange) {
            this.options.onStateChange(AudioState.READY_TO_SEND);
          }
          return;
        }

        // Try next fallback locale if language not supported or network error on current
        if ((errorType === 'language-not-supported' || errorType === 'network') && this.activeLocaleIndex < this.localesToTry.length - 1) {
          this.activeLocaleIndex += 1;
          const nextLocale = this.localesToTry[this.activeLocaleIndex];
          console.warn(`WebSpeechProvider: Switching to fallback locale ${nextLocale} due to ${errorType}`);
          this._startRecognitionWithLocale(nextLocale);
          return;
        }

        let mappedCode = SpeechErrorCode.UNKNOWN;
        if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
          mappedCode = SpeechErrorCode.NOT_ALLOWED;
        } else if (errorType === 'no-speech') {
          mappedCode = SpeechErrorCode.NO_SPEECH;
        } else if (errorType === 'audio-capture') {
          mappedCode = SpeechErrorCode.AUDIO_CAPTURE;
        } else if (errorType === 'network') {
          mappedCode = SpeechErrorCode.NETWORK;
        } else if (errorType === 'aborted') {
          mappedCode = SpeechErrorCode.ABORTED;
        }

        const isFatalError = mappedCode !== SpeechErrorCode.NO_SPEECH && mappedCode !== SpeechErrorCode.ABORTED;

        if (this.options?.onStateChange) {
          this.options.onStateChange(isFatalError ? AudioState.ERROR : AudioState.IDLE);
        }

        if (this.options?.onError && isFatalError) {
          this.options.onError({
            code: mappedCode,
            message: event.message || `Speech recognition error: ${errorType}`,
            originalError: event
          });
        }
      };

      this.recognition.onend = () => {
        this._cleanupAudioAnalysis();

        if (this.isAborted) {
          if (this.options?.onStateChange) {
            this.options.onStateChange(AudioState.IDLE);
          }
          return;
        }

        const resultText = this.finalTranscript.trim();
        if (resultText) {
          if (this.options?.onStateChange) {
            this.options.onStateChange(AudioState.READY_TO_SEND);
          }
          if (this.options?.onFinal) {
            this.options.onFinal(resultText, 0.95);
          }
        } else {
          if (this.options?.onStateChange) {
            this.options.onStateChange(AudioState.IDLE);
          }
        }
      };

      if (this.options.onStateChange) {
        this.options.onStateChange(AudioState.REQUESTING_PERMISSION);
      }

      this.recognition.start();
    } catch (err) {
      this._cleanupAudioAnalysis();
      if (this.options.onError) {
        this.options.onError({
          code: SpeechErrorCode.AUDIO_CAPTURE,
          message: err.message,
          originalError: err
        });
      }
      if (this.options.onStateChange) {
        this.options.onStateChange(AudioState.ERROR);
      }
    }
  }

  _initAudioAnalysis() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this._startSimulatedAudioMeter();
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        this.mediaStream = stream;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
          this._startSimulatedAudioMeter();
          return;
        }

        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1, Math.max(0, avg / 128));

          if (this.options?.onAudioLevel) {
            this.options.onAudioLevel(normalized);
          }

          this.animFrameId = requestAnimationFrame(checkVolume);
        };

        this.animFrameId = requestAnimationFrame(checkVolume);
      })
      .catch(() => {
        // Fallback to simulated pulse meter if getUserMedia permission error is handled by speech recognition
        this._startSimulatedAudioMeter();
      });
  }

  _startSimulatedAudioMeter() {
    let phase = 0;
    const tick = () => {
      phase += 0.15;
      const simLevel = 0.3 + 0.35 * Math.sin(phase) + 0.15 * Math.cos(phase * 2.3);
      if (this.options?.onAudioLevel) {
        this.options.onAudioLevel(Math.max(0.1, Math.min(0.9, simLevel)));
      }
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  _cleanupAudioAnalysis() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch (_) {}
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
    this.analyser = null;
  }

  stop() {
    this.isStopping = true;
    if (this.options?.onStateChange) {
      this.options.onStateChange(this.finalTranscript?.trim() ? AudioState.READY_TO_SEND : AudioState.TRANSCRIBING);
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }

  abort() {
    this.isAborted = true;
    this.isStopping = true;
    this._cleanupAudioAnalysis();
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onaudiostart = null;
        this.recognition.onspeechstart = null;
        this.recognition.onspeechend = null;
        this.recognition.onaudioend = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
    if (this.options?.onStateChange) {
      this.options.onStateChange(AudioState.IDLE);
    }
    this.options = null;
  }
}
