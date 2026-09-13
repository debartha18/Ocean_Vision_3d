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
import { extractIntentAndEntities, executeNeridaReasoning } from '../src/lib/ai/offlineEngine.js';
import { resolveLocation } from '../src/lib/ai/oceanTools.js';

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

console.log('\nALL 23-LANGUAGE VOICE TESTS PASSED! 🎉');
