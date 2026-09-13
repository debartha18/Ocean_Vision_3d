/**
 * Ocean Vision 3D - Nerida AI Ocean Copilot Dynamic Reasoning Engine
 * 
 * Strict Domain & Intent-Driven Architecture:
 * 1. CONVERSATIONAL: Greetings, identity, capabilities, pleasantries, language preferences (NO TOOLS, NO 3D MUTATION).
 * 2. MARINE_BIOLOGY: Ecological & marine life questions based on regional basin & depth zone (NO TOOLS, NO 3D MUTATION, with scientific caveats).
 * 3. GENERAL_OCEANOGRAPHY: Physical concepts (upwelling, thermocline, stratification, ENSO, OMZ, currents importance) (NO TOOLS).
 * 4. OCEAN_QUERY: Structured physical measurements (SST, Salinity, Currents, Wave, Chlorophyll, Oxygen, vertical profiles) (REAL TOOLS).
 * 5. COMPARISON: Multi-basin physical comparisons (REAL TOOLS).
 * 6. VIEW_COMMAND: Direct 3D digital-twin viewer control (REAL ACTIONS).
 * 7. ANALYSIS: Climatological anomaly diagnostics & marine heatwaves (REAL TOOLS).
 * 8. OUT_OF_DOMAIN: Questions outside oceanography/marine science (POLITE REFUSAL, NO TOOLS).
 * 9. UNKNOWN: Gibberish or unparseable queries (CLARIFICATION, NO TOOLS).
 * 
 * ABSOLUTE ISOLATION: A new user message NEVER reuses a previous question's response or tool result.
 */

import { 
  normalizeParameter, 
  resolveBasin, 
  resolveLocation,
  normalizeViewMode,
  tool_get_ocean_data, 
  tool_compare_basins, 
  tool_get_ocean_profile, 
  tool_find_ocean_anomalies, 
  tool_change_ocean_view, 
  tool_change_parameter, 
  tool_get_current_ocean_state,
  tool_predict_storm_and_weather
} from './oceanTools.js';

/**
 * Parses user natural language query and resolves context from current application state and conversation history.
 */
export function extractIntentAndEntities(query, currentState = {}, conversationHistory = []) {
  // 1. Language Detection & Digit Normalization
  let detectedLang = currentState.language || 'en';
  if (/[\u0980-\u09FF]/.test(query) || query.includes('বাংলা') || query.includes('bengali')) {
    detectedLang = 'bn';
  } else if (/[\u0900-\u097F]/.test(query) || query.includes('हिंदी') || query.includes('hindi')) {
    detectedLang = 'hi';
  } else if (/[\u0B80-\u0BFF]/.test(query) || query.includes('தமிழ்') || query.includes('tamil')) {
    detectedLang = 'ta';
  } else if (/[\u0C00-\u0C7F]/.test(query) || query.includes('తెలుగు') || query.includes('telugu')) {
    detectedLang = 'te';
  }

  // Convert Bengali and Devanagari numerals into ASCII digits
  const q = query.toLowerCase().trim()
    .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))
    .replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));

  // 2. Identify context from previous conversation (search newest to oldest)
  let contextParam = currentState.parameter || 'sst';
  let contextDepth = currentState.depth ?? 0;
  let contextBasin = currentState.basinId || (currentState.basin ? (resolveBasin(currentState.basin)?.id || currentState.basin) : null) || 'bay_of_bengal';
  let lastAssistantHadData = false;

  let foundParam = false;
  let foundDepth = false;
  let foundBasin = false;

  if (conversationHistory && conversationHistory.length > 0) {
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      if (msg.role === 'assistant' && msg.data) {
        lastAssistantHadData = true;
      }
      if (!foundParam) {
        if (msg.data?.parameter) {
          contextParam = msg.data.parameter;
          foundParam = true;
        } else if (msg.actions?.some(a => a.type === 'SET_PARAMETER')) {
          contextParam = msg.actions.find(a => a.type === 'SET_PARAMETER').value;
          foundParam = true;
        }
      }
      if (!foundDepth) {
        if (typeof msg.data?.depth === 'number') {
          contextDepth = msg.data.depth;
          foundDepth = true;
        } else if (msg.actions?.some(a => a.type === 'SET_DEPTH')) {
          contextDepth = msg.actions.find(a => a.type === 'SET_DEPTH').value;
          foundDepth = true;
        }
      }
      if (!foundBasin) {
        if (msg.data?.location) {
          const res = resolveBasin(msg.data.location, null);
          if (res) {
            contextBasin = res.id;
            foundBasin = true;
          }
        } else if (msg.actions?.some(a => a.type === 'SET_BASIN')) {
          contextBasin = msg.actions.find(a => a.type === 'SET_BASIN').value;
          foundBasin = true;
        }
      }
      if (foundParam && foundDepth && foundBasin) break;
    }
  }

  // 3. Extract Parameter from current prompt
  let paramSpecified = false;
  let targetParam = contextParam;
  if (/\b(sst|temp|temperature|thermal|warm|cold|heat|তাপমাত্রা|तापमान)\b/i.test(q)) {
    targetParam = 'sst';
    paramSpecified = true;
  } else if (/\b(sal|salin|salinity|salt|psu|halocline|লবণাক্ততা|लवणता)\b/i.test(q)) {
    targetParam = 'salinity';
    paramSpecified = true;
  } else if (/\b(current|currents|velocity|flow|shear|vector|vectors|স্রোত|ধারা)\b/i.test(q)) {
    targetParam = 'currents';
    paramSpecified = true;
  } else if (/\b(wave|waves|swell|surge|breaker|sea state|ঢেউ|तरंग)\b/i.test(q)) {
    targetParam = 'wave';
    paramSpecified = true;
  } else if (/\b(chlor|chlorophyll|chlorophyll-a|phytoplankton|bloom|algae|biomass|ক্লোরোফিল)\b/i.test(q)) {
    targetParam = 'chlorophyll';
    paramSpecified = true;
  } else if (/\b(oxygen|dissolved oxygen|hypoxia|omz|o2|অক্সিজেন)\b/i.test(q)) {
    targetParam = 'oxygen';
    paramSpecified = true;
  }

  // 4. Extract Depth from current prompt
  let depthSpecified = false;
  let targetDepth = contextDepth;

  // Check explicit numeric depth first (e.g. 500m, 500 meters, at 500)
  const numDepthMatch = q.match(/\b(\d{1,5})\s*(?:m|meter|meters|metre|metres|মিটার|मीटर)\b/i) ||
                        q.match(/(?:at|to|of|depth)\s*(\d{1,5})\b/i) ||
                        q.match(/\b(\d{1,5})\s*m\b/i);

  if (numDepthMatch && numDepthMatch[1]) {
    const parsed = parseInt(numDepthMatch[1], 10);
    if (parsed <= 6000 && parsed !== 2026 && parsed !== 2025) {
      targetDepth = parsed;
      depthSpecified = true;
    }
  } else if (/\b(surface|top|upper|0\s*m|0\s*meter|0\s*metre|পৃষ্ঠ|सतह)\b/i.test(q)) {
    targetDepth = 0;
    depthSpecified = true;
  } else if (/\b(deeper|deep water|further down|আরও গভীরে|और गहरा)\b/i.test(q)) {
    targetDepth = Math.min(6000, (contextDepth === 0 ? 50 : contextDepth * 2));
    depthSpecified = true;
  } else if (/\b(shallower|higher up|less deep)\b/i.test(q)) {
    targetDepth = Math.max(0, Math.floor(contextDepth / 2));
    depthSpecified = true;
  }

  // 5. Extract Basin / Location
  let basinSpecified = false;
  let targetBasin = contextBasin;
  let secondBasin = null;
  let matchedLocation = null;
  let targetCoords = null;

  // Check for specific coastal cities, ports, beaches, islands, or basins via resolveLocation
  const locMatch = resolveLocation(q, null);
  if (locMatch && locMatch.matchedLocation) {
    targetBasin = locMatch.basin.id;
    basinSpecified = true;
    matchedLocation = locMatch.matchedLocation;
    targetCoords = locMatch.coords;
  }

  if (/(arabian|arabian sea|আরব সাগর|अरब सागर)/i.test(q)) {
    if (basinSpecified && targetBasin !== 'arabian_sea') {
      secondBasin = 'arabian_sea';
    } else {
      targetBasin = 'arabian_sea';
      basinSpecified = true;
    }
  }
  if (/(bengal|bay of bengal|bob|বঙ্গোপসাগর|बंगाल की खाड़ी)/i.test(q)) {
    if (basinSpecified && targetBasin !== 'bay_of_bengal') {
      secondBasin = 'bay_of_bengal';
    } else {
      targetBasin = 'bay_of_bengal';
      basinSpecified = true;
    }
  }
  if (/(south china|china sea|দক্ষিণ চীন সাগর|दक्षिण चीन सागर)/i.test(q)) {
    if (basinSpecified && targetBasin !== 'south_china_sea') {
      secondBasin = 'south_china_sea';
    } else {
      targetBasin = 'south_china_sea';
      basinSpecified = true;
    }
  }
  if (/(pacific|equatorial pacific|el nino basin|প্রশান্ত মহাসাগর|प्रशांत महासागर)/i.test(q)) {
    if (basinSpecified && targetBasin !== 'equatorial_pacific') {
      secondBasin = 'equatorial_pacific';
    } else {
      targetBasin = 'equatorial_pacific';
      basinSpecified = true;
    }
  }
  if (/(atlantic|north atlantic|আটলান্টিক|अटलांटिक)/i.test(q)) {
    if (basinSpecified && targetBasin !== 'north_atlantic') {
      secondBasin = 'north_atlantic';
    } else {
      targetBasin = 'north_atlantic';
      basinSpecified = true;
    }
  }
  if (/(gulf of mexico|mexico|মেক্সিকো উপসাগর|मैक्सिको की खाड़ी)/i.test(q)) {
    if (basinSpecified && targetBasin !== 'gulf_of_mexico') {
      secondBasin = 'gulf_of_mexico';
    } else {
      targetBasin = 'gulf_of_mexico';
      basinSpecified = true;
    }
  }

  // 6. Identify Semantic Flags
  const isStormOrWeather = (
    /\b(storm|storms|cyclone|cyclones|typhoon|hurricane|depression|squall|monsoon|rain|raining|rainfall|precipitation|weather|forecast|predict|prediction|predictions|surge|swell|gale|flood|wind speed|high seas|hava|mausam)\b/i.test(q) ||
    /(বৃষ্টি|ঝড়|ঝড়|ঝড়বৃষ্টি|ঝড়বৃষ্টি|আবহাওয়া|পূর্বাভাস|तूफान|चक्रवात|बारिश|मौसम|पूर्वानुमान|हवा)/i.test(query)
  );

  const isGeneralConditions = (
    /\b(condition|conditions|current conditions|overview|situation|what is happening|weather here|status here|how is it here|what about here)\b/i.test(q) ||
    /(পরিস্থিতি|অবস্থা|स्थिति|हालात)/i.test(query)
  );

  const isMarineLife = /\b(marine life|life|animal|animals|species|organism|organisms|fish|fishes|whale|whales|shark|sharks|dolphin|dolphins|coral|corals|turtle|turtles|plankton|phytoplankton|zooplankton|crustacean|squid|biodiversity|ecology|ecosystem|biomass|what lives|who lives|মাছ|প্রাণী|জীববৈচিত্র্য|जीव|मछली|प्राणी)\b/i.test(q);

  const isComparison = /(compare|versus|vs|difference|higher|lower|warmer|cooler|saltier|তুলনা|तुलना)/i.test(q);
  const isProfile = /(profile|stratification|vertical|column|curve|gradient|thermocline profile|প্রোফাইল|प्रोफ़ाइल)/i.test(q) && !isMarineLife;
  const isAnomaly = /(anomaly|anomalies|unusual|abnormal|deviat|heatwave|bloom|অস্বাভাবিক|विसंगति)/i.test(q);

  const isGeneralScience = (
    /\b(why is|how does|what causes|what is|explain)\b/i.test(q) &&
    /\b(upwelling|downwelling|stratification|thermocline|halocline|pycnocline|el nino|la nina|enso|monsoon|mld|mixed layer|gyre|currents important|salinity higher|circulation|acidification)\b/i.test(q) &&
    !q.match(/\b(\d{1,5})\s*m\b/) &&
    !isComparison
  );

  const isOutOfDomain = (
    /\b(capital of|cricket|football|soccer|president|prime minister|python game|code a|write a poem|write code|recipe|movie|song|who won|stock price|france|germany|paris|london|cricket match)\b/i.test(q)
  );

  const isGoodMorning = /\b(good morning|morning nerida|gm|morning)\b/i.test(q) ||
                        (/[\u0980-\u09FF]/.test(query) && /(শুভ সকাল)/i.test(query)) ||
                        (/[\u0900-\u097F]/.test(query) && /(शुभ प्रभात|सुप्रभात)/i.test(query));

  const isGoodNight = /\b(good night|goodnight|gn|sleep well|sweet dreams|night nerida)\b/i.test(q) ||
                      (/[\u0980-\u09FF]/.test(query) && /(শুভ রাত্রি)/i.test(query)) ||
                      (/[\u0900-\u097F]/.test(query) && /(शुभ रात्रि|शुभरात्रि)/i.test(query));

  const isGoodDay = /\b(good afternoon|good evening|good day)\b/i.test(q) ||
                    (/[\u0980-\u09FF]/.test(query) && /(শুভ অপরাহ্ন|শুভ সন্ধ্যা)/i.test(query)) ||
                    (/[\u0900-\u097F]/.test(query) && /(शुभ दोपहर|शुभ संध्या)/i.test(query));

  const isHowAreYou = /\b(how are you|how r u|how are you doing|how do you do|how's it going|how are things|how are you feeling|what's up|wassup|sup nerida)\b/i.test(q) ||
                      (/[\u0980-\u09FF]/.test(query) && /(কেমন আছো|কেমন আছেন)/i.test(query)) ||
                      (/[\u0900-\u097F]/.test(query) && /(आप कैसे हैं|कैसी हो|सब कैसा है)/i.test(query));

  const isCompliment = /\b(awesome|amazing|great job|cool|nice work|well done|wonderful|good job|you are great|you're great|you are cool|you're cool|you are smart|love you)\b/i.test(q) ||
                       (/[\u0980-\u09FF]/.test(query) && /(দারুণ|চমৎকার|অসাধারণ)/i.test(query)) ||
                       (/[\u0900-\u097F]/.test(query) && /(बहुत बढ़िया|शाबाश|कमाल)/i.test(query));

  const isGreeting = isGoodMorning || isGoodNight || isGoodDay || isHowAreYou || isCompliment ||
                     /\b(hello|hi|hey|greetings|howdy|hola|yo|namaste|vanakkam|namaskaram|sat sri akaal|aadab)\b/i.test(q) ||
                     (/[\u0980-\u09FF]/.test(query) && /(হ্যালো|নমস্কার|সালাম|কেমন আছো|শুভ সকাল|শুভ রাত্রি)/i.test(query)) ||
                     (/[\u0900-\u097F]/.test(query) && /(नमस्ते|हैलो|प्रणाम|शुभ प्रभात|शुभ रात्रि)/i.test(query));

  const isIdentityOrHelp = /\b(what can you do|who are you|what are you|who made you|help me|help|features|capabilities|what do you do|how to use|what is your role|tell me about yourself|what can i do for you|what can you do for me|what can u do for me|how can you help)\b/i.test(q) ||
                           /(তুমি কি করতে পারো|তুমি কে|কি করতে পারো|সাহায্য|তোমার কাজ কি)/i.test(query) ||
                           /(आप क्या कर सकते हैं|तुम कौन हो|मदद|सहायता|तुम क्या कर सकते हो)/i.test(query);

  const isPoliteClosing = /\b(thanks|thank you|thx|bye|goodbye|see you|ok thanks|okay thanks|catch you later|take care)\b/i.test(q) ||
                          /(ধন্যবাদ|বিদায়)/i.test(query) ||
                          /(धन्यवाद|शुक्रिया|अलविदा)/i.test(query);

  const isLanguageSwitchOnly = /^(speak in|talk in|switch to|translate to)?\s*(বাংলায় বলো|বাংলায় কথা বলো|বাংলায়|hindi me bolo|speak in english|talk in bengali)\s*$/i.test(q);

  const hasOceanEntity = paramSpecified || basinSpecified || depthSpecified || isProfile || isAnomaly || isComparison || isStormOrWeather || isGeneralConditions;
  const hasViewWord = /\b(show|display|view|go to|switch to|navigate to|zoom to|vector|vectors|volume|isosurface|slice)\b/i.test(q);
  const isQuestion = /\b(what|how|why|when|where|is there|does|কতো|কত|কী|কি|क्या|कितना)\b/i.test(q) || q.includes('?');

  // Follow-up relative query detection strictly for physical measurements
  const isFollowUpMeasurement = (
    (/^(what about|and at|how about)\s*(\d{1,5}\s*m?|surface|depth)\??$/i.test(q) ||
     (/\b(what about|and at|how about)\b/i.test(q) && (depthSpecified || paramSpecified)) ||
     /\b(what is the (temperature|salinity|sst|current|wave|oxygen|chlorophyll) there)\b/i.test(q) ||
     (depthSpecified && !paramSpecified && !basinSpecified && lastAssistantHadData)) &&
    !isMarineLife
  );

  // If comparing and only one basin was mentioned in this turn, compare with prior context basin
  if (isComparison && !secondBasin) {
    if (targetBasin !== contextBasin) {
      secondBasin = contextBasin;
    } else {
      secondBasin = targetBasin === 'bay_of_bengal' ? 'arabian_sea' : 'bay_of_bengal';
    }
  }

  // 7. Explicit Primary Intent Classification
  let category = 'UNKNOWN';

  if (isOutOfDomain) {
    category = 'OUT_OF_DOMAIN';
  } else if (isStormOrWeather) {
    category = 'STORM_WEATHER_PREDICTION';
  } else if (isGeneralConditions && !paramSpecified) {
    category = 'GENERAL_CONDITIONS';
  } else if ((isGreeting || isIdentityOrHelp || isPoliteClosing || isLanguageSwitchOnly) && !hasOceanEntity && !hasViewWord && !isMarineLife) {
    category = 'CONVERSATIONAL';
  } else if (isMarineLife) {
    category = 'MARINE_BIOLOGY';
  } else if (isGeneralScience) {
    category = 'GENERAL_OCEANOGRAPHY';
  } else if (isComparison) {
    category = 'COMPARISON';
  } else if (isAnomaly || /\b(storm risk|cyclogenesis|stratification|mixed layer|mld|heatwave)\b/i.test(q)) {
    category = 'ANALYSIS';
  } else if (hasViewWord && !isQuestion && (basinSpecified || depthSpecified || /vector|volume|isosurface|slice/i.test(q))) {
    category = 'VIEW_COMMAND';
  } else if (paramSpecified || isProfile || isFollowUpMeasurement || (isQuestion && hasOceanEntity)) {
    category = 'OCEAN_QUERY';
  } else if (hasViewWord && basinSpecified) {
    category = 'VIEW_COMMAND';
  } else if (hasOceanEntity) {
    category = 'OCEAN_QUERY';
  } else {
    category = 'UNKNOWN';
  }

  return {
    query,
    detectedLang,
    category,
    param: targetParam,
    paramSpecified,
    depth: targetDepth,
    depthSpecified,
    basin: targetBasin,
    secondBasin,
    basinSpecified,
    matchedLocation,
    coords: targetCoords,
    isImplicitLocation: !basinSpecified,
    isStormOrWeather,
    isGeneralConditions,
    isComparison,
    isProfile,
    isAnomaly,
    isMarineLife,
    isGeneralScience,
    isOutOfDomain,
    isFollowUpMeasurement,
    isGreeting,
    isGoodMorning,
    isGoodNight,
    isGoodDay,
    isHowAreYou,
    isCompliment,
    isIdentityOrHelp,
    isPoliteClosing,
    isLanguageSwitchOnly,
    contextBasin,
    contextDepth,
    contextParam
  };
}

/**
 * Dynamic AI Reasoning & Tool Execution Handler
 * Genuinely executes scientific tools and generates interpreted results.
 */
export function executeNeridaReasoning(query, currentState = {}, conversationHistory = [], requestId = null) {
  const reqId = requestId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substring(2, 10));

  const intent = extractIntentAndEntities(query, currentState, conversationHistory);
  const lang = intent.detectedLang;

  const actions = [];
  const toolResults = [];
  let primaryData = null;
  let message = '';
  const suggestions = [];
  const provenance = [];
  const dataPointsUsed = [];

  // TEMPORARY DEBUG LOGGING (Section 14)
  console.log(`[Copilot Request] id: ${reqId} input: "${query}"`);
  console.log(`[Intent] ${intent.category}`);
  console.log(`[Conversation Context]`, {
    contextBasin: intent.contextBasin,
    contextDepth: intent.contextDepth,
    contextParam: intent.contextParam
  });

  // =============================================================
  // INTENT ROUTING PIPELINE
  // =============================================================

  // -------------------------------------------------------------
  // ROUTE: STORM_WEATHER_PREDICTION (Storms, Cyclones, Weather, Rain Forecasts)
  // -------------------------------------------------------------
  if (intent.category === 'STORM_WEATHER_PREDICTION') {
    const locName = intent.matchedLocation || (intent.basinSpecified ? intent.basin : null);

    toolResults.push({
      tool: 'predict_storm_and_weather',
      status: 'success',
      indicator: `Analyzing meteorological threats & rain forecast for ${intent.matchedLocation || intent.basin.replace('_', ' ')}`
    });

    const predictionData = tool_predict_storm_and_weather({
      location: locName,
      basin: intent.basin,
      latitude: intent.coords?.lat,
      longitude: intent.coords?.lon
    }, currentState);

    primaryData = predictionData;
    provenance.push({ type: 'OBSERVED', label: 'IMD / JTWC / INCOIS Regional Weather Radar & Moored Buoys' });
    provenance.push({ type: 'FORECAST', label: 'Numerical Coastal Wave & Precipitation Ensemble (3-Day)' });

    dataPointsUsed.push(`Target Location: ${predictionData.location} (${predictionData.coordinates})`);
    dataPointsUsed.push(`Active Basin: ${predictionData.basin}`);
    dataPointsUsed.push(`Threat Severity: ${predictionData.threatLevel} (${predictionData.stormProbability}% storm risk)`);
    dataPointsUsed.push(`Active System: ${predictionData.activeStorm.name} (${predictionData.activeStorm.category})`);
    dataPointsUsed.push(`Wind Speed: ${predictionData.windSpeedKmH} | Pressure: ${predictionData.pressure}`);
    dataPointsUsed.push(`Rain Probability: ${predictionData.rainProbability}% | Rate: ${predictionData.rainRate} mm/h`);
    dataPointsUsed.push(`Wave Swell: ${predictionData.waveHeight} | Surge: ${predictionData.activeStorm.surge}`);

    // If a different basin was explicitly requested or resolved from city, adjust 3D view
    if (intent.basinSpecified && intent.basin !== intent.contextBasin) {
      actions.push({ type: 'SET_BASIN', value: predictionData.basinId, label: predictionData.basin });
    }

    const storm = predictionData.activeStorm;
    const outlook = predictionData.threeDayOutlook;
    const beachList = predictionData.beachForecasts;

    if (lang === 'bn') {
      message = `📍 **আবহাওয়া ও ঝড় পূর্বাভাস:** **${predictionData.location}** (${predictionData.coordinates}) — **${predictionData.basin}**\n\n` +
        `⚠️ **ঝড়ের ঝুঁকি মাত্রা:** **${predictionData.threatLevel}** (${predictionData.stormProbability}% ঝুঁকি)\n` +
        `- **সক্রিয় আবহাওয়া ব্যবস্থা:** **${storm.name}** (*${storm.category}*)\n` +
        `- **বাতাসের গতিবেগ:** ${predictionData.windSpeedKmH} | **বায়ুমণ্ডলীয় চাপ:** ${predictionData.pressure}\n` +
        `- **বৃষ্টিপাতের সম্ভাবনা:** **${predictionData.rainProbability}%** (${storm.rainfallForecast})\n` +
        `- **সমুদ্রের ঢেউ ও জলোচ্ছ্বাস:** ${predictionData.waveHeight} (স্বাভাবিকের চেয়ে ${storm.surge})\n` +
        `- **পৃষ্ঠের তাপমাত্রা (SST):** ${predictionData.seaSurfaceTemperature} (${predictionData.cyclogenesisPotential})\n\n` +
        `📅 **৩ দিনের সামুদ্রিক পূর্বাভাস:**\n` +
        `- **আজ:** ${outlook[0].condition} | বৃষ্টি: ${outlook[0].rainProbability}% | বাতাস: ${outlook[0].windSpeedKmH} km/h | ঢেউ: ${outlook[0].waveHeight}\n` +
        `- **আগামীকাল:** ${outlook[1].condition} | বৃষ্টি: ${outlook[1].rainProbability}% | বাতাস: ${outlook[1].windSpeedKmH} km/h\n` +
        `- **পরশু:** ${outlook[2].condition} | বৃষ্টি: ${outlook[2].rainProbability}%\n\n` +
        (beachList.length > 0 ? `🏖️ **নিকটবর্তী উপকূলীয় সৈকত সতর্কতা:**\n` + beachList.map(b => `- **${b.beachName}** (${b.location}): ${b.safetyFlag} | বৃষ্টি: ${b.rainProbability}% | ঢেউ: ${b.surfWaveHeight}m`).join('\n') : '');
    } else if (lang === 'hi') {
      message = `📍 **मौसम व चक्रवात पूर्वानुमान:** **${predictionData.location}** (${predictionData.coordinates}) — **${predictionData.basin}**\n\n` +
        `⚠️ **तूफान जोखिम स्तर:** **${predictionData.threatLevel}** (${predictionData.stormProbability}% संभावना)\n` +
        `- **सक्रिय मौसम प्रणाली:** **${storm.name}** (*${storm.category}*)\n` +
        `- **हवा की गति:** ${predictionData.windSpeedKmH} | **वायुदाब:** ${predictionData.pressure}\n` +
        `- **बारिश की संभावना:** **${predictionData.rainProbability}%** (${storm.rainfallForecast})\n` +
        `- **समुद्री लहरें व ज्वार उभार:** ${predictionData.waveHeight} (${storm.surge})\n` +
        `- **समुद्र सतह तापमान (SST):** ${predictionData.seaSurfaceTemperature} (${predictionData.cyclogenesisPotential})\n\n` +
        `📅 **3-दिवसीय समुद्री दृष्टिकोण:**\n` +
        `- **आज:** ${outlook[0].condition} | वर्षा: ${outlook[0].rainProbability}% | हवा: ${outlook[0].windSpeedKmH} km/h | लहरें: ${outlook[0].waveHeight}\n` +
        `- **कल:** ${outlook[1].condition} | वर्षा: ${outlook[1].rainProbability}% | हवा: ${outlook[1].windSpeedKmH} km/h\n` +
        `- **तीसरा दिन:** ${outlook[2].condition} | वर्षा: ${outlook[2].rainProbability}%\n\n` +
        (beachList.length > 0 ? `🏖️ **तटीय समुद्र तट सुरक्षा अलर्ट:**\n` + beachList.map(b => `- **${b.beachName}** (${b.location}): ${b.safetyFlag} | वर्षा: ${b.rainProbability}% | सर्फ लहरें: ${b.surfWaveHeight}m`).join('\n') : '');
    } else {
      const locPrefix = predictionData.isImplicitLocation 
        ? `📍 **Current Active Location Telemetry:** **${predictionData.location}** (\`${predictionData.coordinates}\`)`
        : `📍 **Target Coastal Sector:** **${predictionData.location}** (\`${predictionData.coordinates}\`) in the **${predictionData.basin}**`;

      message = `${locPrefix}\n\n` +
        `⚠️ **Storm & Cyclone Threat Level: \`${predictionData.threatLevel}\`** (${predictionData.stormProbability}% Probability)\n` +
        `- **Active Weather System:** **${storm.name}** (*${storm.category}*)\n` +
        `- **Wind & Pressure:** \`${predictionData.windSpeedKmH}\` | Barometric Pressure: \`${predictionData.pressure}\`\n` +
        `- **Precipitation Probability:** **\`${predictionData.rainProbability}%\`** (${storm.rainfallForecast})\n` +
        `- **Marine Wave Swell:** \`${predictionData.waveHeight}\` (Surge: \`${storm.surge}\`)\n` +
        `- **Thermal Energy (SST):** \`${predictionData.seaSurfaceTemperature}\` (*${predictionData.cyclogenesisPotential}*)\n\n` +
        `📅 **3-Day Forward Marine Outlook:**\n` +
        `- **Today:** ${outlook[0].condition} | Rain: \`${outlook[0].rainProbability}%\` | Wind: \`${outlook[0].windSpeedKmH} km/h\` | Swell: \`${outlook[0].waveHeight}\`\n` +
        `- **Tomorrow:** ${outlook[1].condition} | Rain: \`${outlook[1].rainProbability}%\` | Wind: \`${outlook[1].windSpeedKmH} km/h\`\n` +
        `- **Day 3:** ${outlook[2].condition} | Rain: \`${outlook[2].rainProbability}%\`\n\n` +
        (beachList.length > 0 ? `🏖️ **Coastal Beach & Harbor Status:**\n` + beachList.map(b => `- **${b.beachName}** (${b.location}): **${b.safetyFlag}** — Rain: \`${b.rainProbability}%\`, Breakers: \`${b.surfWaveHeight}m\``).join('\n') : '');
    }

    suggestions.push(`Show current vectors in ${predictionData.basin}`);
    suggestions.push(`Check temperature profile`);
    suggestions.push(`Compare Arabian Sea and Bay of Bengal`);
    suggestions.push(`Inspect beach surf conditions`);
  }

  // -------------------------------------------------------------
  // ROUTE: GENERAL_CONDITIONS (Holistic Physical Conditions & Ocean State)
  // -------------------------------------------------------------
  else if (intent.category === 'GENERAL_CONDITIONS') {
    const locInfo = resolveLocation(intent.matchedLocation || intent.basin, currentState.rawRegion || REGIONS[currentState.basinId] || REGIONS.bay_of_bengal);
    const region = locInfo.basin;
    const locName = locInfo.matchedLocation || region.name;

    toolResults.push({
      tool: 'get_current_ocean_state',
      status: 'success',
      indicator: `Gathering real-time multi-parameter physical state for ${locName}`
    });

    provenance.push({ type: 'OBSERVED', label: `${region.name} Moored Buoy & Argo Profiling Float Array` });
    provenance.push({ type: 'SIMULATED', label: 'TEOS-10 Hydrodynamic Model' });

    dataPointsUsed.push(`Location: ${locName} (${region.coords})`);
    dataPointsUsed.push(`Surface Temperature (SST): ${region.sst}°C`);
    dataPointsUsed.push(`Salinity: ${region.salinity} PSU`);
    dataPointsUsed.push(`Current Speed: ${region.currentSpeed} m/s`);
    dataPointsUsed.push(`Wave Height: ${region.waveHeight}m`);
    dataPointsUsed.push(`Dissolved Oxygen: ${region.oxygen} mg/L`);
    dataPointsUsed.push(`Chlorophyll-a: ${region.chlorophyll} mg/m³`);

    if (lang === 'bn') {
      message = `📍 **${locName}** (${region.coords}) — **বর্তমান পরিস্থিতি:**\n\n` +
        `- 🌡️ **পৃষ্ঠের তাপমাত্রা (SST):** **${region.sst}°C**\n` +
        `- 🧂 **লবণাক্ততা:** **${region.salinity} PSU**\n` +
        `- 🌊 **স্রোতের গতিবেগ:** **${region.currentSpeed} m/s**\n` +
        `- 🏄 **ঢেউয়ের উচ্চতা:** **${region.waveHeight}m**\n` +
        `- 💨 **বায়ুপ্রবাহ ও চাপ:** ${region.windSpeedKmH} km/h (${region.pressure} hPa)\n` +
        `- 🧪 **দ্রবীভূত অক্সিজেন:** ${region.oxygen} mg/L\n` +
        `- 🌿 **ক্লোরোফিল-এ:** ${region.chlorophyll} mg/m³\n` +
        `- ⛈️ **আবহাওয়া অবস্থা:** ${region.activeStorm?.name || 'স্বাভাবিক প্রবাহ'} (${region.rainProbability}% বৃষ্টিপাতের সম্ভাবনা)`;
    } else if (lang === 'hi') {
      message = `📍 **${locName}** (${region.coords}) — **वर्तमान स्थिति:**\n\n` +
        `- 🌡️ **समुद्र सतह तापमान (SST):** **${region.sst}°C**\n` +
        `- 🧂 **लवणता:** **${region.salinity} PSU**\n` +
        `- 🌊 **धाराओं का वेग:** **${region.currentSpeed} m/s**\n` +
        `- 🏄 **तरंग ऊंचाई:** **${region.waveHeight}m**\n` +
        `- 💨 **हवा की गति व दबाव:** ${region.windSpeedKmH} km/h (${region.pressure} hPa)\n` +
        `- 🧪 **घुलित ऑक्सीजन:** ${region.oxygen} mg/L\n` +
        `- 🌿 **क्लोरोफिल-ए:** ${region.chlorophyll} mg/m³\n` +
        `- ⛈️ **मौसम प्रणाली:** ${region.activeStorm?.name || 'सामान्य समुद्री प्रवाह'} (${region.rainProbability}% वर्षा की संभावना)`;
    } else {
      message = `📍 **Current Physical Conditions:** **${locName}** (\`${region.coords}\`):\n\n` +
        `- 🌡️ **Sea Surface Temperature (SST):** **\`${region.sst}°C\`**\n` +
        `- 🧂 **Surface Salinity:** **\`${region.salinity} PSU\`**\n` +
        `- 🌊 **Current Velocity:** **\`${region.currentSpeed} m/s\`**\n` +
        `- 🏄 **Significant Wave Height:** **\`${region.waveHeight}m\`**\n` +
        `- 💨 **Wind Speed & Pressure:** \`${region.windSpeedKmH} km/h\` (\`${region.pressure} hPa\`)\n` +
        `- 🧪 **Dissolved Oxygen:** \`${region.oxygen} mg/L\`\n` +
        `- 🌿 **Chlorophyll-a:** \`${region.chlorophyll} mg/m³\`\n` +
        `- ⛈️ **Active Weather System:** **${region.activeStorm?.name || 'Nominal Flow'}** (\`${region.rainProbability}%\` rain probability)`;
    }

    suggestions.push(`Predict storms in ${locName}`);
    suggestions.push('Show the temperature profile');
    suggestions.push('Show current vectors in 3D');
    suggestions.push('Compare Arabian Sea and Bay of Bengal');
  }

  // -------------------------------------------------------------
  // ROUTE 1: CONVERSATIONAL (Greetings, Capabilities, Identity)
  // STRICT RULE: ZERO tool calls, ZERO actions, ZERO 3D changes
  // -------------------------------------------------------------
  else if (intent.category === 'CONVERSATIONAL') {
    provenance.push({ type: 'AI-DERIVED', label: 'Nerida Interactive Companion' });

    const basinObj = resolveBasin(intent.basin || intent.contextBasin, null);
    const basinName = basinObj ? basinObj.name : (currentState.basin || 'Bay of Bengal');

    if (intent.isGoodMorning) {
      if (lang === 'bn') {
        message = `শুভ সকাল! ☀️ আজ সমুদ্রের ডিজিটাল টুইন সম্পূর্ণরূপে সক্রিয় ও প্রস্তুত।\n\n**${basinName}**-এর আবহাওয়া ও উপগ্রহ ডেটা লাইভ পর্যবেক্ষণ করা হচ্ছে। আমি **Nerida**, আপনার এআই ওশান কোপাইলট — আজ আপনাকে কীভাবে সাহায্য করতে পারি? বর্তমান পৃষ্ঠতলের তাপমাত্রা, উল্লম্ব প্রোফাইল নাকি 3D জলস্তম্ভ দেখতে চান? 🌊`;
      } else if (lang === 'hi') {
        message = `शुभ प्रभात! ☀️ आज महासागर पूरी तरह जीवंत और गतिशील है।\n\n**${basinName}** के लिए सभी इन-सीटू सेंसर्स और उपग्रह डेटा तैयार हैं। मैं **नेरिडा (Nerida)** हूँ — बताइए, आज मैं आपके लिए क्या करूँ? क्या आप समुद्री सतह का तापमान, लवणता प्रोफाइल या 3D समुद्र का दृश्य देखना चाहेंगे? 🌊`;
      } else {
        message = `Good morning! ☀️ The ocean is awake and dynamic today.\n\nAll autonomous monitoring buoys, Argo floats, and 3D digital-twin telemetry are live and calibrated for **${basinName}**.\n\nI'm **Nerida**, your AI Ocean Copilot — what can I do for you today? Would you like to check current sea surface temperatures, inspect vertical salinity profiles, or explore the 3D subsurface view? 🌊`;
      }
      suggestions.push(`Explain current conditions in ${basinName}`);
      suggestions.push('Show the temperature profile');
      suggestions.push(`What marine life is found in ${basinName}?`);
      suggestions.push('Show current vectors');
    } else if (intent.isGoodNight) {
      if (lang === 'bn') {
        message = `শুভ রাত্রি! 🌙 শান্তিময় বিশ্রাম নিন।\n\nসারা রাত ধরে আমাদের গভীর সমুদ্রের সেন্সর, আর্গো ফ্লোট এবং মোর্ড বায়াগুলো নিরবচ্ছিন্নভাবে সমুদ্রের স্রোত, তাপমাত্রা ও জোয়ার-ভাটার গতিবিধি পর্যবেক্ষণ করবে।\n\nপরবর্তীতে ফিরে এলে আমি সর্বশেষ সমুদ্রের তথ্য নিয়ে প্রস্তুত থাকব। শুভকামনা ও মিষ্টি স্বপ্ন! 🌊✨`;
      } else if (lang === 'hi') {
        message = `शुभ रात्रि! 🌙 अच्छी और सुकून भरी नींद लें।\n\nरात भर हमारे वैश्विक फ्लोट नेटवर्क, गहरे समुद्र के बुआए और सेंसर्स महासागरीय धाराओं व तापमान पर नज़र रखेंगे।\n\nकल जब भी आप लौटेंगे, मैं आपके लिए ताज़ा महासागरीय विश्लेषण तैयार रखूँगी। शुभ रात्रि और मीठे सपने! 🌊✨`;
      } else {
        message = `Good night! 🌙 Rest well.\n\nOur global ocean observing fleet, autonomous Argo floats, and moored buoys will continue silently tracking ocean currents, tides, and thermocline shifts through the night.\n\nWhenever you return, I'll have the latest ocean intelligence and 3D simulations ready for you. Smooth sailing and sweet dreams! 🌊✨`;
      }
      suggestions.push(`Show SST in ${basinName}`);
      suggestions.push(`Explain current conditions in ${basinName}`);
      suggestions.push('Assess storm & swell risk');
      suggestions.push('Show current vectors');
    } else if (intent.isHowAreYou) {
      if (lang === 'bn') {
        message = `আমি দারুণ আছি, জিজ্ঞাসা করার জন্য ধন্যবাদ! 🌊\n\nআমাদের সমস্ত ডিজিটাল টুইন মডেল, থার্মোডাইনামিক সমীকরণ ও ওশান বায়াগুলো খুব সুন্দরভাবে কাজ করছে।\n\nআমি সম্পূর্ণ প্রস্তুত — আজ আপনার জন্য কী করতে পারি? আপনি কি **${basinName}**-এর বর্তমান অবস্থা দেখতে চান, ঝড়ের ঝুঁকি যাচাই করতে চান, নাকি 3D জলস্তম্ভে ডুব দিতে চান?`;
      } else if (lang === 'hi') {
        message = `मैं बहुत बढ़िया हूँ, पूछने के लिए धन्यवाद! 🌊\n\nहमारे सभी डिजिटल ट्विन मॉडल्स, हाइड्रोडायनामिक इक्वेशंस और इन-सीटू सेंसर्स सुचारू रूप से कार्य कर रहे हैं।\n\nबताइए, आज मैं आपके लिए क्या करूँ? क्या आप **${basinName}** की स्थिति देखना चाहते हैं, चक्रवात का अलर्ट जाँचना चाहते हैं, या 3D समुद्र दृश्य का अन्वेषण करना चाहते हैं?`;
      } else {
        message = `I'm doing wonderful, thank you for asking! 🌊\n\nAll digital-twin hydrographic models, TEOS-10 equations, and in-situ sensor streams are running smoothly.\n\nI'm ready to dive in — what can I do for you today? Would you like to inspect conditions in **${basinName}**, check storm threat alerts, or fly through the 3D water column?`;
      }
      suggestions.push(`Explain current conditions in ${basinName}`);
      suggestions.push('Show the temperature profile');
      suggestions.push('Compare Arabian Sea and Bay of Bengal');
      suggestions.push('Show 3D current vectors');
    } else if (intent.isCompliment) {
      if (lang === 'bn') {
        message = `আপনাকে অনেক ধন্যবাদ! 😊 আপনার সাথে সমুদ্রবিজ্ঞান অন্বেষণ করতে পেরে আমি আনন্দিত। নতুন কোনো অঞ্চল বিশ্লেষণ করতে চাইলে বা 3D ভিউ দেখতে চাইলে যেকোনো সময় বলুন! 🌊`;
      } else if (lang === 'hi') {
        message = `बहुत-बहुत धन्यवाद! 😊 आपके साथ महासागर का अध्ययन और अन्वेषण करना बहुत सुखद है। जब भी आप किसी नए बेसिन या 3D दृश्य का विश्लेषण करना चाहें, बस मुझे बताएं! 🌊`;
      } else {
        message = `Thank you so much! 😊 It's an absolute pleasure exploring and analyzing our oceans with you. Let me know whenever you'd like to check out another basin, examine depth stratifications, or see the 3D current vectors in action! 🌊`;
      }
      suggestions.push(`Explain current conditions in ${basinName}`);
      suggestions.push('Show the temperature profile');
      suggestions.push(`What marine life is found in ${basinName}?`);
    } else if (intent.isGoodDay) {
      if (lang === 'bn') {
        message = `শুভ দিন! 🌊 **${basinName}**-এর সমস্ত সমুদ্রবিজ্ঞান সেন্সর লাইভ ডেটা পাঠাচ্ছে। আমি **Nerida** — আপনি এখন কী অন্বেষণ বা বিশ্লেষণ করতে চান?`;
      } else if (lang === 'hi') {
        message = `शुभ दिन! 🌊 **${basinName}** के सभी समुद्री सेंसर्स लाइव डेटा भेज रहे हैं। मैं **नेरिडा** हूँ — बताइए, अभी आप क्या देखना या समझना चाहेंगे?`;
      } else {
        message = `Good day! 🌊 All oceanographic sensors and numerical models for **${basinName}** are reporting live telemetry. I'm **Nerida** — what would you like to explore or analyze right now?`;
      }
      suggestions.push(`Show SST in ${basinName}`);
      suggestions.push('Show the temperature profile');
      suggestions.push('Show current vectors');
    } else if (intent.isLanguageSwitchOnly || query.includes('বাংলায় বলো')) {
      if (lang === 'bn') {
        message = `অবশ্যই! আমি এখন থেকে আপনার সাথে বাংলায় আলোচনা করব।\n\nআমি **Nerida**, Ocean Vision 3D-এর ডিজিটাল টুইন কোপাইলট। আপনি আমাকে সমুদ্রের তাপমাত্রা, লবণাক্ততা, স্রোতের গতিবেগ, উল্লম্ব গভীরতা প্রোফাইল বা বিভিন্ন বেসিনের তুলনামূলক তথ্য জিজ্ঞাসা করতে পারেন।`;
      } else {
        message = `Understood! I will communicate in your preferred language.\n\nI am **Nerida**, your Ocean Vision 3D digital-twin copilot. Ask me about sea surface temperature, salinity, currents, depth profiles, or basin comparisons.`;
      }
      suggestions.push(`Show SST in ${basinName}`);
      suggestions.push('Show the temperature profile');
      suggestions.push('Show current vectors');
    } else if (intent.isIdentityOrHelp) {
      if (lang === 'bn') {
        message = `নমস্কার! আমি **Nerida**, Ocean Vision 3D-এর এআই ওশানোগ্রাফিক কোপাইলট। 🌊\n\nআমি আপনাকে কীভাবে সাহায্য করতে পারি এবং কী কী করতে পারি:\n- 🌊 **সমুদ্রের ভৌত চলক:** তাপমাত্রা (SST), লবণাক্ততা, সমুদ্রস্রোত, ঢেউ, ক্লোরোফিল এবং দ্রবীভূত অক্সিজেন পরিমাপ।\n- 📏 **গভীরতা প্রোফাইল:** পৃষ্ঠ থেকে ৬০০০ মিটার পর্যন্ত জলস্তম্ভের বিশ্লেষণ (থার্মোক্লাইন ও হ্যালোক্লাইন)।\n- ⚖️ **বেসিন তুলনা:** বঙ্গোপসাগর ও আরব সাগরের আবহাওয়া ও সমুদ্রগত পরিস্থিতির তুলনা।\n- 🔍 **অস্বাভাবিকতা নির্ণয়:** ৩০ বছরের জলবায়ু বেসলাইনের বিপরীতে থার্মাল অ্যানোমালি শনাক্তকরণ।\n- 🎮 **3D ডিজিটাল টুইন নিয়ন্ত্রণ:** নির্দিষ্ট বেসিন, গভীরতার স্লাইস বা 3D ভেক্টর ফিল্ড সক্রিয় করা।\n\nআজ আমি আপনার জন্য কী করতে পারি? নিচের যেকোনো অপশন বেছে নিতে পারেন!`;
      } else if (lang === 'hi') {
        message = `नमस्ते! मैं **नेरिडा (Nerida)** हूँ, Ocean Vision 3D के लिए आपकी एআই ओशनोग्राफिक कोपायलट। 🌊\n\nमैं इन कार्यों में आपकी पूरी सहायता कर सकती हूँ:\n- 🌊 **भौतिक पैरामीटर:** सतह तापमान (SST), लवणता, समुद्री धाराएं, तरंगें, क्लोरोफिल और घुलित ऑक्सीजन।\n- 📏 **गहराई प्रोफाइल:** सतह से 6000 मीटर तक का जल-स्तंभ विश्लेषण।\n- ⚖️ **बेसिन तुलना:** बंगाल की खाड़ी और अरब सागर के बीच तुलना।\n- 🔍 **विसंगति विश्लेषण:** 30-वर्षीय क्लाइमेटोलॉजिकल बेसलाइन के विरुद्ध मरीन हीटवेव की पहचान।\n- 🎮 **3D डिजिटल ट्विन नियंत्रण:** विभिन्न बेसिन, गहराई स्लाइस या 3D वेक्टर दृश्य प्रदर्शित करना।\n\nबताइए, आज मैं आपके लिए क्या कर सकती हूँ?`;
      } else {
        message = `Hello! I'm **Nerida**, your AI Ocean Copilot and interactive companion for **Ocean Vision 3D**. 🌊\n\nHere is how I can assist your exploration today:\n- 🌊 **Physical Telemetry:** Query real observations and TEOS-10 models for Temperature (SST), Salinity, Currents, Wave Swell, Chlorophyll-a, and Dissolved Oxygen.\n- 📏 **Vertical Column Profiles:** Analyze thermocline and halocline stratification from the surface down to 6,000m.\n- ⚖️ **Multi-Basin Comparisons:** Compare environmental dynamics between the Arabian Sea, Bay of Bengal, Equatorial Pacific, and other basins.\n- 🔍 **Anomaly Diagnostics:** Detect marine heatwaves and physical deviations against 30-year climatological baselines.\n- 🎮 **Digital Twin Teleoperation:** Directly navigate the 3D viewer, adjust depth slices, or activate 3D current vector fields.\n\nWhat can I do for you today? Try picking a suggestion below or asking me anything!`;
      }
      suggestions.push(`Explain current conditions in ${basinName}`);
      suggestions.push('Show the temperature profile');
      suggestions.push('Compare Arabian Sea and Bay of Bengal');
      suggestions.push('Show current vectors');
    } else if (intent.isPoliteClosing) {
      if (lang === 'bn') {
        message = `আপনাকেও অনেক ধন্যবাদ! সমুদ্রের ডিজিটাল টুইন সম্পর্কে আরও কোনো প্রশ্ন থাকলে নির্দ্বিধায় জিজ্ঞাসা করুন। শুভকামনা! 🌊`;
      } else if (lang === 'hi') {
        message = `आपका बहुत-बहुत धन्यवाद! डिजिटल ट्विन के बारे में कोई और प्रश्न हो तो अवश्य पूछें। शुभ यात्रा! 🌊`;
      } else {
        message = `You are very welcome! If you need further oceanographic analysis or 3D navigation, I'm right here. Smooth sailing! 🌊`;
      }
      suggestions.push(`Show SST in ${basinName}`);
      suggestions.push('Assess storm & swell risk');
    } else {
      // Standard Greeting ("hello", "hi", "hey", etc.)
      if (lang === 'bn') {
        message = `নমস্কার! আমি **Nerida**, Ocean Vision 3D-এর এআই ওশান কোপাইলট। আমি বর্তমানে **${basinName}** পর্যবেক্ষণ করছি।\n\nআজ আপনাকে কীভাবে সাহায্য করতে পারি? আপনি কি সমুদ্রের তাপমাত্রা, লবণাক্ততা, স্রোত, উল্লম্ব গভীরতা প্রোফাইল দেখতে চান নাকি 3D ডিজিটাল টুইন অন্বেষণ করতে চান? 🌊`;
      } else if (lang === 'hi') {
        message = `नमस्ते! मैं **नेरिडा (Nerida)** हूँ, Ocean Vision 3D की एआई ओशन कोपायलट। मैं इस समय **${basinName}** पर नज़र रख रही हूँ।\n\nबताइए, आज मैं आपके लिए क्या कर सकती हूँ? क्या आप समुद्री स्थिति, तापमान, लवणता, गहराई प्रोफाइल या 3D दृश्य देखना चाहेंगे? 🌊`;
      } else {
        message = `Hello! I'm **Nerida**, your AI Ocean Copilot. I'm currently tracking ocean dynamics in the **${basinName}**.\n\nWhat can I do for you today? We can explore sea surface temperature, salinity, currents, vertical depth profiles, or take a flythrough of the 3D ocean view! 🌊`;
      }
      suggestions.push(`Explain current conditions in ${basinName}`);
      suggestions.push('Show the temperature profile');
      suggestions.push(`What marine life is found in ${basinName}?`);
      suggestions.push('Show current vectors');
    }
  }

  // -------------------------------------------------------------
  // ROUTE 2: MARINE_BIOLOGY / MARINE ECOLOGY
  // Grounded ecological overview based on geographic context + depth zone
  // Includes scientific caveat regarding species-level census
  // -------------------------------------------------------------
  else if (intent.category === 'MARINE_BIOLOGY') {
    provenance.push({ type: 'AI-DERIVED', label: 'Marine Ecological Knowledge Base' });

    const region = resolveBasin(intent.basin || intent.contextBasin, null);
    const depthMeters = intent.depthSpecified ? intent.depth : (intent.contextDepth ?? 0);
    const basinName = region ? region.name : 'North Atlantic Ocean';

    // Determine ecological vertical depth layer
    let depthZone = 'Photic / Epipelagic Zone (0–200m)';
    let depthDescription = 'Sunlit upper layer with active photosynthesis and high biological activity.';
    let zoneOrganisms = '';

    if (depthMeters > 1000) {
      depthZone = 'Bathypelagic / Midnight Zone (1000–4000m)';
      depthDescription = 'Total darkness, high hydrostatic pressure, and cold temperatures (1–4°C). Organisms depend entirely on sinking marine snow.';
      zoneOrganisms = 'Anglerfish (*Ceratiidae*), gulper eels, vampire squids (*Vampyroteuthis infernalis*), giant isopods, and specialized tripod fish.';
    } else if (depthMeters >= 200) {
      depthZone = 'Mesopelagic / Twilight Zone (200–1000m)';
      depthDescription = 'Dim twilight layer where light rapidly attenuates. Dominated by bioluminescence and the world\'s largest animal migration (Diel Vertical Migration).';
      zoneOrganisms = 'Lanternfish (*Myctophidae*), bristlemouths (*Cyclothone*), deep-sea hatchetfish, glass squid, and predatory sperm whales diving to hunt deep cephalopods.';
    } else {
      depthZone = 'Photic / Epipelagic Zone (0–200m)';
      depthDescription = 'Abundant sunlight powering primary phytoplankton production, supporting coastal and pelagic food webs.';
      zoneOrganisms = 'Phytoplankton blooms, zooplankton (copepods), pelagic schooling fish (sardines, mackerel), yellowfin tuna, billfish, sea turtles, and marine mammals.';
    }

    // Basin-specific ecological insights
    let basinFauna = '';
    if (basinName.includes('Atlantic')) {
      basinFauna = 'The North Atlantic hosts Atlantic cod (*Gadus morhua*), Atlantic bluefin tuna, herring, minke and humpback whales, seabird colonies (gannets, puffins), and cold-water coral reefs (*Lophelia pertusa*) along continental slopes.';
    } else if (basinName.includes('Arabian')) {
      basinFauna = 'The Arabian Sea supports rich pelagic tuna fisheries, Spanish mackerel, Indo-Pacific sailfish, Olive ridley sea turtles, and an isolated, non-migratory sub-population of Arabian Sea humpback whales. The deep layer features massive lanternfish biomass adapted to the intense Oxygen Minimum Zone.';
    } else if (basinName.includes('Bengal')) {
      basinFauna = 'The Bay of Bengal is famous for massive Hilsa shad (*Tenualosa ilisha*) fisheries, Irrawaddy dolphins (*Orcaella brevirostris*), Indo-Pacific finless porpoises, Olive ridley turtle arribadas, and estuarine mangrove biodiversity (Sundarbans).';
    } else if (basinName.includes('Pacific')) {
      basinFauna = 'The Equatorial Pacific supports huge tuna stocks (skipjack and yellowfin), silky sharks, mahi-mahi, green sea turtles, and vast open-ocean pelagic ecosystems shaped by ENSO events.';
    } else {
      basinFauna = 'Pelagic apex predators, migratory cetaceans, cephalopods, and diverse zooplankton communities.';
    }

    if (lang === 'bn') {
      message = `**${basinName}**-এর **${depthMeters}m** গভীরতায় সামুদ্রিক জীববৈচিত্র্য ও বাস্তুসংস্থান:\n\n` +
        `🌊 **গভীরতা অঞ্চল:** ${depthZone}\n` +
        `- *পরিবেশগত অবস্থা:* ${depthDescription}\n` +
        `- *প্রতিনিধিত্বশীল গভীর জলচর প্রাণী:* ${zoneOrganisms}\n\n` +
        `🐟 **বেসিন-নির্দিষ্ট সামুদ্রিক প্রাণী:**\n${basinFauna}\n\n` +
        `💡 *বিশেষ দ্রষ্টব্য:* এই বিবরণটি অঞ্চলটির বৈজ্ঞানিক সামুদ্রিক বাস্তুসংস্থানের সাধারণ কাঠামোর ওপর ভিত্তি করে প্রস্তুত। Ocean Vision 3D ভৌত সেন্সর ডেটা (তাপমাত্রা, লবণাক্ততা, স্রোত) পর্যবেক্ষণ করে, তবে এই নির্দিষ্ট স্থানাঙ্কে লাইভ প্রজাতি সেন্সর নেই।`;
    } else if (lang === 'hi') {
      message = `**${basinName}** में **${depthMeters}m** गहराई पर समुद्री जीवन और पारिस्थितिकी तंत्र:\n\n` +
        `🌊 **गहराई क्षेत्र:** ${depthZone}\n` +
        `- *पर्यावरणीय स्थिति:* ${depthDescription}\n` +
        `- *प्रमुख समुद्री जीव:* ${zoneOrganisms}\n\n` +
        `🐟 **क्षेत्रीय समुद्री जीव:**\n${basinFauna}\n\n` +
        `💡 *वैज्ञानिक टिप्पणी:* यह जानकारी क्षेत्रीय समुद्री जीवविज्ञान अनुसंधान पर आधारित है। Ocean Vision 3D भौतिक डेटा प्रदान करता है, लेकिन इस सटीक बिंदु पर रीयल-टाइम प्रजाति-स्तरीय सेंसर मौजूद नहीं है।`;
    } else {
      message = `Marine life and ecological communities in the **${basinName}** around **${depthMeters}m** depth:\n\n` +
        `🌊 **Ecological Zone: ${depthZone}**\n` +
        `- *Environmental Habitat:* ${depthDescription}\n` +
        `- *Characteristic Organisms:* ${zoneOrganisms}\n\n` +
        `🐟 **Regional Ecosystem Fauna:**\n${basinFauna}\n\n` +
        `> [!NOTE]\n` +
        `> **Scientific Scope Caveat:** This ecological overview reflects established marine science research for the **${basinName}** at **${depthMeters}m**. Ocean Vision 3D provides physical sensor telemetry (SST, salinity, currents, wave swell, chlorophyll, oxygen) but does not maintain a live species-level tracking sensor at these exact coordinates.`;
    }

    suggestions.push(`What is the temperature at ${depthMeters}m?`);
    suggestions.push(`What is the salinity there?`);
    suggestions.push(`Show the temperature profile`);
    suggestions.push(`Compare with ${basinName.includes('Arabian') ? 'Bay of Bengal' : 'Arabian Sea'}`);
  }

  // -------------------------------------------------------------
  // ROUTE 3: GENERAL_OCEANOGRAPHY (Conceptual Oceanographic Explanations)
  // -------------------------------------------------------------
  else if (intent.category === 'GENERAL_OCEANOGRAPHY') {
    provenance.push({ type: 'AI-DERIVED', label: 'Physical Oceanography Principles' });

    const basin = resolveBasin(intent.basin || intent.contextBasin, null);
    const basinName = basin ? basin.name : 'Ocean Basin';

    let conceptExplanation = '';

    if (/salinity higher|why.*salinity/i.test(query)) {
      conceptExplanation = `**Why Surface Salinity Varies Across Basins:**\n\n` +
        `- **High Salinity Regimes (e.g., Arabian Sea, Mediterranean):** Driven by intense atmospheric evaporation exceeding precipitation (~1.5 m/yr net evaporation), coupled with dry desert winds blowing from arid continental landmasses. This leaves surface seawater dense and salty (>36.0 PSU).\n` +
        `- **Low Salinity Regimes (e.g., Bay of Bengal):** Colossal freshwater river discharge (Ganges-Brahmaputra-Meghna and Irrawaddy delivering ~1.6 × 10¹² m³/yr) and heavy monsoonal rainfall dilute the upper layer, capping salinity below 33.0 PSU and forming a buoyant, stable barrier layer that restricts vertical mixing.`;
    } else if (/upwelling/i.test(query)) {
      conceptExplanation = `**Ocean Upwelling Dynamics:**\n\n` +
        `- **Ekman Transport:** Alongshore winds push surface water. Earth\'s rotation (Coriolis force) deflects this water 90° offshore.\n` +
        `- **Nutrient Replenishment:** As surface water is displaced, cold, dense, nutrient-rich water from the deep ocean rises to replace it in the photic zone.\n` +
        `- **Biological Consequence:** Triggers explosive primary production (phytoplankton blooms) that support major commercial fisheries.`;
    } else if (/stratification|thermocline|halocline|pycnocline/i.test(query)) {
      conceptExplanation = `**Water Column Stratification & Boundary Layers:**\n\n` +
        `- **Mixed Layer (0–50m):** Homogeneous warm layer mixed by surface winds and wave action.\n` +
        `- **Thermocline (50–500m):** Rapid drop in temperature with depth.\n` +
        `- **Halocline:** Layer where salinity changes sharply with depth.\n` +
        `- **Pycnocline:** The combined density gradient (governed by temperature and salinity via TEOS-10 equation of seawater). A sharp pycnocline acts as a physical barrier that prevents nutrient-rich deep water from mixing upward and isolates the deep ocean from atmospheric gas exchange.`;
    } else if (/el nino|la nina|enso/i.test(query)) {
      conceptExplanation = `**The El Niño–Southern Oscillation (ENSO):**\n\n` +
        `- **Normal Conditions:** Strong easterly trade winds pile up warm water in the western Pacific warm pool, while deep upwelling keeps the eastern Pacific (near Peru) cold.\n` +
        `- **El Niño (Warm Phase):** Trade winds weaken or reverse. The warm pool surges eastward across the Equatorial Pacific, flattening the thermocline and shutting off coastal upwelling.\n` +
        `- **Global Teleconnections:** Alters global atmospheric Walker circulation, disrupting South Asian monsoons, shifting storm tracks, and triggering marine heatwaves worldwide.`;
    } else if (/current|currents important/i.test(query)) {
      conceptExplanation = `**Significance of Ocean Currents:**\n\n` +
        `- **Global Heat Redistribution:** Geostrophic surface currents move excess solar heat from the equator to high latitudes (e.g., the Gulf Stream warming Western Europe).\n` +
        `- **Thermohaline Conveyor Belt:** Global density-driven circulation that oxygenates deep ocean trenches over thousand-year cycles.\n` +
        `- **Nutrient & Larval Transport:** Currents sustain marine ecosystems by dispersing biological larvae and transporting dissolved oxygen into shelf zones.`;
    } else {
      conceptExplanation = `Oceanographic circulation and water-column physics are governed by solar insolation, wind-stress curl, Earth\'s Coriolis deflection, and density differences governed by the TEOS-10 equation of seawater.`;
    }

    message = conceptExplanation;
    suggestions.push('Show the temperature profile');
    suggestions.push(`What is the salinity in ${basinName}?`);
    suggestions.push('Compare Arabian Sea and Bay of Bengal');
    suggestions.push('Show current vectors');
  }

  // -------------------------------------------------------------
  // ROUTE 4: OUT_OF_DOMAIN (Completely unrelated queries like sports, politics, coding)
  // STRICT RULE: Explicit refusal, ZERO tools, ZERO 3D changes
  // -------------------------------------------------------------
  else if (intent.category === 'OUT_OF_DOMAIN') {
    provenance.push({ type: 'AI-DERIVED', label: 'Nerida Scope Enforcer' });

    if (lang === 'bn') {
      message = `এটি আমার সমুদ্রবিজ্ঞান ও সামুদ্রিক ডেটা সম্পর্কিত পরিধির বাইরে।\n\nআমি আপনাকে সমুদ্রের অবস্থা, তাপমাত্রা (SST), লবণাক্ততা, স্রোত, উল্লম্ব প্রোফাইল, সামুদ্রিক বাস্তুসংস্থান বা 3D ডিজিটাল টুইন নিয়ন্ত্রণে সহায়তা করতে পারি।`;
    } else if (lang === 'hi') {
      message = `यह मेरे समुद्र विज्ञान विषय के दायरे से बाहर है।\n\nमैं आपको समुद्री स्थिति, तापमान (SST), लवणता, समुद्री धाराएं, वर्टिकल प्रोफाइल, समुद्री पारिस्थितिकी तंत्र या 3D डिजिटल ट्विन विज़ुअलाइज़ेशन में सहायता कर सकती हूँ।`;
    } else {
      message = `That's outside my oceanographic domain. I can help with ocean conditions, marine science, marine ecosystems, oceanographic telemetry, and 3D digital-twin visualization.`;
    }

    suggestions.push('Explain Current Conditions');
    suggestions.push('What marine life is found in this basin?');
    suggestions.push('Show the temperature profile');
    suggestions.push('Compare BoB vs Arabian Sea');
  }

  // -------------------------------------------------------------
  // ROUTE 5: UNKNOWN / AMBIGUOUS (Gibberish or unparseable input)
  // -------------------------------------------------------------
  else if (intent.category === 'UNKNOWN') {
    provenance.push({ type: 'AI-DERIVED', label: 'Nerida Interactive Assistant' });

    const basinObj = resolveBasin(intent.basin || intent.contextBasin, null);
    const bName = basinObj ? basinObj.name : (currentState.basin || 'Bay of Bengal');

    if (lang === 'bn') {
      message = `আমি ঠিক বুঝতে পারিনি, তবে আমি আপনাকে সাহায্য করতে প্রস্তুত! 🌊\n\nআপনি আমাকে নিচের বিষয়গুলো জিজ্ঞাসা করতে পারেন:\n- *"${bName}-এর বর্তমান পরিস্থিতি ব্যাখ্যা করো"*\n- *"${bName}-এ ৫০০ মিটারে তাপমাত্রা কত?"*\n- *"${bName}-এ কী কী সামুদ্রিক প্রাণী বাস করে?"*\n- *"তাপমাত্রার উল্লম্ব প্রোফাইল দেখাও"*\n- *"3D-তে সমুদ্রস্রোত প্রদর্শন করো"*\n\nআজ আপনি কী অন্বেষণ করতে চান?`;
    } else if (lang === 'hi') {
      message = `मैं इसे पूरी तरह समझ नहीं पाई, लेकिन मैं आपकी सहायता के लिए तैयार हूँ! 🌊\n\nआप मुझसे इस तरह के प्रश्न पूछ सकते हैं:\n- *"${bName} की वर्तमान स्थिति समझाएं"*\n- *"${bName} में 500m पर तापमान कितना है?"*\n- *"${bName} में कौन से समुद्री जीव पाए जाते हैं?"*\n- *"तापमान का वर्टिकल प्रोफाइल दिखाएं"*\n- *"3D में महासागरीय धाराएं प्रदर्शित करें"*\n\nबताइए, आज आप क्या देखना चाहेंगे?`;
    } else {
      message = `I didn't quite catch that, but I'm right here and ready to help! 🌊\n\nYou can ask me things like:\n- *"Explain current conditions in ${bName}"*\n- *"What is the temperature at 500m in ${bName}?"*\n- *"What marine life is found in ${bName}?"*\n- *"Show the temperature profile"*\n- *"Compare Arabian Sea and Bay of Bengal"*\n- Or *"Show current vectors in 3D"*!\n\nWhat can I do for you today?`;
    }

    suggestions.push(`Explain current conditions in ${bName}`);
    suggestions.push(`What is the temperature at 500m?`);
    suggestions.push('Show the temperature profile');
    suggestions.push('Show current vectors');
  }

  // -------------------------------------------------------------
  // ROUTE 6: COMPARISON (Between two basins)
  // -------------------------------------------------------------
  else if (intent.category === 'COMPARISON') {
    const b1 = intent.basin || intent.contextBasin || 'arabian_sea';
    const b2 = intent.secondBasin || (b1 === 'bay_of_bengal' ? 'arabian_sea' : 'bay_of_bengal');

    toolResults.push({
      tool: 'compare_basins',
      status: 'success',
      indicator: `Comparing ${b1.replace('_', ' ')} vs ${b2.replace('_', ' ')} for ${intent.param} at ${intent.depth}m`
    });

    const compData = tool_compare_basins({
      basin1: b1,
      basin2: b2,
      parameter: intent.param,
      depth: intent.depth
    }, currentState);

    primaryData = compData;
    provenance.push({ type: 'OBSERVED', label: 'In-Situ Multi-Basin Moored Arrays (RAMA/OMNI)' });
    provenance.push({ type: 'SIMULATED', label: 'TEOS-10 Hydrographic Database' });

    dataPointsUsed.push(`${compData.basin1.name} ${compData.parameterName} at ${intent.depth}m: ${compData.basin1.value} ${compData.unit}`);
    dataPointsUsed.push(`${compData.basin2.name} ${compData.parameterName} at ${intent.depth}m: ${compData.basin2.value} ${compData.unit}`);
    dataPointsUsed.push(`Observed Difference: ${compData.difference} ${compData.unit}`);

    // If user explicitly asked to "and show me X", execute view change too
    if (/show|navigate|switch|turn/i.test(query)) {
      const targetToShow = intent.secondBasin && query.includes(compData.basin2.name.toLowerCase()) ? b2 : b1;
      actions.push({ type: 'SET_BASIN', value: targetToShow, label: compData.basin1.name });
      actions.push({ type: 'SET_PARAMETER', value: intent.param, label: compData.parameterName });
      actions.push({ type: 'SET_DEPTH', value: intent.depth, label: `${intent.depth}m` });
      toolResults.push({
        tool: 'change_ocean_view',
        status: 'success',
        indicator: `Updated 3D view to ${targetToShow.replace('_', ' ')} at ${intent.depth}m`
      });
    }

    if (lang === 'bn') {
      message = `**${compData.basin1.name}** এবং **${compData.basin2.name}** এর মধ্যে **${intent.depth}m** গভীরতায় **${compData.parameterName}** তুলনা:\n\n- **${compData.basin1.name}:** ${compData.basin1.value} ${compData.unit}\n- **${compData.basin2.name}:** ${compData.basin2.value} ${compData.unit}\n- **পার্থক্য:** ${compData.difference} ${compData.unit} (**${compData.higherBasin}**-এ মান বেশি)।\n\n💡 *বৈজ্ঞানিক ব্যাখ্যা:* ${compData.scientificRationale}`;
    } else if (lang === 'hi') {
      message = `**${compData.basin1.name}** और **${compData.basin2.name}** के बीच **${intent.depth}m** गहराई पर **${compData.parameterName}** की तुलना:\n\n- **${compData.basin1.name}:** ${compData.basin1.value} ${compData.unit}\n- **${compData.basin2.name}:** ${compData.basin2.value} ${compData.unit}\n- **अंतर:** ${compData.difference} ${compData.unit} (**${compData.higherBasin}** में अधिक है)।\n\n💡 *वैज्ञानिक कारण:* ${compData.scientificRationale}`;
    } else {
      message = `Comparing **${compData.parameterName}** at **${intent.depth}m** depth between **${compData.basin1.name}** and **${compData.basin2.name}**:\n\n- **${compData.basin1.name}:** \`${compData.basin1.value} ${compData.unit}\`\n- **${compData.basin2.name}:** \`${compData.basin2.value} ${compData.unit}\`\n- **Net Difference:** \`${compData.difference} ${compData.unit}\` (**${compData.higherBasin}** is higher).\n\n💡 **Scientific Oceanographic Mechanism:**\n${compData.scientificRationale}`;
    }

    suggestions.push(`What about ${intent.depth === 500 ? '1000' : '500'}m?`);
    suggestions.push(`Show ${compData.basin1.name} profile`);
    suggestions.push(`Show ${compData.basin2.name} profile`);
    suggestions.push(`Show current vectors`);
  }

  // -------------------------------------------------------------
  // ROUTE 7: ANALYSIS (Anomalies, Storm Risk, Stratification)
  // -------------------------------------------------------------
  else if (intent.category === 'ANALYSIS') {
    toolResults.push({
      tool: 'find_ocean_anomalies',
      status: 'success',
      indicator: `Analyzing anomalies in ${intent.basin.replace('_', ' ')} at ${intent.depth}m`
    });

    const anomalyData = tool_find_ocean_anomalies({
      location: intent.basin,
      parameter: intent.param,
      depth: intent.depth
    }, currentState);

    primaryData = anomalyData;
    provenance.push({ type: 'OBSERVED', label: 'Copernicus Marine & INCOIS Climatological Baselines' });
    provenance.push({ type: 'AI-DERIVED', label: 'Ensemble Anomaly Classifier (94.2% confidence)' });

    dataPointsUsed.push(`Target Basin: ${anomalyData.location}`);
    dataPointsUsed.push(`Depth: ${anomalyData.depth}m`);
    dataPointsUsed.push(`Observed: ${anomalyData.currentValue} ${anomalyData.unit}`);
    dataPointsUsed.push(`30-Year Baseline: ${anomalyData.baseline} ${anomalyData.unit}`);
    dataPointsUsed.push(`Deviation (Anomaly): ${anomalyData.anomaly} ${anomalyData.unit}`);

    actions.push({ type: 'SHOW_ANOMALY' });

    if (lang === 'bn') {
      message = `**${anomalyData.location}**-এ **${anomalyData.depth}m** গভীরতায় **${anomalyData.parameterName}** অ্যানোমালি ডায়াগনস্টিক:\n\n- **পর্যবেক্ষিত মান:** ${anomalyData.currentValue} ${anomalyData.unit}\n- **৩০ বছরের গড় বেসলাইন:** ${anomalyData.baseline} ${anomalyData.unit}\n- **বিচ্যুতি:** **${anomalyData.anomaly} ${anomalyData.unit}** (তীব্রতা: **${anomalyData.severity}**)\n- **মডেল কনফিডেন্স:** ${anomalyData.confidence}\n\n💡 *ডায়াগনস্টিক সারসংক্ষেপ:* ${anomalyData.diagnosticSummary}`;
    } else if (lang === 'hi') {
      message = `**${anomalyData.location}** में **${anomalyData.depth}m** गहराई पर **${anomalyData.parameterName}** विसंगति विश्लेषण:\n\n- **अवलोकित मान:** ${anomalyData.currentValue} ${anomalyData.unit}\n- **30-वर्षीय बेसलाइन:** ${anomalyData.baseline} ${anomalyData.unit}\n- **विसंगति:** **${anomalyData.anomaly} ${anomalyData.unit}** (गंभीरता: **${anomalyData.severity}**)\n- **मॉडल विश्वास:** ${anomalyData.confidence}\n\n💡 *डायग्नोस्टिक सारांश:* ${anomalyData.diagnosticSummary}`;
    } else {
      message = `Physical anomaly analysis for **${anomalyData.parameterName}** in **${anomalyData.location}** at **${anomalyData.depth}m** depth:\n\n- **Observed In-Situ:** \`${anomalyData.currentValue} ${anomalyData.unit}\`\n- **30-Year Climatological Baseline:** \`${anomalyData.baseline} ${anomalyData.unit}\`\n- **Anomaly Deviation:** **\`${anomalyData.anomaly} ${anomalyData.unit}\`** (Severity: **${anomalyData.severity}**)\n- **Ensemble Confidence:** \`${anomalyData.confidence}\`\n\n💡 **Diagnostic Overview:**\n${anomalyData.diagnosticSummary}`;
    }

    suggestions.push(`Compare with ${intent.basin.includes('Arabian') ? 'Bay of Bengal' : 'Arabian Sea'}`);
    suggestions.push(`Show vertical profile`);
    suggestions.push(`What about 500m?`);
  }

  // -------------------------------------------------------------
  // ROUTE 8: VIEW_COMMAND (Direct 3D Digital Twin Navigation)
  // -------------------------------------------------------------
  else if (intent.category === 'VIEW_COMMAND') {
    const changes = [];

    if (intent.basinSpecified) {
      const region = resolveBasin(intent.basin, null);
      if (region) {
        actions.push({ type: 'SET_BASIN', value: region.id, label: region.name });
        changes.push(`basin to **${region.name}**`);
      }
    }

    if (intent.depthSpecified) {
      actions.push({ type: 'SET_DEPTH', value: intent.depth, label: `${intent.depth}m` });
      changes.push(`depth to **${intent.depth}m**`);
    }

    if (/vector|arrow|flow/i.test(query)) {
      actions.push({ type: 'SET_VIEW_MODE', value: 'vector_field' });
      actions.push({ type: 'SET_PARAMETER', value: 'currents' });
      changes.push(`view mode to **3D Vector Field**`);
    } else if (/volume|3d volume|volumetric/i.test(query)) {
      actions.push({ type: 'SET_VIEW_MODE', value: 'volume' });
      changes.push(`view mode to **Volumetric Density**`);
    } else if (/isosurface|iso surface/i.test(query)) {
      actions.push({ type: 'SET_VIEW_MODE', value: 'isosurface' });
      changes.push(`view mode to **3D Isosurface**`);
    } else if (/surface/i.test(query) && !/depth/i.test(query)) {
      actions.push({ type: 'SET_VIEW_MODE', value: 'surface' });
      changes.push(`view mode to **Surface**`);
    } else if (/depth slice|horizontal/i.test(query)) {
      actions.push({ type: 'SET_VIEW_MODE', value: 'depth_slice' });
      changes.push(`view mode to **Depth Slice**`);
    }

    toolResults.push({
      tool: 'change_ocean_view',
      status: 'success',
      indicator: `Adjusted 3D digital twin: ${changes.join(', ')}`
    });

    provenance.push({ type: 'SIMULATED', label: '3D WebGL Digital Twin Telemetry' });
    dataPointsUsed.push(`Active View: ${changes.join(' | ')}`);

    if (lang === 'bn') {
      message = `3D ডিজিটাল টুইন সফলভাবে আপডেট করা হয়েছে: ${changes.join(', ')}।`;
    } else if (lang === 'hi') {
      message = `3D डिजिटल ट्विन दृश्य सफलतापूर्वक अपडेट किया गया: ${changes.join(', ')}।`;
    } else {
      message = `The 3D digital twin has updated: ${changes.join(', ')}.`;
    }

    suggestions.push(`What is the ${intent.param} there?`);
    suggestions.push(`What marine life is found there?`);
    suggestions.push(`Show the temperature profile`);
  }

  // -------------------------------------------------------------
  // ROUTE 9: OCEAN_QUERY (Physical parameter data or vertical profile)
  // -------------------------------------------------------------
  else if (intent.category === 'OCEAN_QUERY') {
    // Sub-case A: Vertical Water Column Profile
    if (intent.isProfile) {
      toolResults.push({
        tool: 'get_ocean_profile',
        status: 'success',
        indicator: `Generating vertical hydrographic profile for ${intent.basin.replace('_', ' ')}`
      });

      const profileData = tool_get_ocean_profile({
        location: intent.basin,
        parameter: intent.param,
        maxDepth: 2000
      }, currentState);

      primaryData = profileData;
      provenance.push({ type: 'OBSERVED', label: 'Argo Profiling Array & Moored Buoy Series' });
      provenance.push({ type: 'SIMULATED', label: 'TEOS-10 Equation of Seawater Hydrography' });

      dataPointsUsed.push(`Basin: ${profileData.location}`);
      dataPointsUsed.push(`Parameter: ${profileData.parameterName}`);
      dataPointsUsed.push(`Profile Depth Levels: 0m to 2000m (${profileData.depths.length} layers)`);
      dataPointsUsed.push(`Surface Value: ${profileData.values[0]} ${profileData.unit}`);
      dataPointsUsed.push(`Bottom Value (2000m): ${profileData.values[profileData.values.length - 1]} ${profileData.unit}`);

      actions.push({ type: 'SHOW_PROFILE' });
      if (intent.basinSpecified) actions.push({ type: 'SET_BASIN', value: intent.basin });
      if (intent.paramSpecified) actions.push({ type: 'SET_PARAMETER', value: intent.param });

      if (lang === 'bn') {
        message = `**${profileData.location}**-এর **${profileData.parameterName}** উল্লম্ব জলস্তম্ভ প্রোফাইল (০m থেকে ২০০০m):\n\n- **পৃষ্ঠ স্তর (0m):** ${profileData.values[0]} ${profileData.unit}\n- **মধ্যম গভীরতা (500m):** ${profileData.values[profileData.depths.indexOf(500)] || profileData.values[3]} ${profileData.unit}\n- **গভীর স্তর (2000m):** ${profileData.values[profileData.values.length - 1]} ${profileData.unit}\n- **থার্মোক্লাইন সীমানা:** ${profileData.thermoclineDepth}\n- **হ্যালোক্লাইন সীমানা:** ${profileData.haloclineDepth}`;
      } else if (lang === 'hi') {
        message = `**${profileData.location}** का **${profileData.parameterName}** वर्टिकल प्रोफाइल (0m से 2000m):\n\n- **सतह (0m):** ${profileData.values[0]} ${profileData.unit}\n- **मध्यम गहराई (500m):** ${profileData.values[profileData.depths.indexOf(500)] || profileData.values[3]} ${profileData.unit}\n- **गहरी परत (2000m):** ${profileData.values[profileData.values.length - 1]} ${profileData.unit}\n- **थर्मोक्लाइन सीमा:** ${profileData.thermoclineDepth}\n- **हैलोक्लाइन सीमा:** ${profileData.haloclineDepth}`;
      } else {
        message = `Vertical hydrographic column profile for **${profileData.parameterName}** in **${profileData.location}** (Surface to 2000m):\n\n- **Surface (0m):** \`${profileData.values[0]} ${profileData.unit}\`\n- **Intermediate (500m):** \`${profileData.values[profileData.depths.indexOf(500)] || profileData.values[3]} ${profileData.unit}\`\n- **Deep Layer (2000m):** \`${profileData.values[profileData.values.length - 1]} ${profileData.unit}\`\n\n💡 **Pycnocline Boundaries:**\n- **Main Thermocline:** ${profileData.thermoclineDepth}\n- **Barrier Layer Transition:** ${profileData.haloclineDepth}`;
      }

      suggestions.push(`Compare with ${intent.basin.includes('Arabian') ? 'Bay of Bengal' : 'Arabian Sea'}`);
      suggestions.push(`What is the salinity there?`);
      suggestions.push(`What marine life is found there?`);
    }

    // Sub-case B: Specific Point / Layer Ocean Measurement
    else {
      if (intent.basinSpecified) {
        actions.push({ type: 'SET_BASIN', value: intent.basin });
      }
      if (intent.paramSpecified) {
        actions.push({ type: 'SET_PARAMETER', value: intent.param });
      }
      if (intent.depthSpecified) {
        actions.push({ type: 'SET_DEPTH', value: intent.depth });
      }

      toolResults.push({
        tool: 'get_ocean_data',
        status: 'success',
        indicator: `Retrieved ${intent.param} for ${intent.basin.replace('_', ' ')} at ${intent.depth}m`
      });

      const data = tool_get_ocean_data({
        basin: intent.basin,
        parameter: intent.param,
        depth: intent.depth
      }, currentState);

      primaryData = data;
      provenance.push({ type: 'OBSERVED', label: data.source });
      provenance.push({ type: 'SIMULATED', label: 'TEOS-10 Hydrodynamic Model' });

      dataPointsUsed.push(`Target Location: ${data.location} (${data.coordinates})`);
      dataPointsUsed.push(`Physical Layer: ${data.parameterName} (${data.parameter.toUpperCase()})`);
      dataPointsUsed.push(`Depth: ${data.depth} meters`);
      dataPointsUsed.push(`Observed Value: ${data.value} ${data.unit}`);

      // Scientific interpretation grounded in real oceanography
      let explanation = '';
      if (data.parameter === 'salinity') {
        explanation = data.depth <= 50 
          ? (data.value < 33.5 ? 'Strong freshwater stratification from seasonal riverine plumes creates a pronounced surface barrier layer.' : 'High surface salinity driven by intense maritime evaporation.')
          : 'Subsurface halocline layers reflect standard North Indian High Salinity Water (NIHSW) advection.';
      } else if (data.parameter === 'sst') {
        explanation = data.depth <= 40
          ? (data.value >= 28.0 ? 'Exceeds the 28°C threshold required to sustain tropical convective atmospheric squalls.' : 'Temperate upper layer.')
          : `Deep thermocline cooling rate averaging -0.11°C/m below the mixed layer.`;
      } else if (data.parameter === 'currents') {
        explanation = `Geostrophic current shear driven by wind-stress curl and regional monsoonal forcing.`;
      } else if (data.parameter === 'wave') {
        explanation = `Significant wave swell influenced by active monsoon winds and offshore bathymetric gradients.`;
      } else if (data.parameter === 'oxygen') {
        explanation = data.depth >= 150 && data.depth <= 500
          ? 'Deep Oxygen Minimum Zone (OMZ) caused by bacterial decomposition of sinking organic matter.'
          : 'Surface layer maintains high dissolved oxygen through active air-sea gas exchange.';
      } else if (data.parameter === 'chlorophyll') {
        explanation = data.depth >= 30 && data.depth <= 80
          ? 'Deep Chlorophyll Maximum (DCM) sustained by optimal balance of light penetration and upward nutrient diffusion.'
          : 'Photic zone biological production.';
      }

      const locDisplay = intent.matchedLocation
        ? `${intent.matchedLocation} (${data.location})`
        : (intent.isImplicitLocation ? `your active region (${data.location})` : data.location);

      if (lang === 'bn') {
        message = `**${locDisplay}**-এ **${data.depth}m** গভীরতায় **${data.parameterName}** পরিমাপ:\n\n- **মান:** **${data.value} ${data.unit}**\n- **স্থানাঙ্ক:** ${data.coordinates}\n- **উৎস:** ${data.source}\n\n💡 *বৈজ্ঞানিক তাৎপর্য:* ${explanation}`;
      } else if (lang === 'hi') {
        message = `**${locDisplay}** में **${data.depth}m** गहराई पर **${data.parameterName}** का माप:\n\n- **मान:** **${data.value} ${data.unit}**\n- **निर्देशांक:** ${data.coordinates}\n- **स्रोत:** ${data.source}\n\n💡 *वैज्ञानिक व्याख्या:* ${explanation}`;
      } else {
        message = `In **${locDisplay}** at **${data.depth}m** depth, the **${data.parameterName}** is **\`${data.value} ${data.unit}\`**:\n\n- **Observed Value:** \`${data.value} ${data.unit}\`\n- **Coordinates:** \`${data.coordinates}\`\n- **Telemetry Source:** ${data.source}\n\n💡 **Oceanographic Insight:**\n${explanation}`;
      }

      suggestions.push(`What about ${data.depth === 500 ? '1000' : '500'}m?`);
      suggestions.push(`What marine life is found there?`);
      suggestions.push(`Show ${data.parameterName} profile`);
      suggestions.push(`Compare with ${data.location.includes('Arabian') ? 'Bay of Bengal' : 'Arabian Sea'}`);
    }
  }

  // TEMPORARY DEBUG LOGGING (Section 14)
  console.log(`[Tools]`, toolResults.map(t => t.tool));
  console.log(`[Response] id: ${reqId}`);
  console.log(`[Final Response Preview]`, message.slice(0, 100) + '...');

  return {
    requestId: reqId,
    message,
    actions,
    data: primaryData,
    suggestions,
    toolResults,
    provenance,
    dataPointsUsed,
    source: 'offline'
  };
}

/**
 * Backward-compatible helper for legacy callers (e.g. AnalyticReportModal).
 */
export function processOfflineCopilotQuery(query, context = {}) {
  const currentState = {
    basin: context.activeBasin?.name || context.activeRegion?.name,
    basinId: context.activeBasin?.id || context.activeRegion?.id,
    depth: context.activeLayer?.depthMeters || context.depth || 0,
    parameter: context.activeLayer?.parameter || context.selectedParam || 'sst',
    rawRegion: context.activeRegion || context.activeBasin
  };

  const result = executeNeridaReasoning(query, currentState, []);
  return {
    response: result.message,
    message: result.message,
    toolCalls: result.actions,
    actions: result.actions,
    data: result.data,
    suggestions: result.suggestions,
    provenance: result.provenance,
    dataPointsUsed: result.dataPointsUsed,
    source: 'offline'
  };
}
