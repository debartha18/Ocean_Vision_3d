/**
 * Ocean Vision 3D - Copilot Client Bridge
 * Coordinates conversation requests, queries /api/copilot,
 * and delegates seamlessly to the dynamic reasoning engine if offline.
 */

import { executeNeridaReasoning } from './offlineEngine';

export async function sendCopilotMessage({
  message,
  prompt, // backwards compatibility
  oceanState,
  oceanContext, // backwards compatibility
  conversationHistory = [],
  language = 'en'
}) {
  const query = message || prompt || '';
  const state = oceanState || (oceanContext ? {
    basin: oceanContext.activeBasin?.name,
    basinId: oceanContext.activeBasin?.id,
    latitude: oceanContext.activeBasin?.latitude,
    longitude: oceanContext.activeBasin?.longitude,
    depth: oceanContext.activeLayer?.depthMeters,
    parameter: oceanContext.activeLayer?.parameter,
    viewMode: oceanContext.activeLayer?.viewMode,
    timestamp: oceanContext.simulationTime
  } : {});

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500);

    const response = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        oceanState: state,
        conversationHistory,
        language
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && !data.fallback && (data.message || data.response)) {
        return {
          message: data.message || data.response,
          actions: data.actions || [],
          toolResults: data.toolResults || [],
          data: data.data || null,
          suggestions: data.suggestions || [],
          provenance: data.provenance || [{ type: 'AI-DERIVED', label: 'Gemini Cloud Intelligence' }],
          dataPointsUsed: data.dataPointsUsed || [],
          source: 'cloud'
        };
      }
    }
  } catch (err) {
    console.info('Copilot client delegating to local dynamic reasoning engine:', err.message);
  }

  // Dynamic local reasoning engine (zero hardcoded responses, real tool execution)
  const result = executeNeridaReasoning(query, state, conversationHistory);
  return result;
}
