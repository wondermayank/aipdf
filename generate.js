// api/generate.js
// Vercel serverless function — proxies document-generation requests to Groq
// (openai/gpt-oss-120b) so the browser never sees your API key.
//
// Setup:
//   1. Get a free API key at https://console.groq.com
//   2. In your Vercel project: Settings -> Environment Variables -> add
//        GROQ_API_KEY = <your key>
//   3. Deploy. The frontend automatically calls this endpoint at /api/generate.
//
// Model note: Groq deprecated llama-3.3-70b-versatile in June 2026. This uses
// their current recommended replacement, openai/gpt-oss-120b, a reasoning
// model — include_reasoning:false and reasoning_effort:'low' keep it fast and
// keep the internal reasoning out of the response you need to parse as JSON.
// Check https://console.groq.com/docs/models if this model is ever retired.
//
// If you'd rather use a different provider (OpenAI, Anthropic, etc.), just
// change the fetch URL, headers and model name below — the request/response
// shape the frontend expects stays the same.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt, format } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server' });
    return;
  }

  const schemaInstructions = {
    word: 'Respond with ONLY valid JSON of the shape {"title": string, "sections": [{"heading": string, "body": string}]}. Include 3 to 6 sections. No markdown, no code fences, no commentary — JSON only.',
    pdf: 'Respond with ONLY valid JSON of the shape {"title": string, "sections": [{"heading": string, "body": string}]}. Include 3 to 6 sections. No markdown, no code fences, no commentary — JSON only.',
    ppt: 'Respond with ONLY valid JSON of the shape {"title": string, "slides": [{"title": string, "bullets": [string]}]}. Include 5 to 8 slides, each with 2 to 4 short bullets. No markdown, no code fences, no commentary — JSON only.',
    excel: 'Respond with ONLY valid JSON of the shape {"title": string, "table": {"headers": [string], "rows": [[string]]}}. Include 5 to 12 rows. No markdown, no code fences, no commentary — JSON only.',
    improve: 'You will be given raw text supplied by the user. Fix grammar, spelling and clarity, tighten the structure, and add a short clarifying note where something is ambiguous or could be expanded — do not invent facts that contradict the original. Preserve the original meaning and intent. Respond with ONLY valid JSON of the shape {"title": string, "sections": [{"heading": string, "body": string}]}, breaking the improved text into logical sections. No markdown, no code fences, no commentary — JSON only.'
  };

  const instruction = schemaInstructions[format] || schemaInstructions.word;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 0.6,
        max_tokens: 2000,
        reasoning_effort: 'low',
        include_reasoning: false,
        messages: [
          { role: 'system', content: `You generate structured content for a document-generation tool. ${instruction}` },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      res.status(502).json({ error: 'Upstream generation failed', detail: errText });
      return;
    }

    const groqData = await groqRes.json();
    let raw = groqData.choices?.[0]?.message?.content || '';
    raw = raw.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    // Reasoning models occasionally wrap JSON with stray text — extract the
    // outermost {...} block as a safety net before parsing.
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.slice(firstBrace, lastBrace + 1);
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      res.status(502).json({ error: 'Model did not return valid JSON', raw });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err) });
  }
};
