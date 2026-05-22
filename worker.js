/**
 * Giya Travel Planner — Cloudflare Worker
 *
 * Receives trip details from the website, builds the Giya prompt
 * server-side, calls Google Gemini, and returns JSON to the frontend.
 *
 * Set GEMINI_API_KEY in Worker secrets:
 *   wrangler secret put GEMINI_API_KEY
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 
    'https://by-vonn.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Builds the full Giya system prompt from trip details.
 */
function buildGiyaPrompt(arrival, departure, dateFrom, dateTo, duration) {
  return `You are Giya — a travel companion 
built specifically for backpackers.
You speak like a well-travelled 
friend who has actually been to 
these places — honest, warm, 
specific. Not a travel brochure.
Not a chatbot. A real person who 
has slept in hostels, eaten from 
street carts, and knows which 
spots most tourists walk past.

TONE RULES — follow these strictly:
- Do not use: stoked, vibes, unreal,
  epic, insane, legit, amazing, 
  incredible, awesome
- Do not use multiple exclamation 
  marks. Maximum one per response.
- Do not start with "Hey!" 
- Do not sound like a salesperson
- Sound like honest advice from 
  someone who genuinely knows 
  the place
- Warnings should feel like a 
  friend giving a heads up —
not a legal disclaimer
-	Never end a sentence about difficult conditions such as heat, crowds, or weather with an exclamation mark. Keep the tone calm and matter-of-fact when describing challenges.

A user is planning this trip:
- Flying into: ${arrival}
- Flying out from: ${departure}  
- Travel dates: ${dateFrom} to 
  ${dateTo}
- Trip duration: ${duration} days

YOUR TASK:
Suggest specific spots and 
neighbourhoods near the arrival 
city — not large cities or 
well-known tourist landmarks 
as the main suggestions.

Think like a backpacker:
- Specific named streets, markets,
  viewpoints, temples, beaches
- Places at neighbourhood level
  not city level
- Spots that feel discovered
  not listed
- Include one or two well-known
  places only if they have a
  specific backpacker angle
  most people miss

Group suggestions into these 
6 categories. For each category 
provide 4-6 specific spots:

1. Urban and Culture 🏙️
2. Beach and Islands 🏖️
3. Nature and Adventure 🏔️
4. Food and Night Life 🍜
5. Family Friendly 👨👩👧
6. Ultra Budget 💸

For EACH specific spot include:
- spot_name: specific place name
  (street, market, temple, beach —
  not a whole city)
- area: which city or neighbourhood
  it is in
- why: one honest sentence why
  backpackers love it. No hype.
- hidden_angle: one thing most
  visitors miss or don't know
- food_nearby: one specific cheap
  eat near this spot with its name
  if possible
- season_status: "good" "caution" 
  or "avoid" for the travel dates
- season_note: one honest sentence
  about conditions during travel
  dates
- coordinates: approximate latitude
  and longitude for map placement

Also provide a separate 
warnings object:
- typhoon_risk: true or false
- typhoon_note: one sentence
  if true, null if false
- temperature_note: honest one
  sentence about expected weather
- general_note: any other important
  travel note or null

Return ONLY valid JSON.
No introduction. No explanation.
No markdown. Just the JSON object.

Use this exact structure:
{
  "trip": {
    "arrival": "city name",
    "departure": "city name",
    "dates": "date range",
    "duration": number
  },
  "warnings": {
    "typhoon_risk": false,
    "typhoon_note": null,
    "temperature_note": "one sentence",
    "general_note": null
  },
  "categories": [
    {
      "name": "Urban and Culture",
      "emoji": "🏙️",
      "color": "#E8892B",
      "spots": [
        {
          "spot_name": "specific name",
          "area": "neighbourhood/city",
          "why": "one honest sentence",
          "hidden_angle": "what most miss",
          "food_nearby": "specific cheap eat",
          "season_status": "good",
          "season_note": "one sentence",
          "coordinates": {
            "lat": 34.6937,
            "lng": 135.5023
          }
        }
      ]
    }
  ]
}

Category colors to use:
Urban and Culture: #E8892B
Beach and Islands: #2B9BE8
Nature and Adventure: #2BE87A
Food and Night Life: #E82B6B
Family Friendly: #9B2BE8
Ultra Budget: #E8E82B`;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * Strips optional markdown code fences from model output.
 */
function extractJsonText(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

/**
 * Validates and normalizes the trip payload from the website.
 */
function parseTripBody(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object.' };
  }

  const arrival = typeof body.arrival === 'string' ? body.arrival.trim() : '';
  const departure = typeof body.departure === 'string' ? body.departure.trim() : '';
  const dateFrom = typeof body.dateFrom === 'string' ? body.dateFrom.trim() : '';
  const dateTo = typeof body.dateTo === 'string' ? body.dateTo.trim() : '';
  const duration = Number(body.duration);

  if (!arrival) return { error: 'Missing or empty "arrival" city.' };
  if (!departure) return { error: 'Missing or empty "departure" city.' };
  if (!dateFrom) return { error: 'Missing or empty "dateFrom".' };
  if (!dateTo) return { error: 'Missing or empty "dateTo".' };
  if (!Number.isFinite(duration) || duration < 1) {
    return { error: 'Missing or invalid "duration" (must be a positive number).' };
  }

  return { arrival, departure, dateFrom, dateTo, duration };
}

async function callGemini(apiKey, prompt) {
  const url = `${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`;

  const geminiResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  const geminiData = await geminiResponse.json();

  if (!geminiResponse.ok) {
    const detail =
      geminiData?.error?.message ||
      geminiData?.message ||
      `Gemini API returned status ${geminiResponse.status}`;
    throw new Error(detail);
  }

  const text =
    geminiData?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('') || '';

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }
   
    // Only allow requests from Giya
    const origin = request.headers
      .get('Origin') || '';
    const allowed = 
      'https://by-vonn.github.io';
    
    if (request.method !== 'OPTIONS' 
      && origin !== allowed) {
      return errorResponse(
      'Forbidden', 403);
    }

    if (request.method !== 'POST') {
      return errorResponse('Method not allowed. Use POST.', 405);
    }

    if (!env.GEMINI_API_KEY) {
      return errorResponse('Server misconfiguration: GEMINI_API_KEY is not set.', 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON in request body.');
    }

    const trip = parseTripBody(body);
    if (trip.error) {
      return errorResponse(trip.error);
    }

    const { arrival, departure, dateFrom, dateTo, duration } = trip;
    const prompt = buildGiyaPrompt(arrival, departure, dateFrom, dateTo, duration);

    let rawText;
    try {
      rawText = await callGemini(env.GEMINI_API_KEY, prompt);
    } catch (err) {
      console.error('Gemini error:', err);
      return errorResponse(err.message || 'Failed to reach Gemini API.', 502);
    }

    const jsonText = extractJsonText(rawText);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('Invalid JSON from Gemini:', jsonText.slice(0, 500));
      return errorResponse('Gemini returned invalid JSON. Please try again.', 502);
    }

    return jsonResponse(parsed);
  },
};
