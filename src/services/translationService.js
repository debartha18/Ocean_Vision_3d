/**
 * Ocean Vision 3D Dynamic Translation Client
 * Calls /api/translate without exposing keys or credentials to the browser.
 */

const clientCache = new Map();

export async function translateDynamicText(text, targetLang, sourceLang = 'en') {
  if (!text || !targetLang || targetLang === sourceLang) {
    return text;
  }

  const key = `${sourceLang}_${targetLang}_${text}`;
  if (clientCache.has(key)) {
    return clientCache.get(key);
  }

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang, sourceLang })
    });

    if (!res.ok) {
      return text;
    }

    const data = await res.json();
    const result = data.translatedText || text;
    clientCache.set(key, result);
    return result;
  } catch (err) {
    console.warn('Dynamic translation call failed, using source text:', err);
    return text;
  }
}
