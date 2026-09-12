/**
 * Ocean Vision 3D - AI Ocean Copilot Serverless Endpoint
 * Vercel Serverless Function (Node.js runtime).
 * Securely communicates with upstream AI providers (Gemini / OpenAI) without exposing keys to client bundle.
 */

const SYSTEM_INSTRUCTION = `You are the AI Ocean Copilot for Ocean Vision 3D (a scientific 3D digital-twin platform).
Your role: Senior Oceanographer, Digital-Twin Modeling Specialist, and Maritime Safety Advisor.
Scientific standard: Follow the "OBSERVE → UNDERSTAND → PREDICT → SIMULATE → ACT" protocol and UNESCO TEOS-10 oceanographic principles.

Core Directives:
1. Ground every statement in the provided live telemetry (Active Region, Lat/Lon, Depth, SST, Salinity, Currents, Wave Height, Chlorophyll, Dissolved Oxygen, Storm Category, Pressure, Wind Speed).
2. Distinguish clearly between:
   - OBSERVED (Direct in-situ sensors: RAMA, OMNI buoys, Argo floats, glider profiles)
   - FORECAST (Meteorological and wave forecasts: GFS, ECMWF, IMD)
   - SIMULATED (Calculated 3D digital-twin physics, hydrostatic pressure, vertical profiles)
   - AI-DERIVED (Machine learning anomaly detection, thermal hazard predictions)
3. Zero Hallucination: If asked about a parameter or region not in the context or unmeasured, explicitly say: "I do not have validated observational data for this parameter at these coordinates."
4. Action / Safe UI Controls: When the user's intent suggests changing views, layers, depth, or basin, specify safe tool calls in the JSON output.

Available Tools:
- setOceanParameter: { param: "sst" | "salinity" | "currents" | "wave" | "chlorophyll" | "oxygen" }
- setDepth: { depth: number } (0 to 2000 meters)
- changeBasin: { regionId: "bay_of_bengal" | "arabian_sea" | "south_china_sea" | "gulf_of_mexico" | "north_atlantic" | "equatorial_pacific" }
- setVisualizationMode: { mode: "depth_slice" | "iso_surface" | "vector_field" | "volume_render" }
- setStormLayer: { active: boolean }
- openModal: { modalName: "alerts" | "fleet" | "location" | "datePicker" | "stormNews" | "analyticReport" | "depthPressure" | "colorbarSettings" | "netcdfIngestion" }

Respond strictly in valid JSON format matching this schema:
{
  "response": "Detailed, markdown-formatted oceanographic explanation with clear scientific insights and actionable guidance.",
  "toolCalls": [
    { "tool": "toolName", "params": { ... } }
  ],
  "provenance": [
    { "type": "OBSERVED" | "FORECAST" | "SIMULATED" | "AI-DERIVED", "label": "Short source label e.g. RAMA Buoy BD08" }
  ],
  "dataPointsUsed": ["Active SST: 29.85°C", "Depth: 50m", "Storm Category: Tropical Depression"]
}`;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { prompt, conversationHistory = [], oceanContext = {}, language = 'en' } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.GOOGLE_API_KEY;

    // Graceful offline fallback trigger if API key is not configured in environment
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        notice: 'No AI API key configured in serverless environment. Delegate to client offline engine.'
      });
    }

    // Format prompt with context and language
    const contextPrompt = `
CURRENT OCEAN DIGITAL TWIN TELEMETRY:
${JSON.stringify(oceanContext, null, 2)}

User Language Preference: ${language} (Ensure response is in this language if requested or standard English with technical clarity).

CONVERSATION HISTORY:
${conversationHistory.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER QUESTION / COMMAND:
${prompt}
`;

    // Call Google Gemini API (gemini-1.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const upstreamResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${contextPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      console.warn('Gemini API returned error:', upstreamResponse.status, errText);
      return res.status(200).json({
        fallback: true,
        notice: `Upstream AI provider error (${upstreamResponse.status}). Falling back to local oceanographic intelligence.`
      });
    }

    const data = await upstreamResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(200).json({ fallback: true });
    }

    try {
      const parsed = JSON.parse(rawText);
      return res.status(200).json({
        success: true,
        response: parsed.response || rawText,
        toolCalls: parsed.toolCalls || [],
        provenance: parsed.provenance || [
          { type: 'AI-DERIVED', label: 'Gemini Ocean Intelligence' }
        ],
        dataPointsUsed: parsed.dataPointsUsed || []
      });
    } catch {
      // Fallback if rawText is valid string but not JSON
      return res.status(200).json({
        success: true,
        response: rawText,
        toolCalls: [],
        provenance: [{ type: 'AI-DERIVED', label: 'Gemini Ocean Intelligence' }],
        dataPointsUsed: []
      });
    }
  } catch (error) {
    console.error('AI Copilot serverless handler error:', error.message);
    return res.status(200).json({
      fallback: true,
      error: error.message
    });
  }
}
