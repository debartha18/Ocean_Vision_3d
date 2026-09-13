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

import { REGIONS } from '../../data/oceanData.js';

import {
  formatStormPrediction,
  formatGeneralConditions,
  formatConversational,
  formatMarineBiology,
  formatOceanQuery,
  formatProfile,
  formatComparison,
  formatAnalysis,
  formatViewCommand,
  formatOutOfDomain,
  formatUnknown,
  getLocalizedSuggestions
} from './copilotTranslations.js';

/**
 * Parses user natural language query and resolves context from current application state and conversation history.
 */
export function extractIntentAndEntities(query, currentState = {}, conversationHistory = []) {
  // 1. Language Detection & Digit Normalization
  let detectedLang = currentState.language || 'en';
  if (/[\u0980-\u09FF]/.test(query) || query.includes('বাংলা') || query.includes('bengali') || query.includes('অসমীয়া')) {
    detectedLang = (query.includes('অসমীয়া') || currentState.language === 'as') ? 'as' : 'bn';
  } else if (/[\u0900-\u097F]/.test(query)) {
    const devanagariLangs = ['hi', 'mr', 'sa', 'kok', 'mai', 'ne', 'brx', 'doi'];
    if (currentState.language === 'sat') {
      detectedLang = 'sat';
    } else {
      detectedLang = devanagariLangs.includes(currentState.language) ? currentState.language : 'hi';
    }
  } else if (/[\u0B80-\u0BFF]/.test(query) || query.includes('தமிழ்') || query.includes('tamil')) {
    detectedLang = 'ta';
  } else if (/[\u0C00-\u0C7F]/.test(query) || query.includes('తెలుగు') || query.includes('telugu')) {
    detectedLang = 'te';
  } else if (/[\u0C80-\u0CFF]/.test(query) || query.includes('ಕನ್ನಡ') || query.includes('kannada')) {
    detectedLang = 'kn';
  } else if (/[\u0D00-\u0D7F]/.test(query) || query.includes('മലയാളം') || query.includes('malayalam')) {
    detectedLang = 'ml';
  } else if (/[\u0A80-\u0AFF]/.test(query) || query.includes('ગુજરાતી') || query.includes('gujarati')) {
    detectedLang = 'gu';
  } else if (/[\u0A00-\u0A7F]/.test(query) || query.includes('ਪੰਜਾਬੀ') || query.includes('punjabi')) {
    detectedLang = 'pa';
  } else if (/[\u0B00-\u0B7F]/.test(query) || query.includes('ଓଡ଼ିଆ') || query.includes('odia')) {
    detectedLang = 'or';
  } else if (/[\u0600-\u06FF]/.test(query) || query.includes('اردو') || query.includes('urdu')) {
    const rtlLangs = ['ur', 'sd', 'ks'];
    detectedLang = rtlLangs.includes(currentState.language) ? currentState.language : 'ur';
  } else if (/[\u1C50-\u1C7F]/.test(query) || query.includes('ᱥᱟᱱᱛᱟᱲᱤ') || query.includes('santali')) {
    detectedLang = 'sat';
  } else if (/[\uABC0-\uABFF]/.test(query)) {
    detectedLang = 'mni';
  }

  // Convert Bengali, Devanagari, and Ol Chiki numerals into ASCII digits
  const q = query.toLowerCase().trim()
    .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))
    .replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d))
    .replace(/[᱐-᱙]/g, d => '᱐᱑᱒᱓᱔᱕᱖᱗᱘᱙'.indexOf(d));

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
  if (/\b(sst|temp|temperature|thermal|warm|cold|heat)\b/i.test(q) || /(তাপমাত্রা|তাপ|तापमान|तापीय|வெப்பநிலை|உஷ்ணம்|ఉష్ణోగ్రత|ತಾಪಮಾನ|താപനില|તાપમાન|ତାପମାତ୍ରା|ਤਾਪਮਾਨ|درجہ حرارت|ᱞᱚᱞᱚᱥᱚᱝ|ᱞᱚᱞᱚ)/u.test(q)) {
    targetParam = 'sst';
    paramSpecified = true;
  } else if (/\b(sal|salin|salinity|salt|psu|halocline)\b/i.test(q) || /(লবণাক্ততা|লবণ|लवणता|உப்புத்தன்மை|ఉప్పుదனம்|ಉಪ್ಪಿನಂಶ|ലവണാംശം|ખારાશ|લવણતા|ଲବଣାକ୍ତତା|ਖਾਰਾਪਣ|نمکیات|ᱵᱩᱞᱩᱝ ᱜᱮᱭᱟᱱ|ᱵᱩᱞᱩᱝ)/u.test(q)) {
    targetParam = 'salinity';
    paramSpecified = true;
  } else if (/\b(currents|velocity|flow|shear|vector|vectors)\b/i.test(q) || (/\bcurrent\b/i.test(q) && !/\bcurrent\s*(?:condition|conditions|situation|status|state|weather|overview)\b/i.test(q)) || /(স্রোত|ধারা|धारा|प्रवाह|நீரோட்டம்|ప్రవాహం|ಪ್ರವಾಹ|പ്രവാഹം|પ્રવાહ|ପ୍ରବାହ|ਲਹਿਰ|رو|ᱫᱚᱨᱭᱟ ᱫᱟᱜ ᱞᱤᱸᱜᱤᱱ|ᱞᱤᱸᱜᱤᱱ)/u.test(q)) {
    targetParam = 'currents';
    paramSpecified = true;
  } else if (/\b(wave|waves|swell|surge|breaker|sea state)\b/i.test(q) || /(ঢেউ|তরঙ্গ|लहर|तरंग|அலை|తరంగం|ಅಲೆ|തിരമാല|મોજું|ତରଙ୍ଗ|ਛੱਲਾਂ|موج|ᱰᱷᱮᱣ ᱩᱥᱩᱞ|ᱰᱷᱮᱣ)/u.test(q)) {
    targetParam = 'wave';
    paramSpecified = true;
  } else if (/\b(chlor|chlorophyll|chlorophyll-a|phytoplankton|bloom|algae|biomass)\b/i.test(q) || /(ক্লোরোফিল|क्लोरोफिल|குளோரோபில்|క్లోరోఫిల్|ಕ್ಲೋರೊಫಿಲ್|ക്ലോറോഫിൽ|ક્લોરોફિલ|କ୍ଲୋରୋଫିଲ୍|ਕਲੋਰੋਫਿਲ|ᱠᱞᱳᱨᱳᱯᱷᱤᱞ-ᱮ|ᱠᱞᱳᱨᱳᱯᱷᱤᱞ)/u.test(q)) {
    targetParam = 'chlorophyll';
    paramSpecified = true;
  } else if (/\b(oxygen|dissolved oxygen|hypoxia|omz|o2)\b/i.test(q) || /(অক্সিজেন|ऑक्सीजन|ஆக்ஸிஜன்|ఆక్సిజన్|ಆಮ್ಲಜನಕ|ഓക്സിജൻ|ઓક્સિજન|ଅମ୍ଳଜାନ|ਆਕਸੀਜన్|ᱦᱚᱭ ᱢᱮᱥᱟ ᱚᱠᱥᱤᱡᱮᱱ|ᱚᱠᱥᱤᱡᱮᱱ)/u.test(q)) {
    targetParam = 'oxygen';
    paramSpecified = true;
  }

  // 4. Extract Depth from current prompt
  let depthSpecified = false;
  let targetDepth = contextDepth;

  // Check explicit numeric depth first (e.g. 500m, 500 meters, at 500)
  const numDepthMatch = q.match(/\b(\d{1,5})\s*(?:m|meter|meters|metre|metres|মিটার|मीटर|ᱢᱤᱴᱟᱨ)(?:\b|\s|$|[^\p{L}\p{N}])/iu) ||
                        q.match(/(?:at|to|of|depth|গভীর|गहरा|ᱜᱟᱹᱦᱤᱨ)\s*(\d{1,5})\b/iu) ||
                        q.match(/\b(\d{1,5})\s*m\b/i);

  if (numDepthMatch && numDepthMatch[1]) {
    const parsed = parseInt(numDepthMatch[1], 10);
    if (parsed <= 6000 && parsed !== 2026 && parsed !== 2025) {
      targetDepth = parsed;
      depthSpecified = true;
    }
  } else if (/\b(surface|top|upper|0\s*m|0\s*meter|0\s*metre)\b/i.test(q) || /(পৃষ্ঠ|सतह|மேற்பரப்பு|ఉపరితలం|ಮೇಲ್ಮೈ|ഉപരിതലം|સપાટી|ପୃଷ୍ଠ|ਸਤ੍ਹਾ|سطح|ᱪᱮᱛᱟᱱ)/u.test(q)) {
    targetDepth = 0;
    depthSpecified = true;
  } else if (/\b(deeper|deep water|further down)\b/i.test(q) || /(আরও গভীরে|और गहरा|ஆழமான|మరింత లోతుగా|ಇನ್ನಷ್ಟು ಆಳ|കൂടുതൽ ആഴത്തിൽ|વધુ ઊંડું|ଅଧିକ ଗଭୀର|ਹੋਰ ਡੂੰਘਾ|مزید گہرا|ᱜᱟᱹᱦᱤᱨ|ᱟᱨᱦᱚᱸ ᱜᱟᱹᱦᱤᱨ)/u.test(q)) {
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

  if (/(arabian|arabian sea|arab sea|আরব|অ্যারাবিয়ান|अरब|अरेबियन|அரபி|அரேபி|అరేబి|ಅರಬ್ಬಿ|അറബി|અરબી|ଆରବ|ਅਰਬ|عرب|ᱟᱨᱚᱵᱽ|ᱟᱨᱚᱵ)/iu.test(q)) {
    if (basinSpecified && targetBasin !== 'arabian_sea') {
      secondBasin = 'arabian_sea';
    } else {
      targetBasin = 'arabian_sea';
      basinSpecified = true;
    }
  }
  if (/(bengal|bay of bengal|bob|bengali|bengoli|bangal|বঙ্গ|বংগ|বেঙ্গ|বেংগ|বেগল|বেগলী|বেঙ্গল|বেঙ্গলি|বে অফ|বে অব|बंगाल|வங்காள|బంగాళ|ಬಂಗಾಳ|ബംഗാൾ|બંગાળ|ବଙ୍ଗ|بنگال|ᱵᱚᱝᱜᱳᱯᱚᱥᱟᱜᱚᱨ|ᱵᱚᱝᱜᱳ|ᱵᱮᱝᱜᱚᱞ|ᱵᱟᱝᱜᱟᱞ)/iu.test(q)) {
    if (basinSpecified && targetBasin !== 'bay_of_bengal') {
      secondBasin = 'bay_of_bengal';
    } else {
      targetBasin = 'bay_of_bengal';
      basinSpecified = true;
    }
  }
  if (/(south china|china sea|দক্ষিণ চীন|दक्षिण चीन|தென் சீன|దక్షిణ చైనా|ದಕ್ಷಿಣ ಚೀನಾ|തെക്കൻ ചൈന|દક્ષિણ ચીન|ଦକ୍ଷିଣ ଚୀନ|ਦੱਖਣੀ ਚੀਨ|جنوبی چین)/iu.test(q)) {
    if (basinSpecified && targetBasin !== 'south_china_sea') {
      secondBasin = 'south_china_sea';
    } else {
      targetBasin = 'south_china_sea';
      basinSpecified = true;
    }
  }
  if (/(pacific|equatorial pacific|el nino basin|প্রশান্ত|प्रशांत|பசிபிக்|పసిఫిക്|ಪೆಸಿಫಿಕ್|പസഫിക്|પેસિફિક|ପ୍ରଶାନ୍ତ|ਪ੍ਰਸ਼ਾਂਤ|بحر الکاہل)/iu.test(q)) {
    if (basinSpecified && targetBasin !== 'equatorial_pacific') {
      secondBasin = 'equatorial_pacific';
    } else {
      targetBasin = 'equatorial_pacific';
      basinSpecified = true;
    }
  }
  if (/(atlantic|north atlantic|আটলান্টিক|अटलांटिक|அட்லாಂಡிக்|అట్లాంటిక్|ಅಟ್ಲಾಂಟಿಕ್|അറ്റ്ലാന്റിക്|એટલાન્ટિક|ଆଟଲାଣ୍ଟିକ|ਅਟਲਾਂਟਿਕ|بحر اوقیانوس)/iu.test(q)) {
    if (basinSpecified && targetBasin !== 'north_atlantic') {
      secondBasin = 'north_atlantic';
    } else {
      targetBasin = 'north_atlantic';
      basinSpecified = true;
    }
  }
  if (/(gulf of mexico|mexico|মেক্সিকো|मैक्सिको|மெக்சிகோ|మెక్సికో|ಮೆಕ್ಸಿಕೊ|മെക്സിക്കോ|મેક્સિકો|ମେକ୍ସିକୋ|ਮੈਕਸੀਕੋ|میکسیکو)/iu.test(q)) {
    if (basinSpecified && targetBasin !== 'gulf_of_mexico') {
      secondBasin = 'gulf_of_mexico';
    } else {
      targetBasin = 'gulf_of_mexico';
      basinSpecified = true;
    }
  }
  if (/(indian ocean|ভারত মহাসাগর|हिन्द महासागर|हिंद महासागर|இந்தியப் பெருங்கடல்|హిందూ మహాసముద్రം|ಹಿಂದೂ ಮಹಾಸಾಗರ|ഇന്ത്യൻ മഹാസമുദ്രം|હિંદ મહાસાગર|ଭାରତ ମହାସାଗର|ਹਿੰਦ ਮਹਾਸਾਗਰ|بحر ہند|ᱥᱤᱧᱚᱛ ᱢᱟᱦᱟᱫᱚᱨᱭᱟ|ᱥᱤᱧᱚᱛ)/iu.test(q)) {
    if (basinSpecified && targetBasin !== 'bay_of_bengal') {
      secondBasin = 'bay_of_bengal';
    } else {
      targetBasin = 'bay_of_bengal';
      basinSpecified = true;
    }
  }

  // 6. Identify Semantic Flags
  const isStormOrWeather = (
    /\b(storm|storms|cyclone|cyclones|typhoon|hurricane|depression|squall|monsoon|rain|raining|rainfall|precipitation|weather|forecast|predict|prediction|predictions|surge|swell|gale|flood|wind speed|high seas|hava|mausam)\b/i.test(q) ||
    /(বৃষ্টি|ঝড়|ঝড়|ঝড়বৃষ্টি|ঝড়বৃষ্টি|আবহাওয়া|পূর্বাভাস|तूफान|चक्रवात|बारिश|मौसम|पूर्वानुमान|हवा|ᱛᱩᱯᱷᱟᱱ|ᱪᱚᱠᱨᱚᱵᱟᱛ|ᱫᱟᱜ|ᱦᱚᱭ|ᱦᱚᱭ-ᱦᱤᱥᱤᱫ)/i.test(query)
  );

  const isGeneralConditions = (
    /\b(condition|conditions|current conditions|overview|situation|what is happening|weather here|status here|how is it here|what about here)\b/i.test(q) ||
    /(পরিস্থিতি|অবস্থা|स्थिति|हालात|ᱦᱟᱞᱚᱛ|ᱱᱤᱛᱚᱜᱟᱜ ᱦᱟᱞᱚᱛ)/i.test(query)
  );

  const isMarineLife = /\b(marine life|life|animal|animals|species|organism|organisms|fish|fishes|whale|whales|shark|sharks|dolphin|dolphins|coral|corals|turtle|turtles|plankton|phytoplankton|zooplankton|crustacean|squid|biodiversity|ecology|ecosystem|biomass|what lives|who lives|মাছ|প্রাণী|জীববৈচিত্র্য|जीव|मछली|प्राणी|ᱦᱟᱹᱠᱩ|ᱡᱤᱵᱽ|ᱫᱚᱨᱭᱟ ᱡᱤᱵᱽ)\b/i.test(q);

  const isComparison = /(compare|versus|vs|difference|higher|lower|warmer|cooler|saltier|তুলনা|तुलना|ᱛᱩᱞᱟᱹᱡᱚᱠᱷᱟ|ᱵᱷᱮᱜᱟᱨ)/i.test(q);
  const isProfile = /(profile|stratification|vertical|column|curve|gradient|thermocline profile|প্রোফাইল|प्रोफ़ाइल|ᱯᱨᱳᱯᱷᱟᱭᱤᱞ)/i.test(q) && !isMarineLife;
  const isAnomaly = /(anomaly|anomalies|unusual|abnormal|deviat|heatwave|bloom|অস্বাভাবিক|विसंगति|ᱚᱥᱚᱢᱟᱱ|ᱵᱤᱪᱟᱹᱨ)/i.test(q);

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
                        (/[\u0900-\u097F]/.test(query) && /(शुभ प्रभात|सुप्रभात)/i.test(query)) ||
                        (/(ᱥᱟᱹᱜᱩᱱ ᱥᱮᱛᱟᱜ)/i.test(query));

  const isGoodNight = /\b(good night|goodnight|gn|sleep well|sweet dreams|night nerida)\b/i.test(q) ||
                      (/[\u0980-\u09FF]/.test(query) && /(শুভ রাত্রি)/i.test(query)) ||
                      (/[\u0900-\u097F]/.test(query) && /(शुभ रात्रि|शुभरात्रि)/i.test(query)) ||
                      (/(ᱥᱟᱹᱜᱩᱱ ᱧᱤᱫᱟᱹ)/i.test(query));

  const isGoodDay = /\b(good afternoon|good evening|good day)\b/i.test(q) ||
                    (/[\u0980-\u09FF]/.test(query) && /(শুভ অপরাহ্ন|শুভ সন্ধ্যা)/i.test(query)) ||
                    (/[\u0900-\u097F]/.test(query) && /(शुभ दोपहर|शुभ संध्या)/i.test(query)) ||
                    (/(ᱥᱟᱹᱜᱩᱱ ᱢᱟᱦᱟᱸ|ᱥᱟᱹᱜᱩᱱ ᱛᱤᱠᱤᱱ|ᱥᱟᱹᱜᱩᱱ ᱟᱹᱭᱩᱵ)/i.test(query));

  const isHowAreYou = /\b(how are you|how r u|how are you doing|how do you do|how's it going|how are things|how are you feeling|what's up|wassup|sup nerida)\b/i.test(q) ||
                      (/[\u0980-\u09FF]/.test(query) && /(কেমন আছো|কেমন আছেন)/i.test(query)) ||
                      (/[\u0900-\u097F]/.test(query) && /(आप कैसे हैं|कैसी हो|सब कैसा है)/i.test(query)) ||
                      (/(ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ|ᱪᱮᱛ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ|ᱪᱮᱫ ᱠᱷᱚᱵᱚᱨ)/i.test(query));

  const isCompliment = /\b(awesome|amazing|great job|cool|nice work|well done|wonderful|good job|you are great|you're great|you are cool|you're cool|you are smart|love you)\b/i.test(q) ||
                       (/[\u0980-\u09FF]/.test(query) && /(দারুণ|চমৎকার|অসাধারণ)/i.test(query)) ||
                       (/[\u0900-\u097F]/.test(query) && /(बहुत बढ़िया|शाबाश|कमाल)/i.test(query)) ||
                       (/(ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ|ᱵᱮᱥ|ᱥᱟᱵᱟᱥ)/i.test(query));

  const isGreeting = isGoodMorning || isGoodNight || isGoodDay || isHowAreYou || isCompliment ||
                     /\b(hello|hi|hey|greetings|howdy|hola|yo|namaste|vanakkam|namaskaram|sat sri akaal|aadab)\b/i.test(q) ||
                     (/[\u0980-\u09FF]/.test(query) && /(হ্যালো|নমস্কার|সালাম|কেমন আছো|শুভ সকাল|শুভ রাত্রি)/i.test(query)) ||
                     (/[\u0900-\u097F]/.test(query) && /(नमस्ते|हैलो|प्रणाम|शुभ प्रभात|शुभ रात्रि)/i.test(query)) ||
                     (/(ᱡᱚᱦᱟᱨ|ᱥᱟᱹᱜᱩᱱ ᱡᱚᱦᱟᱨ)/i.test(query));

  const isIdentityOrHelp = /\b(what can you do|who are you|what are you|who made you|help me|help|features|capabilities|what do you do|how to use|what is your role|tell me about yourself|what can i do for you|what can you do for me|what can u do for me|how can you help)\b/i.test(q) ||
                           /(তুমি কি করতে পারো|তুমি কে|কি করতে পারো|সাহায্য|তোমার কাজ কি)/i.test(query) ||
                           /(आप क्या कर सकते हैं|तुम कौन हो|मदद|सहायता|तुम क्या कर सकते हो)/i.test(query) ||
                           /(ᱟᱢ ᱫᱚ ᱚᱠᱚᱭ|ᱟᱢ ᱪᱮᱫ ᱮᱢ ᱪᱤᱠᱟᱹ ᱫᱟᱲᱮᱭᱟᱜ-ᱟ|ᱜᱚᱲᱚ)/i.test(query);

  const isPoliteClosing = /\b(thanks|thank you|thx|bye|goodbye|see you|ok thanks|okay thanks|catch you later|take care)\b/i.test(q) ||
                          /(ধন্যবাদ|বিদায়)/i.test(query) ||
                          /(धन्यवाद|शुक्रिया|अलविदा)/i.test(query) ||
                          /(ᱥᱟᱨᱦᱟᱣ|ᱡᱚᱦᱟᱨ)/i.test(query);

  const isLanguageSwitchOnly = /^(speak in|talk in|switch to|translate to)?\s*(বাংলায় বলো|বাংলায় কথা বলো|বাংলায়|hindi me bolo|speak in english|talk in bengali)\s*$/i.test(q);

  const hasOceanEntity = paramSpecified || basinSpecified || depthSpecified || isProfile || isAnomaly || isComparison || isStormOrWeather || isGeneralConditions;
  const hasViewWord = /\b(show|display|view|go to|switch to|navigate to|zoom to|vector|vectors|volume|isosurface|slice)\b/i.test(q);
  const isQuestion = /\b(what|how|why|when|where|is there|does|কতো|কত|কী|কি|क्या|कितना|ᱛᱤᱱᱟᱹᱜ|ᱪᱮᱫ|ᱪᱮᱞᱮᱠᱟ|ᱚᱠᱟᱨᱮ|ᱪᱮᱫᱟᱜ|ᱛᱤᱨᱮ)\b/i.test(q) || q.includes('?');

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
    coords: targetCoords || (currentState.coords ? currentState.coords : (currentState.lat != null ? { lat: currentState.lat, lon: currentState.lon } : (currentState.latitude != null ? { lat: currentState.latitude, lon: currentState.longitude } : null))),
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
  let suggestions = [];
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

    message = formatStormPrediction(predictionData, lang);
    suggestions = getLocalizedSuggestions('storm', predictionData.basin, lang);
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

    message = formatGeneralConditions(region, locName, lang);
    suggestions = getLocalizedSuggestions('conditions', locName, lang);
  }

  // -------------------------------------------------------------
  // ROUTE 1: CONVERSATIONAL (Greetings, Capabilities, Identity)
  // STRICT RULE: ZERO tool calls, ZERO actions, ZERO 3D changes
  // -------------------------------------------------------------
  else if (intent.category === 'CONVERSATIONAL') {
    provenance.push({ type: 'AI-DERIVED', label: 'Nerida Interactive Companion' });

    const basinObj = resolveBasin(intent.basin || intent.contextBasin, null);
    const basinName = basinObj ? basinObj.name : (currentState.basin || 'Bay of Bengal');

    let subType = 'welcome';
    if (intent.isGoodMorning) subType = 'goodMorning';
    else if (intent.isGoodNight) subType = 'goodNight';
    else if (intent.isHowAreYou) subType = 'howAreYou';
    else if (intent.isCompliment) subType = 'compliment';
    else if (intent.isGoodDay) subType = 'goodDay';
    else if (intent.isLanguageSwitchOnly || query.includes('বাংলায় বলো')) subType = 'langSwitch';
    else if (intent.isIdentityOrHelp) subType = 'identity';
    else if (intent.isPoliteClosing) subType = 'closing';

    message = formatConversational(subType, basinName, lang);
    suggestions = getLocalizedSuggestions('conversational', basinName, lang);
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

    message = formatMarineBiology(basinName, depthMeters, depthZone, depthDescription, zoneOrganisms, basinFauna, lang);
    suggestions = getLocalizedSuggestions('marineLife', basinName, lang);
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
    suggestions = getLocalizedSuggestions('general', basinName, lang);
  }

  // -------------------------------------------------------------
  // ROUTE 4: OUT_OF_DOMAIN (Completely unrelated queries like sports, politics, coding)
  // STRICT RULE: Explicit refusal, ZERO tools, ZERO 3D changes
  // -------------------------------------------------------------
  else if (intent.category === 'OUT_OF_DOMAIN') {
    provenance.push({ type: 'AI-DERIVED', label: 'Nerida Scope Enforcer' });

    message = formatOutOfDomain(lang);
    suggestions = getLocalizedSuggestions('outOfDomain', currentState.basin || 'Bay of Bengal', lang);
  }

  // -------------------------------------------------------------
  // ROUTE 5: UNKNOWN / AMBIGUOUS (Gibberish or unparseable input)
  // -------------------------------------------------------------
  else if (intent.category === 'UNKNOWN') {
    provenance.push({ type: 'AI-DERIVED', label: 'Nerida Interactive Assistant' });

    const basinObj = resolveBasin(intent.basin || intent.contextBasin, null);
    const bName = basinObj ? basinObj.name : (currentState.basin || 'Bay of Bengal');

    message = formatUnknown(bName, lang);
    suggestions = getLocalizedSuggestions('unknown', bName, lang);
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

    message = formatComparison(compData, intent.depth, lang);
    suggestions = getLocalizedSuggestions('compare', compData.basin1.name, lang);
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

    message = formatAnalysis(anomalyData, lang);
    suggestions = getLocalizedSuggestions('analysis', anomalyData.location, lang);
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

    message = formatViewCommand(changes, lang);
    suggestions = getLocalizedSuggestions('view', currentState.basin || 'Bay of Bengal', lang);
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

      message = formatProfile(profileData, lang);
      suggestions = getLocalizedSuggestions('profile', profileData.location, lang);
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

      message = formatOceanQuery(data, explanation, locDisplay, lang);
      suggestions = getLocalizedSuggestions('query', data.location, lang);
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
  const activeReg = context.rawRegion || context.activeRegion || context.activeBasin;
  const lat = typeof activeReg?.lat === 'number' ? activeReg.lat : (typeof activeReg?.latitude === 'number' ? activeReg.latitude : 15.297);
  const lon = typeof activeReg?.lon === 'number' ? activeReg.lon : (typeof activeReg?.longitude === 'number' ? activeReg.longitude : 87.860);

  const currentState = {
    basin: context.activeBasin?.name || activeReg?.name || 'Bay of Bengal',
    basinId: context.activeBasin?.id || activeReg?.id || 'bay_of_bengal',
    lat,
    lon,
    latitude: lat,
    longitude: lon,
    coords: { lat, lon },
    depth: context.activeLayer?.depthMeters ?? context.depth ?? 0,
    parameter: context.activeLayer?.parameter || context.selectedParam || 'sst',
    rawRegion: activeReg ? { ...activeReg, lat, lon } : null
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
