/**
 * Ocean Vision 3D - Copilot Client Bridge
 * Coordinates conversation requests, queries /api/copilot,
 * and delegates seamlessly to the dynamic reasoning engine if offline.
 */

import { executeNeridaReasoning } from './offlineEngine.js';

export async function sendCopilotMessage({
  message,
  prompt, // backwards compatibility
  oceanState,
  oceanContext, // backwards compatibility
  conversationHistory = [],
  language = 'en',
  requestId = null
}) {
  const reqId = requestId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substring(2, 10));
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
  state.language = language || state.language || 'en';

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
        language,
        requestId: reqId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && !data.fallback && (data.message || data.response)) {
        return {
          requestId: reqId,
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
  const result = executeNeridaReasoning(query, state, conversationHistory, reqId);
  return result;
}

