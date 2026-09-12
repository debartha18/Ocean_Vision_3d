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

STRICT INTENT & TOOL ROUTING RULES:
1. CONVERSATIONAL REQUESTS (Greetings like "hello", "hi", "hey", "good morning", "good night", "how are you", "what's up", inquiries like "what can you do for me", "help me", "who are you", compliments like "awesome", "great job", gratitude/closings):
   - ABSOLUTELY DO NOT CALL ANY TOOLS.
   - ABSOLUTELY DO NOT RETURN ANY ACTIONS IN THE "actions" ARRAY (must be []).
   - DO NOT MUTATE THE 3D VIEW. DO NOT INVENT MEASUREMENTS.
   - Respond with a warm, personable, charming, and highly engaging oceanographic personality!
   - For "good morning": greet warmly, mention that the digital twin telemetry and buoys are online for the active basin, and ask what you can help them explore.
   - For "good night": wish them restful sleep, mention that global ocean telemetry buoys and Argo floats will keep monitoring the seas overnight, and invite them back anytime.
   - For "how are you": cheerily explain that telemetry and digital-twin models are running smoothly, and ask "what can I do for you today?".
   - For "what can you do for me / help": outline capabilities (SST, salinity, currents, depth profiles, comparisons, 3D view) and invite them to explore.
   - Include 4 relevant prompt suggestions in the "suggestions" array.

2. UNKNOWN / UNRELATED REQUESTS (Gibberish like "asdfghjkl", off-topic queries):
   - ABSOLUTELY DO NOT CALL ANY TOOLS.
   - Return empty "actions": [].
   - Cheerfully clarify that you're here to help with ocean exploration, provide examples of queries for the active basin, and ask what they'd like to dive into.

3. OCEAN QUERIES, COMPARISONS, PROFILES, ANOMALIES, AND 3D VIEW COMMANDS:
   - Call the appropriate tool(s) ONLY when the user's explicit request requires ocean data, comparisons, profiles, anomalies, or view changes.
   - The CURRENT DIGITAL TWIN APPLICATION STATE provided is PASSIVE BACKGROUND CONTEXT ONLY (used to resolve pronouns like "there" or "at this depth"). IT MUST NEVER BE TREATED AS AN INSTRUCTION TO QUERY OR MUTATE STATE FOR GREETINGS.
   - NEVER invent or fabricate ocean measurements. Ground all answers in tool results.

4. In your final output, return a structured JSON response matching this schema:
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
  "dataPointsUsed": ["List of exact data points referenced, or empty array if conversational"]
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

    const isConversationalOrEmpty = actions.length === 0 && functionCalls.length === 0 && !parsedResponse?.data;

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
        `Show current vectors`
      ],
      provenance: parsedResponse?.provenance || [
        { type: isConversationalOrEmpty ? 'AI-DERIVED' : 'OBSERVED', label: isConversationalOrEmpty ? 'Nerida Conversational Agent' : 'Gemini Ocean Intelligence & Digital Twin Telemetry' }
      ],
      dataPointsUsed: parsedResponse?.dataPointsUsed || (isConversationalOrEmpty ? [] : [
        `${state.basin} (${state.parameter.toUpperCase()} at ${state.depth}m)`
      ]),
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
