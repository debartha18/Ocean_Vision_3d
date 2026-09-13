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

console.log('\nALL 23-LANGUAGE VOICE TESTS PASSED! 🎉');
