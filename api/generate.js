// api/generate.js
// Vercel serverless function — proxies document-generation requests to Groq
// (qwen/qwen3.8-27b, with openai/gpt-oss-120b as automatic fallback) so the
// browser never sees your API key.
//
// Streams the model's raw text back to the browser as it's generated (see
// "Streaming" note below), so the frontend can show live progress instead of
// a static spinner. JSON parsing of the final text happens on the client.
//
// Setup:
//   1. Get a free API key at https://console.groq.com
//   2. In your Vercel project: Settings -> Environment Variables -> add
//        GROQ_API_KEY = <your key>
//   3. Deploy. The frontend automatically calls this endpoint at /api/generate.
//
// Model note: Groq's newest model is qwen/qwen3.8-27b (Preview tier). It runs in instruct mode here
// (reasoning_effort:'none') — no thinking tokens, fastest and cheapest for
// short structured-JSON output. Because Preview models can be retired at
// short notice, the function automatically falls back to the production
// model openai/gpt-oss-120b if the primary call fails. To change either,
// edit the MODELS list below. Current list: https://console.groq.com/docs/models
//
// Streaming: Vercel's Node.js runtime supports progressive res.write() calls
// (see https://vercel.com/docs/functions/streaming-functions). This function
// consumes Groq's OpenAI-compatible SSE stream and forwards just the text
// deltas (not the SSE envelope) to the client as plain text, so the browser
// only has to accumulate a string, not parse SSE itself. This part couldn't
// be tested against a live Groq key from where this was built — if it
// doesn't behave once deployed, the frontend's demo-mode fallback still
// covers you, but check Vercel's function logs first.
//
// If you'd rather use a different provider (OpenAI, Anthropic, etc.), just
// change the fetch URL, headers and model name below — the request/response
// shape the frontend expects stays the same (a plain-text stream that, once
// complete, parses as {title, sections|slides|table} JSON).

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
    word: 'Respond with ONLY valid JSON of the shape {"title": string, "sections": [{"heading": string, "body": string}]}. Include 3 to 6 sections. Where it helps readability, use **bold** for key terms and "- " bullet lines within a section\'s body text. No markdown code fences, no commentary — JSON only.',
    pdf: 'Respond with ONLY valid JSON of the shape {"title": string, "sections": [{"heading": string, "body": string}]}. Include 3 to 6 sections. Where it helps readability, use **bold** for key terms and "- " bullet lines within a section\'s body text. No markdown code fences, no commentary — JSON only.',
    md: 'Respond with ONLY valid JSON of the shape {"title": string, "sections": [{"heading": string, "body": string}]}. Include 3 to 6 sections. Where it helps readability, use **bold** for key terms and "- " bullet lines within a section\'s body text. No markdown code fences, no commentary — JSON only.',
    ppt: 'Respond with ONLY valid JSON of the shape {"title": string, "slides": [{"title": string, "bullets": [string]}]}. Include 5 to 8 slides, each with 2 to 4 short bullets. No markdown code fences, no commentary — JSON only.',
    excel: 'Respond with ONLY valid JSON of the shape {"title": string, "table": {"headers": [string], "rows": [[string]]}}. Include 5 to 12 rows. No markdown code fences, no commentary — JSON only.',
    improve: 'You will be given raw text supplied by the user. Fix grammar, spelling and clarity, tighten the structure, and add a short clarifying note where something is ambiguous or could be expanded — do not invent facts that contradict the original. Preserve the original meaning and intent. Where it helps readability, use **bold** for key terms and "- " bullet lines within a section\'s body text. Respond with ONLY valid JSON of the shape {"title": string, "sections": [{"heading": string, "body": string}]}, breaking the improved text into logical sections. No markdown code fences, no commentary — JSON only.'
  };

  const instruction = schemaInstructions[format] || schemaInstructions.word;

  // Tried in order; the first one that answers with a stream wins.
  const MODELS = [
    {
      // Newest Groq model (Preview). Instruct mode = no reasoning tokens.
      model: 'qwen/qwen3.8-27b',
      params: { temperature: 0.7, top_p: 0.8, reasoning_effort: 'none' }
    },
    {
      // Production fallback. Reasoning model — keep effort low and hide it.
      model: 'openai/gpt-oss-120b',
      params: { temperature: 0.6, reasoning_effort: 'low', include_reasoning: false }
    }
  ];

  const messages = [
    { role: 'system', content: `You generate structured content for a document-generation tool. ${instruction}` },
    { role: 'user', content: prompt }
  ];

  let groqRes;
  let lastError = '';
  for (const { model, params } of MODELS) {
    try {
      groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model, max_tokens: 2000, stream: true, messages, ...params })
      });
    } catch (err) {
      lastError = String(err);
      groqRes = null;
      continue;
    }
    if (groqRes.ok && groqRes.body) break;
    lastError = `${model}: ${await groqRes.text().catch(() => '')}`;
    console.error('Groq model failed, trying next:', lastError);
    groqRes = null;
  }

  if (!groqRes) {
    res.status(502).json({ error: 'Upstream generation failed', detail: lastError });
    return;
  }

  // From here on we're committed to a streamed plain-text response, since
  // headers are about to be sent — errors after this point can only be
  // logged server-side, not returned as a clean JSON error to the client.
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Content-Type-Options': 'nosniff'
  });

  const reader = groqRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // last entry may be a partial line — keep it for the next chunk

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content || '';
          if (delta) res.write(delta);
        } catch (e) {
          // Partial/malformed SSE line — skip it, more data may complete it.
        }
      }
    }
  } catch (err) {
    console.error('Stream read error:', err);
  }

  res.end();
};
