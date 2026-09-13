/**
 * Ocean Vision 3D - Speech Provider Abstraction
 * Defines the unified Speech-To-Text Provider interface and lifecycle states.
 */

export const AudioState = Object.freeze({
  IDLE: 'IDLE',
  REQUESTING_PERMISSION: 'REQUESTING_PERMISSION',
  LISTENING: 'LISTENING',
  TRANSCRIBING: 'TRANSCRIBING',
  READY_TO_SEND: 'READY_TO_SEND',
  PROCESSING: 'PROCESSING',
  RESPONDING: 'RESPONDING',
  ERROR: 'ERROR'
});

export const SpeechErrorCode = Object.freeze({
  NOT_ALLOWED: 'NOT_ALLOWED',
  NO_SPEECH: 'NO_SPEECH',
  AUDIO_CAPTURE: 'AUDIO_CAPTURE',
  NETWORK: 'NETWORK',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  ABORTED: 'ABORTED',
  UNKNOWN: 'UNKNOWN'
});

/**
 * Base abstract interface for Speech-to-Text Providers.
 */
export class SpeechToTextProvider {
  /**
   * Check if this speech provider is supported in the current environment.
   * @returns {boolean}
   */
  static isSupported() {
    return false;
  }

  /**
   * Starts speech capture and recognition.
   * @param {object} options
   * @param {string} options.language - BCP-47 locale code (e.g. 'hi-IN', 'ta-IN', 'en-IN')
   * @param {string[]} [options.fallbacks] - Fallback locales if primary is not installed
   * @param {string[]} [options.phraseHints] - Domain keywords for recognition biasing
   * @param {function(string, number): void} options.onInterim - Interim transcript callback (text, confidence)
   * @param {function(string, number): void} options.onFinal - Final recognized transcript callback (text, confidence)
   * @param {function(object): void} options.onError - Error callback ({ code, message, originalError })
   * @param {function(string): void} options.onStateChange - State change callback
   * @param {function(number): void} [options.onAudioLevel] - Normalized volume level (0.0 to 1.0)
   */
  start(options) {
    throw new Error('start() must be implemented by concrete SpeechToTextProvider');
  }

  /**
   * Gracefully stops recording and requests final transcript transcription.
   */
  stop() {
    throw new Error('stop() must be implemented by concrete SpeechToTextProvider');
  }

  /**
   * Immediately aborts and discards audio recording.
   */
  abort() {
    throw new Error('abort() must be implemented by concrete SpeechToTextProvider');
  }
}
