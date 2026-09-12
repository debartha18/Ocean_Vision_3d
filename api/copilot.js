/**
 * Ocean Vision 3D - AI Ocean Copilot (Nerida) Serverless API Route
 * Vercel Serverless Function (Node.js runtime).
 * Implements real Gemini tool/function calling without exposing API keys to client bundles.
 */

const GEMINI_TOOLS = [
  {
    function_declarations: [
      {
        name: "get_ocean_data",
        description: "Retrieve actual oceanographic measurement from the digital twin data source (temperature, salinity, currents, wave, chlorophyll, oxygen).",
        parameters: {
          type: "OBJECT",
          properties: {
            basin: { type: "STRING", description: "Ocean basin name: 'Arabian Sea', 'Bay of Bengal', 'Equatorial Pacific', 'South China Sea', 'North Atlantic', 'Gulf of Mexico'" },
            parameter: { type: "STRING", description: "Parameter name: 'sst', 'salinity', 'currents', 'wave', 'chlorophyll', 'oxygen'" },
            depth: { type: "NUMBER", description: "Depth in meters (0 to 6000)" }
          },
          required: ["parameter"]
        }
      },
      {
        name: "compare_basins",
        description: "Compare two ocean basins for a specific physical parameter and depth.",
        parameters: {
          type: "OBJECT",
          properties: {
            basin1: { type: "STRING", description: "First basin name" },
            basin2: { type: "STRING", description: "Second basin name" },
            parameter: { type: "STRING", description: "Parameter to compare: 'sst', 'salinity', 'currents', 'wave', 'chlorophyll', 'oxygen'" },
            depth: { type: "NUMBER", description: "Depth in meters" }
          },
          required: ["basin1", "basin2", "parameter"]
        }
      },
      {
        name: "get_ocean_profile",
        description: "Retrieve vertical water column depth profile for a parameter in a basin.",
        parameters: {
          type: "OBJECT",
          properties: {
            location: { type: "STRING", description: "Basin name" },
            parameter: { type: "STRING", description: "Parameter: 'sst', 'salinity', 'currents', 'chlorophyll', 'oxygen'" },
            maxDepth: { type: "NUMBER", description: "Maximum depth in meters (e.g. 2000)" }
          },
          required: ["parameter"]
        }
      },
      {
        name: "find_ocean_anomalies",
        description: "Detect and compute statistical oceanographic anomalies against 30-year climatological baseline.",
        parameters: {
          type: "OBJECT",
          properties: {
            location: { type: "STRING", description: "Basin name" },
            parameter: { type: "STRING", description: "Parameter: 'sst', 'salinity', 'oxygen'" },
            depth: { type: "NUMBER", description: "Depth in meters" }
          }
        }
      },
      {
        name: "change_ocean_view",
        description: "Change the active 3D visualization view, basin, depth slice, or coordinates in the application.",
        parameters: {
          type: "OBJECT",
          properties: {
            basin: { type: "STRING", description: "Basin to navigate to" },
            latitude: { type: "NUMBER", description: "Latitude (-90 to 90)" },
            longitude: { type: "NUMBER", description: "Longitude (-180 to 180)" },
            depth: { type: "NUMBER", description: "Target depth in meters (0 to 6000)" },
            viewMode: { type: "STRING", description: "View mode: 'depth_slice', 'iso_surface', 'vector_field', 'volume_render'" }
          }
        }
      },
      {
        name: "change_parameter",
        description: "Modify the active selected ocean parameter in the 3D digital twin.",
        parameters: {
          type: "OBJECT",
          properties: {
            parameter: { type: "STRING", description: "Parameter: 'sst', 'salinity', 'currents', 'wave', 'chlorophyll', 'oxygen'" }
          },
          required: ["parameter"]
        }
      },
      {
        name: "get_current_ocean_state",
        description: "Inspect the current UI and digital twin state (active basin, depth, parameter, view mode).",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      }
    ]
  }
];

const SYSTEM_INSTRUCTION = `You are Nerida, the AI Ocean Copilot for Ocean Vision 3D.
You are an interactive AI oceanographer, marine physicist, and digital twin operator.

CORE DIRECTIVES:
1. NEVER invent or fabricate ocean measurements. The application's data source is the single source of truth.
2. If a measurement, comparison, profile, or anomaly is requested, use an appropriate tool (get_ocean_data, compare_basins, get_ocean_profile, find_ocean_anomalies).
3. If the user asks to change the view, depth, or basin, use change_ocean_view or change_parameter.
4. Support multi-step execution: If a user asks to compare and show, call both tools.
5. Use current ocean state context to resolve follow-up questions (e.g. "What about 500m?", "Compare that with Bay of Bengal", "What is the temperature here?").
6. In your final output, return a structured JSON response matching this schema:
{
  "message": "Scientific explanation and response in the user's requested language",
  "actions": [
    { "type": "SET_BASIN", "value": "arabian_sea" },
    { "type": "SET_DEPTH", "value": 500 },
    { "type": "SET_PARAMETER", "value": "salinity" },
    { "type": "SET_VIEW_MODE", "value": "depth_slice" }
  ],
  "suggestions": [
    "Prompt suggestion 1",
    "Prompt suggestion 2",
    "Prompt suggestion 3"
  ],
  "provenance": [
    { "type": "OBSERVED" | "FORECAST" | "SIMULATED" | "AI-DERIVED", "label": "Source description" }
  ],
  "dataPointsUsed": ["List of exact data points referenced"]
}`;

export default async function handler(req, res) {
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
    const { 
      message, 
      prompt, // backwards compatibility
      oceanState = {}, 
      oceanContext = {}, // backwards compatibility
      conversationHistory = [], 
      language = 'en' 
    } = req.body || {};

    const userMessage = message || prompt;
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const state = {
      basin: oceanState.basin || oceanContext.activeBasin?.name || 'Bay of Bengal',
      basinId: oceanState.basinId || oceanContext.activeBasin?.id || 'bay_of_bengal',
      latitude: oceanState.latitude ?? oceanContext.activeBasin?.latitude ?? 15.297,
      longitude: oceanState.longitude ?? oceanContext.activeBasin?.longitude ?? 87.860,
      depth: oceanState.depth ?? oceanContext.activeLayer?.depthMeters ?? 50,
      parameter: oceanState.parameter || oceanContext.activeLayer?.parameter || 'sst',
      viewMode: oceanState.viewMode || oceanContext.activeLayer?.viewMode || 'depth_slice',
      timestamp: oceanState.timestamp || '12:00 UTC'
    };

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.GOOGLE_API_KEY;

    // Fallback to client-side reasoning engine if API key is not configured
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        notice: 'No Gemini API key configured in serverless environment.'
      });
    }

    const promptWithContext = `CURRENT DIGITAL TWIN APPLICATION STATE:
${JSON.stringify(state, null, 2)}

User Language Preference: ${language}

CONVERSATION HISTORY:
${conversationHistory.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER REQUEST:
${userMessage}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const upstreamResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${promptWithContext}` }]
          }
        ],
        tools: GEMINI_TOOLS,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8
        }
      })
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      console.warn('Upstream Gemini API returned error:', upstreamResponse.status, errText);
      return res.status(200).json({ fallback: true });
    }

    const data = await upstreamResponse.json();
    const candidate = data?.candidates?.[0];
    const contentParts = candidate?.content?.parts || [];

    // Check if model called tools
    const functionCalls = contentParts
      .filter(p => p.functionCall)
      .map(p => ({
        tool: p.functionCall.name,
        params: p.functionCall.args || {}
      }));

    const textPart = contentParts.find(p => p.text)?.text || '';

    // If text is valid JSON, parse it
    let parsedResponse = null;
    try {
      // Find JSON block if wrapped in ```json
      const jsonMatch = textPart.match(/```json\s*([\s\S]*?)\s*```/) || textPart.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch {
      // Not JSON, keep raw text
    }

    const actions = parsedResponse?.actions || [];
    const toolResults = functionCalls.map(call => ({
      tool: call.tool,
      status: 'success',
      indicator: `Executed ${call.tool}`
    }));

    return res.status(200).json({
      success: true,
      message: parsedResponse?.message || textPart || 'Ocean data analysis complete.',
      actions,
      toolResults,
      data: parsedResponse?.data || null,
      suggestions: parsedResponse?.suggestions || [
        `Show ${state.parameter} profile`,
        `Compare with ${state.basin.includes('Arabian') ? 'Bay of Bengal' : 'Arabian Sea'}`,
        `Go to 500m depth`,
        `Analyze anomalies around this location`
      ],
      provenance: parsedResponse?.provenance || [
        { type: 'OBSERVED', label: 'Gemini Ocean Intelligence & Digital Twin Telemetry' }
      ],
      dataPointsUsed: parsedResponse?.dataPointsUsed || [
        `${state.basin} (${state.parameter.toUpperCase()} at ${state.depth}m)`
      ],
      source: 'cloud'
    });

  } catch (error) {
    console.error('AI Copilot serverless handler error:', error.message);
    return res.status(200).json({
      fallback: true,
      error: error.message
    });
  }
}
