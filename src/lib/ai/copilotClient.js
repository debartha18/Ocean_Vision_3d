/**
 * Ocean Vision 3D - Copilot Client Bridge
 * Manages conversation exchanges, communicates with /api/copilot,
 * and falls back immediately to offlineEngine if offline or unconfigured.
 */

import { processOfflineCopilotQuery } from './offlineEngine';

export async function sendCopilotMessage({
  prompt,
  conversationHistory = [],
  oceanContext = {},
  language = 'en'
}) {
  try {
    // Attempt upstream serverless API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second safety timeout

    const response = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        conversationHistory,
        oceanContext,
        language
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && !data.fallback && data.response) {
        return {
          response: data.response,
          toolCalls: data.toolCalls || [],
          provenance: data.provenance || [{ type: 'AI-DERIVED', label: 'Cloud Ocean Intelligence' }],
          dataPointsUsed: data.dataPointsUsed || [],
          source: 'cloud'
        };
      }
    }
  } catch (err) {
    console.info('Copilot client switching to local offline oceanographic engine:', err.message);
  }

  // Resilient fallback to offline domain intelligence engine
  const offlineResult = processOfflineCopilotQuery(prompt, oceanContext);
  return {
    ...offlineResult,
    source: 'offline'
  };
}
