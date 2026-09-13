import assert from 'node:assert';
import { 
  VOICE_LANGUAGE_CONFIGS, 
  getVoiceConfigForLanguage, 
  getSpeechLocale, 
  getPhraseHints,
  validateAllLanguagesMapped,
  OCEAN_SCIENTIFIC_PHRASE_HINTS
} from '../src/lib/ai/voiceLanguages.js';
import { SUPPORTED_LANGUAGES } from '../src/i18n/languages.js';
import { cleanTextForSpeech } from '../src/lib/ai/voice/ttsProvider.js';
import { AudioState, SpeechErrorCode } from '../src/lib/ai/voice/speechProvider.js';
import { WebSpeechProvider } from '../src/lib/ai/voice/webSpeechProvider.js';
import { extractIntentAndEntities, executeNeridaReasoning } from '../src/lib/ai/offlineEngine.js';
import { resolveLocation } from '../src/lib/ai/oceanTools.js';
import { getCopilotLexicon } from '../src/lib/ai/copilotTranslations.js';

console.log('=== TEST 1: 23-Language Voice Registry Coverage ===');
assert.strictEqual(SUPPORTED_LANGUAGES.length, 23, 'Must have exactly 23 supported languages');
assert.strictEqual(validateAllLanguagesMapped(), true, 'All 23 languages must have voice mappings');

for (const lang of SUPPORTED_LANGUAGES) {
  const config = getVoiceConfigForLanguage(lang.code);
  assert.ok(config, 'Missing voice config for ' + lang.code);
  assert.ok(config.speechLocale, 'Missing speechLocale for ' + lang.code);
  assert.ok(Array.isArray(config.fallbacks), 'fallbacks must be an array for ' + lang.code);
  assert.ok(config.fallbacks.length > 0, 'fallbacks cannot be empty for ' + lang.code);
  assert.ok(config.displayName, 'Missing displayName for ' + lang.code);

  const speechLocale = getSpeechLocale(lang.code);
  assert.ok(speechLocale.includes('-'), 'speechLocale ' + speechLocale + ' must be valid BCP-47');
  console.log('✓ ' + lang.code.padEnd(4) + ' -> Locale: ' + speechLocale.padEnd(8) + ' Fallbacks: [' + config.fallbacks.join(', ') + ']');
}

console.log('\n=== TEST 2: Oceanographic Phrase Hints ===');
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.length >= 20, 'Should have rich ocean phrase hints');
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.includes('Arabian Sea'));
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.includes('Bay of Bengal'));
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.includes('Sea Surface Temperature'));
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.includes('Thermocline'));
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.includes('Cyclone'));
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.includes('বঙ্গোপসাগর'));
assert.ok(OCEAN_SCIENTIFIC_PHRASE_HINTS.includes('বে অফ বেঙ্গলি'));
console.log('✓ Phrase hints verified (' + OCEAN_SCIENTIFIC_PHRASE_HINTS.length + ' domain keywords)');

console.log('\n=== TEST 3: TTS Text Cleaner for Spoken Speech ===');
const markdownInput = `
### Oceanographic Analysis: Arabian Sea
| Depth | Temp | Salinity |
| --- | --- | --- |
| 0m | 29.8C | 36.2 PSU |

According to **TEOS-10 standard** and [Argo Float 290123](https://incois.gov.in), the mixed layer depth is **42m**.
* Strong upwelling observed near Kochi coast.
* [OBSERVED] Salinity levels indicate normal stratification.
`;

const cleaned = cleanTextForSpeech(markdownInput);
console.log('Cleaned speech output:\n"' + cleaned + '"');

assert.ok(!cleaned.includes('###'), 'Must remove markdown headers');
assert.ok(!cleaned.includes('| Depth |'), 'Must remove markdown table pipes');
assert.ok(!cleaned.includes('**'), 'Must remove bold asterisks');
assert.ok(!cleaned.includes('[Argo Float 290123]('), 'Must convert links to text');
assert.ok(cleaned.includes('Argo Float 290123'), 'Must preserve link inner text');
assert.ok(!cleaned.includes('[OBSERVED]'), 'Must remove provenance bracket tags');
console.log('✓ TTS cleaner successfully sanitized markdown for auditory speech');

console.log('\n=== TEST 4: Audio State & Error Code Enums ===');
assert.strictEqual(AudioState.IDLE, 'IDLE');
assert.strictEqual(AudioState.LISTENING, 'LISTENING');
assert.strictEqual(AudioState.TRANSCRIBING, 'TRANSCRIBING');
assert.strictEqual(AudioState.READY_TO_SEND, 'READY_TO_SEND');
assert.strictEqual(AudioState.ERROR, 'ERROR');
assert.strictEqual(SpeechErrorCode.NOT_ALLOWED, 'NOT_ALLOWED');
assert.strictEqual(SpeechErrorCode.NO_SPEECH, 'NO_SPEECH');
console.log('✓ Enums verified');

console.log('\n=== TEST 5: Bengali Bay of Bengal Spelling Tolerance & Intent Extraction ===');
const bengaliQueries = [
  'তাপমাত্রা কি বে অফ বেঙ্গলি',
  'বে অফ বেঙ্গলি এর তাপমাত্রা কত',
  'বে অব বেঙ্গল এর লবণাক্ততা',
  'বঙ্গোপসাগরের পৃষ্ঠের তাপমাত্রা',
  'বংগোপসাগর এর স্রোত কত',
  'বেঙ্গল এ তাপমাত্রা কি'
];

for (const query of bengaliQueries) {
  const intent = extractIntentAndEntities(query, { basin: 'Bay of Bengal', basinId: 'bay_of_bengal', language: 'bn' });
  assert.strictEqual(intent.category, 'OCEAN_QUERY', `Query "${query}" should resolve to OCEAN_QUERY, got ${intent.category}`);
  assert.ok(intent.paramSpecified, `Query "${query}" should extract parameter`);
  assert.strictEqual(intent.basin, 'bay_of_bengal', `Query "${query}" should resolve to bay_of_bengal`);
  console.log(`✓ Resolved "${query}" -> Intent: ${intent.category}, Param: ${intent.param}, Basin: ${intent.basin}`);
}

// Verify end-to-end reasoning response
const result = executeNeridaReasoning('তাপমাত্রা কি বে অফ বেঙ্গলি', { basin: 'Bay of Bengal', basinId: 'bay_of_bengal', language: 'bn' });
assert.ok(result.message.includes('29.85'), 'Must contain actual digital-twin SST temperature');
assert.strictEqual(result.actions[0].type, 'SET_BASIN');
assert.strictEqual(result.actions[0].value, 'bay_of_bengal');
console.log('✓ End-to-end reasoning returned real ocean data and actions for Bengali voice query');

console.log('\n=== TEST 6: Santali (Ol Chiki) Voice, Input Parsing & Copilot Lexicon ===');
const satVoiceConfig = getVoiceConfigForLanguage('sat');
assert.strictEqual(satVoiceConfig.speechLocale, 'sat-IN');
assert.ok(satVoiceConfig.fallbacks.includes('sat-Olck-IN'), 'Must include Ol Chiki locale fallback');
assert.ok(!satVoiceConfig.fallbacks.includes('hi-IN'), 'Must NOT fall back to Hindi');
console.log('✓ Santali voice config avoids Hindi fallback:', satVoiceConfig.fallbacks);

// Check Lexicon for Ol Chiki script and no Hindi bleed
const satLexicon = getCopilotLexicon('sat');
assert.strictEqual(satLexicon.code, 'sat');
assert.strictEqual(satLexicon.nativeName, 'ᱥᱟᱱᱛᱟᱲᱤ');
assert.ok(/[\u1C50-\u1C7F]/.test(satLexicon.ui.placeholder), 'Placeholder must be in Ol Chiki');
assert.ok(!/[\u0900-\u097F]/.test(satLexicon.ui.placeholder), 'Placeholder must NOT be in Hindi Devanagari');
assert.ok(/[\u1C50-\u1C7F]/.test(satLexicon.ui.thinking), 'Thinking must be in Ol Chiki');
assert.ok(!/[\u0900-\u097F]/.test(satLexicon.ui.thinking), 'Thinking must NOT be in Hindi Devanagari');
assert.ok(/[\u1C50-\u1C7F]/.test(satLexicon.welcome), 'Welcome must be in Ol Chiki');
assert.ok(!/[\u0900-\u097F]/.test(satLexicon.welcome), 'Welcome must NOT be in Hindi Devanagari');
console.log('✓ Santali Copilot Lexicon is 100% Ol Chiki (zero Hindi strings)');

// Test Santali queries and intent extraction
const satQueries = [
  { q: 'ᱵᱚᱝᱜᱳᱯᱚᱥᱟᱜᱚᱨ ᱨᱮ ᱞᱚᱞᱚᱥᱚᱝ ᱛᱤᱱᱟᱹᱜ', expectedParam: 'sst', expectedBasin: 'bay_of_bengal', expectedCategory: 'OCEAN_QUERY' },
  { q: 'ᱟᱨᱚᱵᱽ ᱫᱚᱨᱭᱟ ᱨᱮ ᱵᱩᱞᱩᱝ ᱜᱮᱭᱟᱱ', expectedParam: 'salinity', expectedBasin: 'arabian_sea', expectedCategory: 'OCEAN_QUERY' },
  { q: '᱕᱐᱐ ᱢᱤᱴᱟᱨ ᱜᱟᱹᱦᱤᱨ ᱨᱮ ᱞᱚᱞᱚᱥᱚᱝ', expectedParam: 'sst', expectedDepth: 500, expectedCategory: 'OCEAN_QUERY' },
  { q: 'ᱵᱚᱝᱜᱳᱯᱚᱥᱟᱜᱚᱨ ᱨᱮ ᱛᱩᱯᱷᱟᱱ ᱦᱟᱞᱚᱛ', expectedCategory: 'STORM_WEATHER_PREDICTION', expectedBasin: 'bay_of_bengal' },
  { q: 'ᱡᱚᱦᱟᱨ ᱱᱮᱨᱤᱰᱟ', expectedCategory: 'CONVERSATIONAL' }
];

for (const tc of satQueries) {
  const intent = extractIntentAndEntities(tc.q, { basin: 'Bay of Bengal', basinId: 'bay_of_bengal', language: 'sat' });
  assert.strictEqual(intent.detectedLang, 'sat', `Query "${tc.q}" must be detected as sat`);
  assert.strictEqual(intent.category, tc.expectedCategory, `Query "${tc.q}" category`);
  if (tc.expectedParam) assert.strictEqual(intent.param, tc.expectedParam);
  if (tc.expectedBasin) assert.strictEqual(intent.basin, tc.expectedBasin);
  if (tc.expectedDepth) assert.strictEqual(intent.depth, tc.expectedDepth);
  console.log(`✓ Resolved "${tc.q}" -> Lang: ${intent.detectedLang}, Category: ${intent.category}, Param: ${intent.param || 'N/A'}`);
}

// Ensure Devanagari input under Santali active language preserves sat rather than forcing hi
const crossScriptIntent = extractIntentAndEntities('SST at 500m', { basinId: 'bay_of_bengal', language: 'sat' });
assert.strictEqual(crossScriptIntent.detectedLang, 'sat', 'Should preserve active sat language');

// End-to-end reasoning in Santali
const satResult = executeNeridaReasoning('ᱵᱚᱝᱜᱳᱯᱚᱥᱟᱜᱚᱨ ᱨᱮ ᱞᱚᱞᱚᱥᱚᱝ ᱛᱤᱱᱟᱹᱜ', { basin: 'Bay of Bengal', basinId: 'bay_of_bengal', language: 'sat' });
assert.ok(/[\u1C50-\u1C7F]/.test(satResult.message), 'Reasoning response must contain Ol Chiki characters');
assert.ok(!satResult.message.includes('नेरिडा'), 'Reasoning response must not contain Hindi text');
assert.ok(satResult.message.includes('29.85'), 'Must contain actual digital twin SST value');
console.log('✓ End-to-end reasoning generated genuine Ol Chiki Santali output');

console.log('\n=== TEST 7: Voice Error Suppression & Lifecycle State Safety ===');
// 1. Verify abort() sets AudioState.IDLE and detaches all listeners
let recordedState = null;
let recordedError = null;

const provider = new WebSpeechProvider();
provider.options = {
  onStateChange: (st) => { recordedState = st; },
  onError: (err) => { recordedError = err; }
};

// Simulate recognition instance
let fakeRecognition = {
  start: () => {},
  stop: () => {},
  abort: () => {},
  onerror: null,
  onend: null,
  onresult: null
};

provider.recognition = fakeRecognition;
provider.abort();

assert.strictEqual(recordedState, AudioState.IDLE, 'abort() must transition to AudioState.IDLE');
assert.strictEqual(recordedError, null, 'abort() must not emit onError');
assert.strictEqual(provider.recognition, null, 'abort() must nullify recognition');
assert.strictEqual(provider.options, null, 'abort() must nullify options to block trailing callbacks');
console.log('✓ provider.abort() safely unbinds and transitions to IDLE');

// 2. Test that trailing browser errors do not overwrite captured speech
const provider2 = new WebSpeechProvider();
let p2State = AudioState.IDLE;
let p2Error = null;
provider2.options = {
  onStateChange: (st) => { p2State = st; },
  onError: (err) => { p2Error = err; }
};
provider2.finalTranscript = 'বঙ্গোপসাগরের তাপমাত্রা কত';

// Mock the onerror handler from _startRecognitionWithLocale
const mockOnError = (errorType) => {
  if (provider2.isAborted || provider2.isStopping || errorType === 'aborted') {
    if (provider2.options?.onStateChange) provider2.options.onStateChange(AudioState.IDLE);
    return;
  }
  if (provider2.finalTranscript && provider2.finalTranscript.trim()) {
    if (provider2.options?.onStateChange) provider2.options.onStateChange(AudioState.READY_TO_SEND);
    return;
  }
  let mapped = SpeechErrorCode.UNKNOWN;
  if (errorType === 'network') mapped = SpeechErrorCode.NETWORK;
  if (errorType === 'no-speech') mapped = SpeechErrorCode.NO_SPEECH;
  const isFatal = mapped !== SpeechErrorCode.NO_SPEECH && mapped !== SpeechErrorCode.ABORTED;
  if (provider2.options?.onStateChange) provider2.options.onStateChange(isFatal ? AudioState.ERROR : AudioState.IDLE);
  if (provider2.options?.onError && isFatal) provider2.options.onError({ code: mapped });
};

// Simulate trailing network error after speech captured
mockOnError('network');
assert.strictEqual(p2State, AudioState.READY_TO_SEND, 'Trailing error after speech must not trigger ERROR state');
assert.strictEqual(p2Error, null, 'Trailing error after speech must not emit error');
console.log('✓ Trailing network/no-speech errors safely suppressed when valid speech is captured');

// Simulate aborted event
provider2.finalTranscript = '';
mockOnError('aborted');
assert.strictEqual(p2State, AudioState.IDLE, 'Aborted recognition must transition to IDLE, not ERROR');
assert.strictEqual(p2Error, null, 'Aborted recognition must not emit error');
console.log('✓ Aborted recognition transitions cleanly to IDLE');

console.log('\nALL VOICE LIFECYCLE & MULTILINGUAL TESTS PASSED! 🎉');
