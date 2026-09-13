/**
 * Ocean Vision 3D - Voice Language Registry
 * Grounded in Eighth Schedule of the Constitution of India + ISO 639 standard.
 * Derives directly from src/i18n/languages.js and assigns BCP-47 speech recognition
 * and synthesis locales with resilient fallback chains.
 */

import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../../i18n/languages.js';

/**
 * Universal oceanographic scientific terms for speech recognizer bias and phonetic boosting.
 * Helps recognition engines identify complex marine and geospatial terminology accurately.
 */
export const OCEAN_SCIENTIFIC_PHRASE_HINTS = [
  // Basins & Geographic entities
  'Arabian Sea',
  'Bay of Bengal',
  'Indian Ocean',
  'Andaman Sea',
  'Lakshadweep Sea',
  'Equatorial Indian Ocean',
  'Mumbai Coast',
  'Chennai Coast',
  'Kochi Coast',
  'Visakhapatnam',
  'Goa Coast',
  'Kolkata Coast',
  'Mangalore Coast',
  'Kanyakumari',
  'Palk Strait',
  'Gulf of Mannar',
  'Gulf of Kutch',
  'Gulf of Khambhat',

  // Regional Language Basin Names & Transliterations
  'বঙ্গোপসাগর',
  'বে অফ বেঙ্গল',
  'বে অফ বেঙ্গলি',
  'আরব সাগর',
  'ভারত মহাসাগর',
  'তাপমাত্রা',
  'লবণাক্ততা',
  'স্রোত',
  'बंगाल की खाड़ी',
  'बे ऑफ बंगाल',
  'अरब सागर',
  'तापमान',
  'வங்காள விரிகுடா',
  'அரபிக் கடல்',
  'బంగాళాఖాతం',
  'ಅರಬ್ಬಿ ಸಮುದ್ರ',
  'ബംഗാൾ ഉൾക്കടൽ',
  'બંગાળની ખાડી',
  'ବଙ୍ଗୋପସାଗର',
  'ਖਲੀਜ ਬੰਗਾਲ',
  'خلیج بنگال',
  'ᱥᱟᱱᱛᱟᱲᱤ',
  'ᱵᱚᱝᱜᱳᱯᱚᱥᱟᱜᱚᱨ',
  'ᱟᱨᱚᱵᱽ ᱫᱚᱨᱭᱟ',
  'ᱥᱤᱧᱚᱛ ᱢᱟᱦᱟᱫᱚᱨᱭᱟ',
  'ᱞᱚᱞᱚᱥᱚᱝ',
  'ᱵᱩᱞᱩᱝ ᱜᱮᱭᱟᱱ',
  'ᱫᱚᱨᱭᱟ ᱫᱟᱜ ᱞᱤᱸᱜᱤᱱ',
  'ᱰᱷᱮᱣ ᱩᱥᱩᱞ',
  'ᱦᱚᱭ ᱢᱮᱥᱟ ᱚᱠᱥᱤᱡᱮᱱ',
  'ᱠᱞᱳᱨᱳᱯᱷᱤᱞ-ᱮ',
  'ᱛᱩᱯᱷᱟᱱ',

  // Parameters & Measurements
  'Sea Surface Temperature',
  'SST',
  'Salinity',
  'Ocean Depth',
  'Bathymetry',
  'Currents',
  'Current Vectors',
  'Chlorophyll',
  'Dissolved Oxygen',
  'Wave Height',
  'Thermocline',
  'Mixed Layer Depth',
  'MLD',
  'Upwelling',
  'Downwelling',
  'Stratification',
  'Pycnocline',
  'Halocline',
  'TEOS-10',
  'Argo Float',

  // Ocean Phenomena & Climatology
  'Cyclone',
  'Marine Heatwave',
  'MHW',
  'Oxygen Minimum Zone',
  'OMZ',
  'El Niño',
  'La Niña',
  'ENSO',
  'Indian Ocean Dipole',
  'IOD',
  'Monsoon',
  'Cyclogenesis',
  'Wind Stress',
  'Eddy',
  'Mesoscale Eddy',
  'Chlorophyll Bloom',
  'Phytoplankton',
  'Coral Bleaching'
];

/**
 * Voice registry mapping each of the 23 supported languages to BCP-47 locales,
 * fallback speech locales, and language-specific phonetic keywords.
 */
export const VOICE_LANGUAGE_CONFIGS = {
  en: {
    speechLocale: 'en-IN',
    fallbacks: ['en-US', 'en-GB'],
    ttsLocale: 'en-IN',
    displayName: 'English (India)',
    code: 'en'
  },
  hi: {
    speechLocale: 'hi-IN',
    fallbacks: ['en-IN'],
    ttsLocale: 'hi-IN',
    displayName: 'हिन्दी (Hindi)',
    code: 'hi'
  },
  bn: {
    speechLocale: 'bn-IN',
    fallbacks: ['bn-BD', 'hi-IN', 'en-IN'],
    ttsLocale: 'bn-IN',
    displayName: 'বাংলা (Bengali)',
    code: 'bn'
  },
  as: {
    speechLocale: 'as-IN',
    fallbacks: ['bn-IN', 'hi-IN', 'en-IN'],
    ttsLocale: 'as-IN',
    displayName: 'অসমীয়া (Assamese)',
    code: 'as'
  },
  gu: {
    speechLocale: 'gu-IN',
    fallbacks: ['hi-IN', 'en-IN'],
    ttsLocale: 'gu-IN',
    displayName: 'ગુજરાતી (Gujarati)',
    code: 'gu'
  },
  mr: {
    speechLocale: 'mr-IN',
    fallbacks: ['hi-IN', 'en-IN'],
    ttsLocale: 'mr-IN',
    displayName: 'मराठी (Marathi)',
    code: 'mr'
  },
  ta: {
    speechLocale: 'ta-IN',
    fallbacks: ['ta-LK', 'ta-SG', 'en-IN'],
    ttsLocale: 'ta-IN',
    displayName: 'தமிழ் (Tamil)',
    code: 'ta'
  },
  te: {
    speechLocale: 'te-IN',
    fallbacks: ['en-IN'],
    ttsLocale: 'te-IN',
    displayName: 'తెలుగు (Telugu)',
    code: 'te'
  },
  kn: {
    speechLocale: 'kn-IN',
    fallbacks: ['en-IN'],
    ttsLocale: 'kn-IN',
    displayName: 'ಕನ್ನಡ (Kannada)',
    code: 'kn'
  },
  ml: {
    speechLocale: 'ml-IN',
    fallbacks: ['en-IN'],
    ttsLocale: 'ml-IN',
    displayName: 'മലയാളം (Malayalam)',
    code: 'ml'
  },
  or: {
    speechLocale: 'or-IN',
    fallbacks: ['bn-IN', 'hi-IN', 'en-IN'],
    ttsLocale: 'or-IN',
    displayName: 'ଓଡ଼ିଆ (Odia)',
    code: 'or'
  },
  pa: {
    speechLocale: 'pa-IN',
    fallbacks: ['hi-IN', 'en-IN'],
    ttsLocale: 'pa-IN',
    displayName: 'ਪੰਜਾਬੀ (Punjabi)',
    code: 'pa'
  },
  ur: {
    speechLocale: 'ur-IN',
    fallbacks: ['ur-PK', 'hi-IN', 'en-IN'],
    ttsLocale: 'ur-IN',
    displayName: 'اردو (Urdu)',
    code: 'ur'
  },
  sa: {
    speechLocale: 'sa-IN',
    fallbacks: ['hi-IN', 'en-IN'],
    ttsLocale: 'sa-IN',
    displayName: 'संस्कृतम् (Sanskrit)',
    code: 'sa'
  },
  kok: {
    speechLocale: 'kok-IN',
    fallbacks: ['mr-IN', 'hi-IN', 'en-IN'],
    ttsLocale: 'kok-IN',
    displayName: 'कोंकणी (Konkani)',
    code: 'kok'
  },
  mai: {
    speechLocale: 'mai-IN',
    fallbacks: ['hi-IN', 'en-IN'],
    ttsLocale: 'mai-IN',
    displayName: 'मैथिली (Maithili)',
    code: 'mai'
  },
  ne: {
    speechLocale: 'ne-NP',
    fallbacks: ['ne-IN', 'hi-IN', 'en-IN'],
    ttsLocale: 'ne-NP',
    displayName: 'नेपाली (Nepali)',
    code: 'ne'
  },
  sd: {
    speechLocale: 'sd-IN',
    fallbacks: ['ur-IN', 'hi-IN', 'en-IN'],
    ttsLocale: 'sd-IN',
    displayName: 'سنڌي (Sindhi)',
    code: 'sd'
  },
  ks: {
    speechLocale: 'ks-IN',
    fallbacks: ['ur-IN', 'hi-IN', 'en-IN'],
    ttsLocale: 'ks-IN',
    displayName: 'کٲشُر (Kashmiri)',
    code: 'ks'
  },
  mni: {
    speechLocale: 'mni-IN',
    fallbacks: ['bn-IN', 'en-IN'],
    ttsLocale: 'mni-IN',
    displayName: 'মৈতৈলোন্ (Manipuri)',
    code: 'mni'
  },
  sat: {
    speechLocale: 'sat-IN',
    fallbacks: ['sat-Olck-IN', 'en-IN'],
    ttsLocale: 'sat-IN',
    displayName: 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)',
    code: 'sat'
  },
  brx: {
    speechLocale: 'brx-IN',
    fallbacks: ['as-IN', 'hi-IN', 'en-IN'],
    ttsLocale: 'brx-IN',
    displayName: 'बड़ो (Bodo)',
    code: 'brx'
  },
  doi: {
    speechLocale: 'doi-IN',
    fallbacks: ['hi-IN', 'pa-IN', 'en-IN'],
    ttsLocale: 'doi-IN',
    displayName: 'डोगरी (Dogri)',
    code: 'doi'
  }
};

/**
 * Returns voice configuration for a language code, falling back to English if unspecified.
 * @param {string} langCode 
 * @returns {object}
 */
export function getVoiceConfigForLanguage(langCode) {
  const code = (langCode || 'en').toLowerCase().trim();
  const config = VOICE_LANGUAGE_CONFIGS[code];
  if (config) return config;

  // Derive fallback based on SUPPORTED_LANGUAGES registry
  const lang = getLanguageByCode(code);
  return {
    speechLocale: `${lang.code}-IN`,
    fallbacks: ['en-IN', 'en-US'],
    ttsLocale: `${lang.code}-IN`,
    displayName: lang.nativeName || lang.name,
    code: lang.code
  };
}

/**
 * Returns the primary BCP-47 speech recognition locale string for a given language code.
 * @param {string} langCode 
 * @returns {string} e.g. 'hi-IN', 'bn-IN', 'ta-IN'
 */
export function getSpeechLocale(langCode) {
  return getVoiceConfigForLanguage(langCode).speechLocale;
}

/**
 * Returns an array of phrase hints customized for speech recognition bias.
 * @param {string} langCode 
 * @returns {string[]}
 */
export function getPhraseHints(langCode) {
  return [...OCEAN_SCIENTIFIC_PHRASE_HINTS];
}

/**
 * Validates that all 23 supported languages have a designated voice mapping.
 * @returns {boolean}
 */
export function validateAllLanguagesMapped() {
  return SUPPORTED_LANGUAGES.every((lang) => Boolean(VOICE_LANGUAGE_CONFIGS[lang.code]));
}
