/**
 * Ocean Vision 3D Official Supported Indian Languages Registry
 * Grounded in Eighth Schedule of the Constitution of India + ISO 639 standard.
 */

export const STORAGE_KEY = 'ocenova-language';
export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', dir: 'ltr' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', dir: 'ltr' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', dir: 'ltr' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', dir: 'ltr' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', dir: 'rtl' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', dir: 'rtl' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', dir: 'ltr' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', dir: 'ltr' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', dir: 'ltr' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', dir: 'ltr' }
];

export const RTL_LANGUAGES = ['ur', 'sd', 'ks'];

export function isRtlLanguage(code) {
  return RTL_LANGUAGES.includes(code);
}

export function getLanguageByCode(code) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[0];
}
