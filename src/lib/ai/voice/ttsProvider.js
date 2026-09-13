/**
 * Ocean Vision 3D - Text-To-Speech (TTS) Engine with Barge-In Support
 * Provides natural auditory playback of Nerida responses across all 23 languages.
 */

import { getVoiceConfigForLanguage } from '../voiceLanguages.js';

let activeUtterance = null;
let isCurrentlySpeaking = false;

/**
 * Strips markdown, emojis, HTML, citations, and data tables to produce
 * smooth, natural, conversational spoken sentences.
 * @param {string} text 
 * @returns {string}
 */
export function cleanTextForSpeech(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^\`]+)`/g, '$1');

  // 2. Remove markdown tables
  cleaned = cleaned.replace(/\|.*?\|/g, ' ');
  cleaned = cleaned.replace(/[-:]{3,}/g, ' ');

  // 3. Remove markdown images & links: ![alt](url) -> '' and [text](url) -> text
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 4. Remove data badges: [OBSERVED], [AI-DERIVED], etc.
  cleaned = cleaned.replace(/\[(OBSERVED|FORECAST|SIMULATED|AI-DERIVED)[^\]]*\]/gi, '');

  // 5. Remove headers, horizontal rules, blockquotes, bullets
  cleaned = cleaned.replace(/^[#]{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/^>\s+/gm, '');
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  cleaned = cleaned.replace(/[-*_]{3,}/g, '');

  // 6. Remove bold / italics
  cleaned = cleaned.replace(/[*_]{1,3}(.*?)[*_]{1,3}/g, '$1');

  // 7. Remove common emojis and scientific symbol icons
  cleaned = cleaned.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');

  // 8. Collapse whitespace and truncate extreme lengths for spoken clarity
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // If text is overly long, speak the first 2-3 essential sentences
  if (cleaned.length > 350) {
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      cleaned = sentences.slice(0, 3).join(' ');
    } else {
      cleaned = cleaned.slice(0, 350) + '...';
    }
  }

  return cleaned;
}

/**
 * Checks if SpeechSynthesis is supported in the current browser.
 * @returns {boolean}
 */
export function isTtsSupported() {
  return typeof window !== 'undefined' && Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
}

/**
 * Halts any ongoing text-to-speech audio playback immediately (Barge-In).
 */
export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
  } catch (_) {}

  activeUtterance = null;
  isCurrentlySpeaking = false;
}

/**
 * Returns whether TTS is currently playing audio.
 * @returns {boolean}
 */
export function isSpeaking() {
  return isCurrentlySpeaking;
}

/**
 * Speaks the given text using the appropriate voice and locale for the language.
 * Automatically interrupts any ongoing speech.
 * @param {string} text - Message or response to speak
 * @param {string} langCode - Language code (e.g. 'hi', 'bn', 'en', 'ta')
 * @param {object} [callbacks]
 * @param {function(): void} [callbacks.onStart]
 * @param {function(): void} [callbacks.onEnd]
 * @param {function(Error): void} [callbacks.onError]
 */
export function speakResponse(text, langCode = 'en', callbacks = {}) {
  if (!isTtsSupported()) {
    if (callbacks.onError) callbacks.onError(new Error('TTS not supported'));
    return;
  }

  // Instant barge-in: cancel any previous utterance
  stopSpeaking();

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText) return;

  const voiceConfig = getVoiceConfigForLanguage(langCode);
  const targetLocale = voiceConfig.ttsLocale || voiceConfig.speechLocale || 'en-IN';

  const utterance = new window.SpeechSynthesisUtterance(spokenText);
  utterance.lang = targetLocale;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Attempt to select the best matching voice
  const availableVoices = window.speechSynthesis.getVoices();
  if (availableVoices && availableVoices.length > 0) {
    // 1. Exact locale match
    const exactVoice = availableVoices.find((v) => v.lang === targetLocale || v.lang.replace('_', '-') === targetLocale);
    // 2. Language prefix match (e.g. 'hi' or 'bn')
    const prefix = targetLocale.split('-')[0];
    const prefixVoice = availableVoices.find((v) => v.lang.startsWith(prefix));

    if (exactVoice) {
      utterance.voice = exactVoice;
    } else if (prefixVoice) {
      utterance.voice = prefixVoice;
    }
  }

  utterance.onstart = () => {
    isCurrentlySpeaking = true;
    if (callbacks.onStart) callbacks.onStart();
  };

  utterance.onend = () => {
    isCurrentlySpeaking = false;
    activeUtterance = null;
    if (callbacks.onEnd) callbacks.onEnd();
  };

  utterance.onerror = (err) => {
    isCurrentlySpeaking = false;
    activeUtterance = null;
    if (callbacks.onError) callbacks.onError(err);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
